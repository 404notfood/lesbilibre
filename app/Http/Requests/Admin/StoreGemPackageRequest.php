<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreGemPackageRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:80'],
            'amount' => ['required', 'integer', 'min:1', 'max:1000000'],
            'bonus' => ['required', 'integer', 'min:0', 'max:1000000'],
            'price' => ['required', 'numeric', 'min:0.5', 'max:9999.99'],
            'stripe_price_id' => ['nullable', 'string', 'max:120'],
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
            'amount.min' => 'Le pack doit contenir au moins 1 gemme.',
            'price.min' => 'Stripe refuse les paiements inférieurs à 0,50 €.',
        ];
    }
}
