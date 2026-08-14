<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Services\PhotoProcessingService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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
        $blur = $photo->is_naughty && ! $isOwner && ! $viewerAcceptsNaughty;
        $thumb = $request->boolean('thumb') && $photo->thumbnail_path;

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
}
