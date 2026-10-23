<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\IntegrationSettings;

class UpdateIntegrationSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'google_login_enabled' => ['required', 'boolean'],
            'google_search_console_property' => ['nullable', 'string', 'max:255', 'regex:~^(?:sc-domain:[a-z0-9.-]+|https?://[^\s]+)$~i'],
        ];

        foreach (IntegrationSettings::FIELDS as $field) {
            $rules[$field] = ['bail', 'nullable', 'string', 'max:30000'];
            $rules['remove_'.$field] = ['sometimes', 'boolean'];
        }

        $rules['google_client_id'][] = 'regex:/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/';
        $rules['google_search_console_credentials'][] = function ($attribute, $value, $fail) {
            if (blank($value)) {
                return;
            }
            $credentials = json_decode($value, true);
            if (! is_array($credentials) || ($credentials['type'] ?? '') !== 'service_account'
                || ! filter_var($credentials['client_email'] ?? '', FILTER_VALIDATE_EMAIL)
                || ! is_string($credentials['private_key'] ?? null)
                || ! openssl_pkey_get_private($credentials['private_key'])) {
                $fail('Fournissez un fichier JSON de compte de service Google avec son adresse et sa clé privée valides.');
            }
        };

        return $rules;
    }
}
