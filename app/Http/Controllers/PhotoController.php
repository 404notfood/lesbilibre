<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadPhotoRequest;
use App\Jobs\ModeratePhoto;
use App\Models\Photo;
use App\Services\ModerationAuditService;
use App\Services\PhotoProcessingService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PhotoController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display user's photo gallery.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $photos = $user->photos()
            ->orderBy('order')
            ->get()
            ->map(fn (Photo $photo) => [
                'id' => $photo->id,
                'url' => $photo->viewUrl(),
                'is_primary' => $photo->is_primary,
                'is_naughty' => $photo->is_naughty,
                'moderation_status' => $photo->moderation_status,
                'rejection_reason' => $photo->rejection_reason,
                'avatar_requested' => $photo->avatar_requested_at !== null,
                'order' => $photo->order,
            ]);

        return Inertia::render('Photos/Index', [
            'photos' => $photos,
        ]);
    }

    /**
     * Upload a new photo.
     */
    public function store(UploadPhotoRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Check photo limit (e.g., 10 photos max)
        if ($user->photos()->count() >= 10) {
            return redirect()->back()->with('error', 'Vous avez atteint la limite de 10 photos.');
        }

        $processed = app(PhotoProcessingService::class)->storePublicPhoto($request->file('photo'));

        if (Photo::where('user_id', $user->id)->where('content_hash', $processed['content_hash'])->exists()) {
            return redirect()->back()->with('error', 'Cette image a déjà été ajoutée à votre profil.');
        }

        // Les photos de galerie sont publiées immédiatement : la modération se
        // fait a posteriori (file admin + signalements). Seule la photo de
        // profil exige une validation préalable, via setPrimary().
        $photo = Photo::create([
            'user_id' => $user->id,
            'path' => $processed['path'],
            'content_hash' => $processed['content_hash'],
            'thumbnail_path' => $processed['thumbnail_path'],
            'moderation_status' => 'pending',
            'is_approved' => true,
            'is_naughty' => $request->boolean('is_naughty'),
            'order' => $user->photos()->max('order') + 1,
        ]);

        ModeratePhoto::dispatch($photo->id);

        return redirect()->back()->with('success', 'Photo ajoutée à votre galerie.');
    }

    /**
     * Set a photo as primary.
     */
    public function setPrimary(Request $request, Photo $photo): RedirectResponse
    {
        $user = $request->user();

        if ($photo->user_id !== $user->id) {
            abort(403, 'Cette photo ne vous appartient pas.');
        }

        // Une photo sensible ne peut jamais servir d'avatar : elle s'afficherait
        // dans la découverte et les conversations, hors de tout consentement.
        if ($photo->is_naughty) {
            return redirect()->back()->with(
                'error',
                'Une photo sensible ne peut pas devenir votre photo de profil.'
            );
        }

        if ($photo->moderation_status === 'rejected') {
            return redirect()->back()->with('error', 'Cette photo a été refusée par la modération.');
        }

        // La photo de profil est le seul contenu soumis à validation préalable.
        if ($photo->moderation_status !== 'approved') {
            return redirect()->back()->with(
                'error',
                'Cette photo doit être validée par la modération avant de devenir votre photo de profil.'
            );
        }

        // Remove primary from other photos
        $user->photos()->update(['is_primary' => false]);

        // Set this photo as primary
        $photo->update(['is_primary' => true]);

        return redirect()->back()->with('success', 'Photo principale mise à jour.');
    }

    /**
     * Ask a moderator to approve this photo as the member's avatar.
     */
    public function requestAvatar(Request $request, Photo $photo): RedirectResponse
    {
        $user = $request->user();

        if ($photo->user_id !== $user->id) {
            abort(403, 'Cette photo ne vous appartient pas.');
        }

        if ($photo->is_naughty) {
            return redirect()->back()->with(
                'error',
                'Une photo sensible ne peut pas devenir votre photo de profil.'
            );
        }

        if ($photo->moderation_status === 'approved') {
            return redirect()->back()->with(
                'info',
                'Cette photo est déjà validée : vous pouvez la définir comme photo de profil.'
            );
        }

        $photo->update(['avatar_requested_at' => now()]);

        return redirect()->back()->with(
            'success',
            'Demande envoyée. Votre photo de profil sera validée sous 48 h.'
        );
    }

    /**
     * Delete a photo.
     */
    public function destroy(Request $request, Photo $photo): RedirectResponse
    {
        $user = $request->user();

        if ($photo->user_id !== $user->id) {
            abort(403, 'Cette photo ne vous appartient pas.');
        }

        // Delete files
        Storage::disk('public')->delete($photo->path);
        if ($photo->thumbnail_path) {
            Storage::disk('public')->delete($photo->thumbnail_path);
        }

        // Delete record
        $photo->delete();

        return redirect()->back()->with('success', 'Photo supprimée.');
    }

    /**
     * Admin: List photos awaiting a moderation decision.
     *
     * Gallery photos are already visible to members; this queue exists so a
     * moderator can review them after the fact and retire anything unwanted.
     * Photos a member wants as their avatar are shown first, since those are
     * blocked until approved.
     */
    public function pending(Request $request): Response
    {
        $photos = Photo::with('user:id,name,pseudo,email')
            ->where('moderation_status', 'pending')
            ->orderByDesc('avatar_requested_at')
            ->latest()
            ->paginate(20)
            ->through(fn (Photo $photo) => [
                'id' => $photo->id,
                'path' => asset('storage/'.$photo->path),
                'thumbnail_path' => $photo->thumbnail_path
                    ? asset('storage/'.$photo->thumbnail_path)
                    : null,
                'is_naughty' => $photo->is_naughty,
                'awaiting_avatar' => $photo->avatar_requested_at !== null,
                'created_at' => $photo->created_at->toISOString(),
                'user' => $photo->user,
            ]);

        return Inertia::render('Admin/Photos/Pending', [
            'photos' => $photos,
        ]);
    }

    /**
     * Admin: Approve a photo.
     */
    public function approve(Request $request, Photo $photo): RedirectResponse
    {
        $this->authorize('update', $photo);

        $photo->update(['is_approved' => true, 'moderation_status' => 'approved']);

        // La membre attendait cette validation pour en faire son avatar :
        // on la promeut directement plutôt que de lui demander de revenir.
        if ($photo->avatar_requested_at && ! $photo->is_naughty) {
            Photo::where('user_id', $photo->user_id)->update(['is_primary' => false]);
            $photo->update(['is_primary' => true, 'avatar_requested_at' => null]);
        }

        // Trigger badge check
        $photo->load('user');
        app(ModerationAuditService::class)->record(
            $request->user(),
            $photo,
            'photo_approved',
            $photo->user
        );
        \App\Events\PhotoApproved::dispatch($photo);

        return redirect()->back()->with('success', 'Photo approuvée.');
    }

    /**
     * Admin: Reject a photo.
     */
    public function reject(Request $request, Photo $photo): RedirectResponse
    {
        $this->authorize('update', $photo);

        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        // Un refus retire la photo de la galerie et annule toute demande d'avatar.
        $photo->update([
            'rejection_reason' => $request->rejection_reason,
            'moderation_status' => 'rejected',
            'is_approved' => false,
            'is_primary' => false,
            'avatar_requested_at' => null,
        ]);

        app(ModerationAuditService::class)->record(
            $request->user(),
            $photo,
            'photo_rejected',
            $photo->user,
            'photo_rejected',
            $request->rejection_reason
        );

        return redirect()->back()->with('success', 'Photo rejetée.');
    }
}
