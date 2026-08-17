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

    /** Largeur intermédiaire d'une photo masquée : plus elle est basse, moins l'image reste lisible. */
    private const OBSCURED_WIDTH = 16;

    /** Nom affiché dans la signature incrustée sur chaque média servi. */
    private const WATERMARK_BRAND = 'Lesbi-Libre';

    /**
     * Marque pré-redimensionnée, gardée en mémoire pour la durée du processus.
     *
     * Le PNG source fait 1254×1254 : le décoder puis le réduire à trente pixels
     * coûte ~28 ms, à chaque photo servie. Les tailles demandées se comptent sur
     * les doigts d'une main (vignette, photo, poster), le cache reste minuscule.
     *
     * @var array<int, \GdImage|null>
     */
    private array $logoCache = [];

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
     * Store an ephemeral photo on the private disk.
     *
     * Kept off the public disk entirely: these images are served one view at a
     * time through the application, never by a URL somebody can share.
     */
    public function storePrivateEphemeral(UploadedFile $upload): string
    {
        $source = $this->openImage($upload->getRealPath(), $upload->getMimeType());
        $main = $this->resizeToFit($source, imagesx($source), imagesy($source), self::MAX_DIMENSION);
        $path = 'ephemeral/'.Str::uuid().'.jpg';

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
        string $sourceDisk = 'public',
    ): string {
        $disk = Storage::disk('local');
        $path = self::RENDER_CACHE_DIRECTORY.'/'.hash('sha256', $cacheKey).'.jpg';

        if ($disk->exists($path) && $disk->lastModified($path) > now()->subSeconds(self::RENDER_CACHE_TTL)->getTimestamp()) {
            $cached = $disk->get($path);

            if ($cached !== null) {
                return $cached;
            }
        }

        $rendered = $this->renderForViewer($storedPath, $viewerLabel, $blur, $sourceDisk);
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
        string $sourceDisk = 'public',
    ): string {
        $contents = Storage::disk($sourceDisk)->get($storedPath);

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

        // Largeur cible fixe plutôt qu'un ratio : un ratio laissait ~83 px de
        // détail sur une photo de 2000 px, largement assez pour reconnaître la
        // scène. 16 px ne conservent que des aplats de couleur.
        $shrunk = imagescale($image, self::OBSCURED_WIDTH);

        if ($shrunk === false) {
            // Fall back to repeated blurring rather than serving a sharp image.
            for ($i = 0; $i < 60; $i++) {
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

        for ($i = 0; $i < 8; $i++) {
            imagefilter($restored, IMG_FILTER_GAUSSIAN_BLUR);
        }

        // Assombrir légèrement : le flou seul laisse deviner les zones de peau.
        imagefilter($restored, IMG_FILTER_BRIGHTNESS, -25);

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
            $this->stampSignature($image, $label, $font);

            return;
        }

        $this->stampWithBitmapFont($image, $label);
    }

    /**
     * Signature discrète en bas à droite : logo, nom du site, puis le libellé
     * du destinataire.
     *
     * Un pavage diagonal identifie tout aussi bien la copie mais rend la photo
     * pénible à regarder, ce qui dessert un site de rencontre. La signature
     * garde la trace sans manger le sujet ; elle est incrustée dans le JPEG,
     * donc elle survit à une capture d'écran, contrairement à une surcouche CSS
     * qu'on retire en deux clics dans les outils de développement.
     */
    private function stampSignature(\GdImage $image, string $label, string $font): void
    {
        $width = imagesx($image);
        $height = imagesy($image);

        // Taille relative à la plus petite dimension : lisible sur une vignette
        // comme sur une photo pleine résolution, sans jamais dominer.
        $size = max(9, (int) round(min($width, $height) / 42));
        $margin = max(10, (int) round(min($width, $height) / 28));
        $logoSize = (int) round($size * 2.4);
        $gap = (int) round($size * 0.6);

        $text = self::WATERMARK_BRAND.' · '.$label;
        $box = imagettfbbox($size, 0, $font, $text);
        $textWidth = abs($box[2] - $box[0]);
        $textHeight = abs($box[1] - $box[7]);

        $blockWidth = $logoSize + $gap + $textWidth;
        $blockHeight = max($logoSize, $textHeight);

        $left = $width - $margin - $blockWidth;
        $bottom = $height - $margin;

        // Voile sombre derrière la signature : sans lui, un texte clair posé
        // sur une zone claire de la photo devient illisible.
        $this->shadeSignatureArea(
            $image,
            (int) ($left - $gap),
            (int) ($bottom - $blockHeight - $gap),
            (int) ($left + $blockWidth + $gap),
            (int) ($bottom + $gap),
        );

        $this->stampLogo(
            $image,
            (int) $left,
            (int) ($bottom - $blockHeight + ($blockHeight - $logoSize) / 2),
            $logoSize,
        );

        $textX = (int) ($left + $logoSize + $gap);
        $textY = (int) ($bottom - ($blockHeight - $textHeight) / 2);

        $shadow = imagecolorallocatealpha($image, 0, 0, 0, 75);
        $ink = imagecolorallocatealpha($image, 255, 255, 255, 40);

        imagettftext($image, $size, 0, $textX + 1, $textY + 1, $shadow, $font, $text);
        imagettftext($image, $size, 0, $textX, $textY, $ink, $font, $text);
    }

    /**
     * Dégradé sombre derrière la signature, pour garantir le contraste quel que
     * soit le fond de la photo.
     */
    private function shadeSignatureArea(\GdImage $image, int $x1, int $y1, int $x2, int $y2): void
    {
        $width = max(1, $x2 - $x1);
        $height = max(1, $y2 - $y1);

        // Voile en dégradé vertical, dessiné par bandes : transparent en haut,
        // dense sous le texte. Un rectangle uniforme poserait une plaque
        // visible dans le coin, et un dégradé pixel par pixel coûterait des
        // centaines de millisecondes par photo.
        $fadeHeight = max(1, (int) round($height * 0.55));

        for ($y = 0; $y < $height; $y++) {
            $strength = min(1.0, $y / $fadeHeight);

            if ($strength <= 0.02) {
                continue;
            }

            // 127 = invisible, 55 = voile le plus dense retenu.
            $alpha = (int) round(127 - ($strength * 72));
            $color = imagecolorallocatealpha(
                $image,
                0,
                0,
                0,
                max(0, min(127, $alpha)),
            );

            // Le bord gauche rentre progressivement : sans ce biseau, le voile
            // couperait la photo par une arête verticale nette.
            $inset = (int) round((1 - $strength) * $width * 0.18);

            imagefilledrectangle($image, $x1 + $inset, $y1 + $y, $x2, $y1 + $y, $color);
        }
    }

    /**
     * Incruste la marque, redimensionnée, en préservant sa transparence.
     *
     * L'absence du fichier n'est pas une erreur : la signature textuelle suffit
     * à tracer la copie, le logo n'est qu'un repère de marque.
     */
    private function stampLogo(\GdImage $image, int $x, int $y, int $size): void
    {
        $logo = $this->logoAtSize($size);

        if ($logo === null) {
            return;
        }

        imagealphablending($image, true);
        imagecopy($image, $logo, $x, $y, 0, 0, $size, $size);
    }

    private function logoAtSize(int $size): ?\GdImage
    {
        if (array_key_exists($size, $this->logoCache)) {
            return $this->logoCache[$size];
        }

        $path = public_path('images/branding/lesbilibre-mark.png');

        if (! is_readable($path)) {
            return $this->logoCache[$size] = null;
        }

        $source = @imagecreatefrompng($path);

        if ($source === false) {
            return $this->logoCache[$size] = null;
        }

        $scaled = imagecreatetruecolor($size, $size);

        // Sans ces deux réglages, la transparence du PNG est aplatie en noir.
        imagealphablending($scaled, false);
        imagesavealpha($scaled, true);
        imagefilledrectangle(
            $scaled,
            0,
            0,
            $size,
            $size,
            imagecolorallocatealpha($scaled, 0, 0, 0, 127),
        );
        imagealphablending($scaled, true);

        imagecopyresampled(
            $scaled,
            $source,
            0,
            0,
            0,
            0,
            $size,
            $size,
            imagesx($source),
            imagesy($source),
        );

        imagedestroy($source);

        return $this->logoCache[$size] = $scaled;
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
     * Repli sans police TrueType : même signature en bas à droite, dessinée
     * avec la police bitmap de GD. Plus rustique, mais placée au même endroit
     * pour que le rendu reste cohérent si le fichier de police disparaît.
     */
    private function stampWithBitmapFont(\GdImage $image, string $label): void
    {
        $width = imagesx($image);
        $height = imagesy($image);

        $text = self::WATERMARK_BRAND.' · '.$label;

        $font = 3;
        $textWidth = imagefontwidth($font) * strlen($text);
        $textHeight = imagefontheight($font);

        $margin = max(6, (int) round(min($width, $height) / 40));
        $x = max(4, $width - $textWidth - $margin);
        $y = max(4, $height - $textHeight - $margin);

        $this->shadeSignatureArea(
            $image,
            $x - 6,
            $y - 4,
            $x + $textWidth + 6,
            $y + $textHeight + 4,
        );

        $white = imagecolorallocatealpha($image, 255, 255, 255, 40);
        $shadow = imagecolorallocatealpha($image, 0, 0, 0, 75);

        imagestring($image, $font, $x + 1, $y + 1, $text, $shadow);
        imagestring($image, $font, $x, $y, $text, $white);
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
