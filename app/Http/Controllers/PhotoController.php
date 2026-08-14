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

        $photos = $user->photos()->orderBy('order')->get();

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

        // Create photo record
        $photo = Photo::create([
            'user_id' => $user->id,
            'path' => $processed['path'],
            'content_hash' => $processed['content_hash'],
            'thumbnail_path' => $processed['thumbnail_path'],
            'moderation_status' => 'pending',
            'is_naughty' => $request->boolean('is_naughty'),
            'order' => $user->photos()->max('order') + 1,
        ]);

        ModeratePhoto::dispatch($photo->id);

        return redirect()->back()->with('success', 'Photo uploadée. Elle sera visible après approbation.');
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

        if (! $photo->is_approved) {
            return redirect()->back()->with('error', 'Cette photo doit être approuvée avant de devenir la photo principale.');
        }

        // Remove primary from other photos
        $user->photos()->update(['is_primary' => false]);

        // Set this photo as primary
        $photo->update(['is_primary' => true]);

        return redirect()->back()->with('success', 'Photo principale mise à jour.');
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
     * Admin: List pending photos.
     */
    public function pending(Request $request): Response
    {
        $photos = Photo::with('user:id,name,pseudo,email')
            ->where('is_approved', false)
            ->whereNull('rejection_reason')
            ->latest()
            ->paginate(20)
            ->through(fn (Photo $photo) => [
                'id' => $photo->id,
                'path' => asset('storage/'.$photo->path),
                'thumbnail_path' => $photo->thumbnail_path
                    ? asset('storage/'.$photo->thumbnail_path)
                    : null,
                'is_naughty' => $photo->is_naughty,
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

        $photo->update([
            'rejection_reason' => $request->rejection_reason,
            'moderation_status' => 'rejected',
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
