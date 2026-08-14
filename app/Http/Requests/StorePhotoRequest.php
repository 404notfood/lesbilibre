<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePhotoRequest extends FormRequest
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
            'photo' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120', // 5MB max
                'dimensions:min_width=400,min_height=400,max_width=4000,max_height=4000',
            ],
            'is_private' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'photo.required' => 'Veuillez sélectionner une photo à télécharger.',
            'photo.image' => 'Le fichier doit être une image.',
            'photo.mimes' => 'La photo doit être au format JPEG, JPG, PNG ou WEBP.',
            'photo.max' => 'La photo ne doit pas dépasser 5 Mo.',
            'photo.dimensions' => 'La photo doit avoir une taille minimale de 400x400 pixels et maximale de 4000x4000 pixels.',
        ];
    }
}
