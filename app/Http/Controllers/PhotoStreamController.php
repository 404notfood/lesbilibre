<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\User;
use App\Services\PhotoProcessingService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PhotoStreamController extends Controller
{
    public function __construct(protected PhotoProcessingService $photos) {}

    /**
     * Serve a gallery photo, rendered for the requesting member.
     *
     * Going through the application rather than the public storage symlink is
     * what makes consent enforceable: a sensitive photo is blurred unless the
     * viewer opted in, and every delivered image carries their pseudo.
     */
    public function show(Request $request, Photo $photo): Response|StreamedResponse
    {
        $viewer = $request->user();
        $owner = $photo->user;

        abort_if($owner === null, 404);

        $isOwner = $viewer->id === $owner->id;

        // Blocked either way, or retired by a moderator: the photo does not exist.
        abort_unless($isOwner || $viewer->canInteractWith($owner), 404);
        abort_if(! $isOwner && ! $photo->is_approved, 404);
        abort_if(! $isOwner && $photo->moderation_status === 'rejected', 404);

        $viewerAcceptsNaughty = (bool) $viewer->profile?->is_naughty_mode;
        $blur = $photo->isObscuredFor(
            isOwner: $isOwner,
            viewerAcceptsNaughty: $viewerAcceptsNaughty,
            hasGalleryAccess: $owner->grantsGalleryAccessTo($viewer),
        );
        $thumb = $request->boolean('thumb') && $photo->thumbnail_path;

        // Une vidéo ne peut pas traverser le pipeline d'image : tant qu'elle
        // est masquée, on ne sert que son poster (flouté) ; une fois débloquée,
        // le fichier est diffusé tel quel pour rester lisible par le navigateur.
        if ($photo->isVideo() && ! $thumb) {
            if ($blur) {
                return $this->streamPoster($photo, $viewer, $isOwner, blur: true);
            }

            return $this->streamVideo($photo);
        }

        // Re-encoding on every request would be wasteful: the result only
        // depends on the photo, the viewer's label and the blur decision.
        //
        // The rendered bytes go to a private disk rather than the cache store:
        // they are raw JPEG, which a text-based cache column cannot hold, and
        // they carry the viewer's pseudo, so they must not sit in a table that
        // is shared, dumped and restored alongside ordinary application data.
        $rendered = $this->photos->cachedRenderForViewer(
            storedPath: $thumb ? $photo->thumbnail_path : $photo->path,
            viewerLabel: $isOwner ? 'Aperçu' : ($viewer->pseudo ?? "#{$viewer->id}"),
            blur: $blur,
            cacheKey: sprintf(
                'photo-render:%d:%d:%s:%s',
                $photo->id,
                $viewer->id,
                $blur ? 'blur' : 'clear',
                $thumb ? 'thumb' : 'full',
            ),
        );

        // Private, no-store: the rendered image is specific to this viewer and
        // must never be cached by a proxy and handed to somebody else.
        return response($rendered, 200, [
            'Content-Type' => 'image/jpeg',
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Disposition' => 'inline',
        ]);
    }

    /**
     * Sert le poster d'une vidéo, flouté ou non, via le pipeline d'image.
     */
    private function streamPoster(Photo $photo, User $viewer, bool $isOwner, bool $blur): Response
    {
        abort_if($photo->thumbnail_path === null, 404);

        $rendered = $this->photos->cachedRenderForViewer(
            storedPath: $photo->thumbnail_path,
            viewerLabel: $isOwner ? 'Aperçu' : ($viewer->pseudo ?? "#{$viewer->id}"),
            blur: $blur,
            cacheKey: sprintf(
                'photo-render:%d:%d:%s:poster',
                $photo->id,
                $viewer->id,
                $blur ? 'blur' : 'clear',
            ),
        );

        return response($rendered, 200, [
            'Content-Type' => 'image/jpeg',
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Disposition' => 'inline',
        ]);
    }

    /**
     * Diffuse le fichier vidéo lui-même.
     *
     * `Accept-Ranges` est indispensable : sans lui, aucun navigateur ne peut
     * chercher dans la timeline ni démarrer avant la fin du téléchargement.
     */
    private function streamVideo(Photo $photo): StreamedResponse
    {
        $disk = Storage::disk('local');

        abort_unless($disk->exists($photo->path), 404);

        return $disk->response($photo->path, null, [
            'Content-Type' => 'video/mp4',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Disposition' => 'inline',
        ]);
    }
}
