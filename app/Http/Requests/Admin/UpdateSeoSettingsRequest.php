<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSeoSettingsRequest extends FormRequest
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
        return [
            'indexing_enabled' => ['required', 'boolean'],
            'custom_robots' => ['required', 'boolean'],
            'robots_content' => ['bail', 'required_if:custom_robots,true,1', 'nullable', 'string', 'max:20000', function ($attribute, $value, $fail) {
                if ($this->boolean('custom_robots') && (! preg_match('/^\s*User-agent\s*:/mi', $value ?? '') || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F<>]/', $value ?? ''))) {
                    $fail('Indiquez au moins un groupe User-agent et un contenu robots.txt sans HTML.');
                }
            }],
        ];
    }
}
