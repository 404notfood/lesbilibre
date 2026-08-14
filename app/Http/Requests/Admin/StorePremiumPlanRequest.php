<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePremiumPlanRequest extends FormRequest
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
        $planId = $this->route('plan')?->id;

        return [
            'slug' => [
                'required',
                'string',
                'max:60',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('premium_plans', 'slug')->ignore($planId),
            ],
            'name' => ['required', 'string', 'max:80'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'duration_months' => ['required', 'integer', 'min:1', 'max:60'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999.99'],
            'stripe_price_id' => ['nullable', 'string', 'max:120'],
            'perks' => ['nullable', 'array', 'max:12'],
            'perks.*' => ['required', 'string', 'max:120'],
            'gems_on_signup' => ['required', 'integer', 'min:0', 'max:100000'],
            'gems_per_month' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'display_order' => ['required', 'integer', 'min:0', 'max:999'],
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
            'slug.regex' => 'L’identifiant ne peut contenir que des minuscules, chiffres et tirets.',
            'slug.unique' => 'Cet identifiant est déjà utilisé par un autre plan.',
            'duration_months.min' => 'La durée doit être d’au moins 1 mois.',
            'price.max' => 'Le prix ne peut pas dépasser 9 999,99 €.',
        ];
    }
}
