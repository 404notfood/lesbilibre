<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class PhotoProcessingService
{
    private const MAX_DIMENSION = 1920;

    private const THUMBNAIL_SIZE = 600;

    public const RENDER_CACHE_DIRECTORY = 'photo-cache';

    /** Six hours, matching the lifetime the rendered images had in the cache store. */
    public const RENDER_CACHE_TTL = 21600;

    /**
     * Re-encode uploads as JPEG. This removes EXIF metadata (including GPS)
     * and gives predictable, web-friendly image sizes.
     *
     * @return array{path: string, thumbnail_path: string, content_hash: string}
     */
    public function storePublicPhoto(UploadedFile $upload): array
    {
        $source = $this->openImage($upload->getRealPath(), $upload->getMimeType());
        $width = imagesx($source);
        $height = imagesy($source);
        $filename = Str::uuid().'.jpg';

        $main = $this->resizeToFit($source, $width, $height, self::MAX_DIMENSION);
        $thumbnail = $this->cropSquare($source, $width, $height, self::THUMBNAIL_SIZE);

        try {
            Storage::disk('public')->put('photos/'.$filename, $this->encode($main, 85));
            Storage::disk('public')->put('photos/thumbnails/'.$filename, $this->encode($thumbnail, 78));
        } finally {
            imagedestroy($source);
            imagedestroy($main);
            imagedestroy($thumbnail);
        }

        return [
            'path' => 'photos/'.$filename,
            'thumbnail_path' => 'photos/thumbnails/'.$filename,
            'content_hash' => hash_file('sha256', $upload->getRealPath()),
        ];
    }

    /**
     * Store a normalized verification image on the private disk. No thumbnail
     * is generated because this document must never be publicly displayed.
     */
    public function storePrivateVerification(UploadedFile $upload): string
    {
        $source = $this->openImage($upload->getRealPath(), $upload->getMimeType());
        $main = $this->resizeToFit($source, imagesx($source), imagesy($source), self::MAX_DIMENSION);
        $path = 'verification-photos/'.Str::uuid().'.jpg';

        try {
            Storage::disk('local')->put($path, $this->encode($main, 85));
        } finally {
            imagedestroy($source);
            imagedestroy($main);
        }

        return $path;
    }

    /**
     * Render a photo for a viewer, reusing a previously rendered copy.
     *
     * Rendered images are kept on the private disk instead of the cache store:
     * they are raw JPEG bytes, which a utf8mb4 text column rejects outright,
     * and each one is personalised with the viewer's pseudo, so it belongs on
     * a disk the application controls rather than in shared cache storage.
     *
     * @return string Raw JPEG bytes
     */
    public function cachedRenderForViewer(
        string $storedPath,
        string $viewerLabel,
        bool $blur,
        string $cacheKey,
    ): string {
        $disk = Storage::disk('local');
        $path = self::RENDER_CACHE_DIRECTORY.'/'.hash('sha256', $cacheKey).'.jpg';

        if ($disk->exists($path) && $disk->lastModified($path) > now()->subSeconds(self::RENDER_CACHE_TTL)->getTimestamp()) {
            $cached = $disk->get($path);

            if ($cached !== null) {
                return $cached;
            }
        }

        $rendered = $this->renderForViewer($storedPath, $viewerLabel, $blur);
        $disk->put($path, $rendered);

        return $rendered;
    }

    /**
     * Render a stored photo for one specific viewer.
     *
     * Sensitive photos are blurred beyond recognition when the viewer has not
     * opted into adult content. Whatever the viewer sees carries their own
     * pseudo as a watermark: a screenshot cannot be stripped of its origin,
     * which is the only real deterrent against redistribution.
     *
     * @return string Raw JPEG bytes
     */
    public function renderForViewer(
        string $storedPath,
        string $viewerLabel,
        bool $blur = false,
    ): string {
        $contents = Storage::disk('public')->get($storedPath);

        if ($contents === null) {
            throw new RuntimeException('Image introuvable.');
        }

        $image = imagecreatefromstring($contents);

        if ($image === false) {
            throw new RuntimeException('Impossible de lire cette image.');
        }

        try {
            if ($blur) {
                $image = $this->obscure($image);
            }

            $this->stampWatermark($image, $viewerLabel);

            return $this->encode($image, $blur ? 60 : 82);
        } finally {
            imagedestroy($image);
        }
    }

    /**
     * Blur an image past the point of reconstruction.
     *
     * Repeated gaussian passes alone stay reversible on small images, so the
     * picture is first downscaled to destroy detail, then scaled back up.
     */
    private function obscure(\GdImage $image): \GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $shrunk = imagescale($image, max(1, (int) round($width / 24)));

        if ($shrunk === false) {
            // Fall back to repeated blurring rather than serving a sharp image.
            for ($i = 0; $i < 40; $i++) {
                imagefilter($image, IMG_FILTER_GAUSSIAN_BLUR);
            }

            return $image;
        }

        imagedestroy($image);
        $restored = imagescale($shrunk, $width, $height, IMG_BILINEAR_FIXED);
        imagedestroy($shrunk);

        if ($restored === false) {
            throw new RuntimeException('Impossible de flouter cette image.');
        }

        for ($i = 0; $i < 3; $i++) {
            imagefilter($restored, IMG_FILTER_GAUSSIAN_BLUR);
        }

        return $restored;
    }

    /**
     * Burn the viewer's identity into the pixels themselves.
     *
     * This is deliberately not a CSS overlay: an overlay is removed from the
     * developer tools in seconds and survives no screenshot. Baking the label
     * into the JPEG means any copy that circulates still names the account it
     * was served to.
     */
    private function stampWatermark(\GdImage $image, string $label): void
    {
        $font = $this->watermarkFont();

        if ($font !== null) {
            $this->stampWithTrueType($image, $label, $font);

            return;
        }

        $this->stampWithBitmapFont($image, $label);
    }

    /**
     * Optional TrueType face, dropped in by an operator. Falls back to GD's
     * built-in bitmap font when absent so the watermark never silently
     * disappears just because the file is missing.
     */
    private function watermarkFont(): ?string
    {
        if (! function_exists('imagettftext')) {
            return null;
        }

        $path = resource_path('fonts/watermark.ttf');

        return is_readable($path) ? $path : null;
    }

    /**
     * Diagonal repeated watermark, the shape people recognise as "protected".
     */
    private function stampWithTrueType(\GdImage $image, string $label, string $font): void
    {
        $width = imagesx($image);
        $height = imagesy($image);

        $size = max(11, (int) round(min($width, $height) / 22));
        $white = imagecolorallocatealpha($image, 255, 255, 255, 95);
        $shadow = imagecolorallocatealpha($image, 0, 0, 0, 105);

        // Diagonal band spacing derived from the text box so rows never collide.
        $box = imagettfbbox($size, 30, $font, $label);
        $stepY = max(60, abs($box[1] - $box[7]) * 3);
        $stepX = max(120, abs($box[2] - $box[0]) + 60);

        for ($y = (int) ($stepY / 2); $y < $height + $stepY; $y += $stepY) {
            $offset = (($y / $stepY) % 2 === 0) ? 0 : (int) ($stepX / 2);

            for ($x = -$stepX + $offset; $x < $width + $stepX; $x += $stepX) {
                imagettftext($image, $size, 30, $x + 1, $y + 1, $shadow, $font, $label);
                imagettftext($image, $size, 30, $x, $y, $white, $font, $label);
            }
        }
    }

    /**
     * Tile the viewer's identity across the image, twice, so cropping one
     * corner out of a screenshot does not remove the trace.
     */
    private function stampWithBitmapFont(\GdImage $image, string $label): void
    {
        $width = imagesx($image);
        $height = imagesy($image);

        $white = imagecolorallocatealpha($image, 255, 255, 255, 88);
        $shadow = imagecolorallocatealpha($image, 0, 0, 0, 100);

        $font = 5;
        $textWidth = imagefontwidth($font) * strlen($label);
        $textHeight = imagefontheight($font);

        $positions = [
            [(int) (($width - $textWidth) / 2), (int) ($height * 0.35)],
            [(int) (($width - $textWidth) / 2), (int) ($height * 0.68)],
        ];

        foreach ($positions as [$x, $y]) {
            $x = max(4, $x);
            imagestring($image, $font, $x + 1, $y + 1, $label, $shadow);
            imagestring($image, $font, $x, $y, $label, $white);
        }

        // Discreet corner stamp, harder to notice and therefore to crop out.
        imagestring(
            $image,
            2,
            max(4, $width - imagefontwidth(2) * strlen($label) - 8),
            max(4, $height - $textHeight - 6),
            $label,
            $white
        );
    }

    private function openImage(string $path, ?string $mimeType): \GdImage
    {
        $image = match ($mimeType) {
            'image/jpeg' => imagecreatefromjpeg($path),
            'image/png' => imagecreatefrompng($path),
            default => false,
        };

        if ($image === false) {
            throw new RuntimeException('Impossible de traiter cette image.');
        }

        return $image;
    }

    private function resizeToFit(\GdImage $source, int $width, int $height, int $maxDimension): \GdImage
    {
        $scale = min(1, $maxDimension / max($width, $height));
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));
        $canvas = $this->canvas($targetWidth, $targetHeight);

        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        return $canvas;
    }

    private function cropSquare(\GdImage $source, int $width, int $height, int $size): \GdImage
    {
        $cropSize = min($width, $height);
        $sourceX = (int) floor(($width - $cropSize) / 2);
        $sourceY = (int) floor(($height - $cropSize) / 2);
        $canvas = $this->canvas($size, $size);

        imagecopyresampled($canvas, $source, 0, 0, $sourceX, $sourceY, $size, $size, $cropSize, $cropSize);

        return $canvas;
    }

    private function canvas(int $width, int $height): \GdImage
    {
        $canvas = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefill($canvas, 0, 0, $white);

        return $canvas;
    }

    private function encode(\GdImage $image, int $quality): string
    {
        ob_start();
        imagejpeg($image, null, $quality);

        return (string) ob_get_clean();
    }
}
