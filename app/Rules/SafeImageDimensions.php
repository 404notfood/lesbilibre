<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class SafeImageDimensions implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! str_starts_with((string) $value->getMimeType(), 'image/')) {
            return;
        }

        // Read only the header before GD allocates the decoded image.
        $dimensions = @getimagesize($value->getRealPath());
        if ($dimensions === false || $dimensions[0] < 1 || $dimensions[1] < 1
            || $dimensions[0] > 6000 || $dimensions[1] > 6000
            || $dimensions[0] * $dimensions[1] > 16000000) {
            $fail('Réduisez l’image à 6 000 pixels par côté et 16 mégapixels maximum avant de l’envoyer.');
        }
    }
}
