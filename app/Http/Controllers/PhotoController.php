<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadPhotoRequest;
use App\Jobs\ModeratePhoto;
use App\Models\Photo;
use App\Services\ModerationAuditService;
use App\Services\PhotoProcessingService;
use App\Services\VideoProcessingService;
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
                // Poster de la vidéo : la miniature traverse le pipeline image,
                // le fichier vidéo non.
                'poster_url' => $photo->isVideo() ? $photo->viewUrl(thumbnail: true) : null,
                'media_type' => $photo->isVideo() ? 'video' : 'photo',
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

        $file = $request->file('photo');
        $isVideo = in_array(strtolower($file->getClientOriginalExtension()), ['mp4', 'mov', 'webm'], true);
        $isNaughty = $request->boolean('is_naughty');

        // Aucun floutage n'est produit pour une vidéo : une vidéo coquine ne
        // peut être protégée que par la galerie privée.
        $isPrivate = $request->boolean('is_private') || ($isVideo && $isNaughty);

        if ($isVideo) {
            $videos = app(VideoProcessingService::class);

            if (! $videos->isAvailable()) {
                return redirect()->back()->with('error', 'L’envoi de vidéos est momentanément indisponible.');
            }

            $stored = $videos->storeGalleryVideo($file);
        } else {
            $stored = app(PhotoProcessingService::class)->storePublicPhoto($file);
        }

        if (Photo::where('user_id', $user->id)->where('content_hash', $stored['content_hash'])->exists()) {
            return redirect()->back()->with('error', 'Ce média a déjà été ajouté à votre profil.');
        }

        // Les médias de galerie sont publiés immédiatement : la modération se
        // fait a posteriori (file admin + signalements). Seule la photo de
        // profil exige une validation préalable, via setPrimary().
        $photo = Photo::create([
            'user_id' => $user->id,
            'media_type' => $isVideo ? 'video' : 'photo',
            'path' => $stored['path'],
            'content_hash' => $stored['content_hash'],
            'thumbnail_path' => $stored['thumbnail_path'],
            'duration' => $stored['duration'] ?? null,
            'moderation_status' => 'pending',
            'is_approved' => true,
            'is_naughty' => $isNaughty,
            'is_private' => $isPrivate,
            'order' => $user->photos()->max('order') + 1,
        ]);

        if (! $isVideo) {
            ModeratePhoto::dispatch($photo->id);
        }

        return redirect()->back()->with(
            'success',
            $isVideo ? 'Vidéo ajoutée à votre galerie.' : 'Photo ajoutée à votre galerie.'
        );
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
        $disk = Storage::disk($photo->isVideo() ? 'local' : 'public');

        $disk->delete($photo->path);
        if ($photo->thumbnail_path) {
            $disk->delete($photo->thumbnail_path);
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
            ->through(function (Photo $photo) {
                $disk = Storage::disk($photo->isVideo() ? 'local' : 'public');
                $owner = $photo->user;
                $available = $owner !== null && $disk->exists($photo->path);
                $thumbnailAvailable = $owner !== null
                    && $photo->thumbnail_path !== null
                    && $disk->exists($photo->thumbnail_path);

                return [
                    'id' => $photo->id,
                    'url' => $available
                        ? route('admin.users.photos.file', [$owner, $photo])
                        : null,
                    'thumbnail_url' => $thumbnailAvailable
                        ? route('admin.users.photos.file', [$owner, $photo, 'thumb' => 1])
                        : null,
                    'media_type' => $photo->isVideo() ? 'video' : 'photo',
                    'available' => $available,
                    'is_naughty' => $photo->is_naughty,
                    'awaiting_avatar' => $photo->avatar_requested_at !== null,
                    'created_at' => $photo->created_at->toISOString(),
                    'user' => $owner,
                ];
            });

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
