<?php

namespace App\Http\Requests;

use App\Enums\NotificationFrequency;
use App\Enums\NotificationType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNotificationPreferencesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'preferences' => ['required', 'array'],
            'preferences.*' => ['required', Rule::enum(NotificationFrequency::class)],
        ];
    }

    /**
     * Reject frequencies that are not offered for a given notification type.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                foreach ((array) $this->input('preferences', []) as $type => $frequency) {
                    $notificationType = NotificationType::tryFrom((string) $type);

                    if (! $notificationType) {
                        $validator->errors()->add("preferences.{$type}", 'Ce type de notification est inconnu.');

                        continue;
                    }

                    $allowed = collect($notificationType->availableFrequencies())
                        ->map(fn (NotificationFrequency $available) => $available->value);

                    if (! $allowed->contains($frequency)) {
                        $validator->errors()->add(
                            "preferences.{$type}",
                            'Cette fréquence n’est pas disponible pour ce type de notification.',
                        );
                    }
                }
            },
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'preferences.required' => 'Aucune préférence n’a été transmise.',
            'preferences.*.required' => 'Choisissez une fréquence pour chaque notification.',
        ];
    }
}
