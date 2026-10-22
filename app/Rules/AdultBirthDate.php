<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Carbon;

class AdultBirthDate implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        try {
            $date = Carbon::createFromFormat('!Y-m-d', (string) $value);
            if (! $date || $date->format('Y-m-d') !== $value || $date->isFuture() || $date->age < 18 || $date->age > 99) {
                $fail('Indiquez votre date de naissance exacte. Ce service est réservé aux personnes de 18 à 99 ans.');
            }
        } catch (\Throwable) {
            $fail('Indiquez une date de naissance valide au format AAAA-MM-JJ.');
        }
    }
}
