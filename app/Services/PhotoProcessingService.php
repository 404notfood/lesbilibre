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
