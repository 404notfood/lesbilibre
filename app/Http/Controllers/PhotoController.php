<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadPhotoRequest;
use App\Jobs\ModeratePhoto;
use App\Models\Message;
use App\Models\Photo;
use App\Services\ModerationAuditService;
use App\Services\PhotoProcessingService;
use App\Services\VideoProcessingService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                'rejection_reason' => $photo->rejection_reason ? Message::maskEmails($photo->rejection_reason) : null,
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
        $isVideo = str_starts_with((string) $file->getMimeType(), 'video/');
        $isNaughty = $request->boolean('is_naughty');

        // Reject known duplicates before generating another original/poster.
        $contentHash = hash_file('sha256', $file->getRealPath());
        if ($user->photos()->where('content_hash', $contentHash)->exists()) {
            return back()->with('error', 'Ce média a déjà été ajouté à votre profil.');
        }

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

        try {
            $photo = DB::transaction(function () use ($user, $stored, $isVideo, $isNaughty, $isPrivate) {
                // Only the final checks need a lock; video processing stays
                // outside the transaction so it cannot hold an account lock.
                \App\Models\User::query()->lockForUpdate()->findOrFail($user->id);
                if ($user->photos()->count() >= 10 || $user->photos()->where('content_hash', $stored['content_hash'])->exists()) {
                    return null;
                }

                return Photo::create([
                    'user_id' => $user->id,
                    'media_type' => $isVideo ? 'video' : 'photo',
                    'path' => $stored['path'],
                    'content_hash' => $stored['content_hash'],
                    'thumbnail_path' => $stored['thumbnail_path'],
                    'duration' => $stored['duration'] ?? null,
                    'moderation_status' => 'pending',
                    'is_approved' => false,
                    'is_naughty' => $isNaughty,
                    'is_private' => $isPrivate,
                    'order' => $user->photos()->max('order') + 1,
                ]);
            });
        } catch (\Throwable $exception) {
            $this->discardStoredUpload($stored, $isVideo);
            throw $exception;
        }

        if ($photo === null) {
            $this->discardStoredUpload($stored, $isVideo);

            return back()->with('error', 'Ce média existe déjà ou votre galerie a atteint sa limite de 10 médias.');
        }

        if (! $isVideo) {
            ModeratePhoto::dispatch($photo->id);
        }

        return redirect()->back()->with(
            'success',
            $isVideo ? 'Vidéo déposée, en attente de validation de la modération.' : 'Photo déposée, en attente de validation de la modération.'
        );
    }

    private function discardStoredUpload(array $stored, bool $isVideo): void
    {
        $disk = Storage::disk($isVideo ? 'local' : 'public');
        foreach (array_filter([$stored['path'], $stored['thumbnail_path'] ?? null]) as $path) {
            if (! $disk->delete($path)) {
                throw new \RuntimeException('Le stockage a refusé le nettoyage du média non enregistré.');
            }
        }
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

        // A profile photo requires the same human approval as gallery media.
        if ($photo->moderation_status !== 'approved') {
            return redirect()->back()->with(
                'error',
                'Cette photo doit être validée par la modération avant de devenir votre photo de profil.'
            );
        }

        // Remove primary from other photos
        if (! $photo->is_primary) {
            $user->forceFill(['is_verified' => false])->save();
        }
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
            'Demande envoyée. Vous pouvez suivre son état depuis votre galerie ; aucun délai fixe de validation n’est garanti.'
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

        app(\App\Services\MediaDeletionService::class)->deletePhoto($photo);

        // Delete record
        if ($photo->is_primary) {
            $user->forceFill(['is_verified' => false])->save();
        }
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
        $photos = Photo::with('user:id,pseudo')
            ->whereHas('user')
            ->whereIn('moderation_status', ['pending', 'quarantined'])
            ->orderByRaw("CASE WHEN moderation_status = 'quarantined' THEN 0 ELSE 1 END")
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
                    'moderation_status' => $photo->moderation_status,
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

        abort_unless($photo->user !== null, 409, 'Ce compte est fermé. Le média est conservé pour le traitement de la demande de suppression.');

        $photo->update(['is_approved' => true, 'moderation_status' => 'approved', 'rejection_reason' => null]);

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

        abort_unless($photo->user !== null, 409, 'Ce compte est fermé. Le média est conservé pour le traitement de la demande de suppression.');

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
