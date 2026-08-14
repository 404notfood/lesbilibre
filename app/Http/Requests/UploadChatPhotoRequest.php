<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadChatPhotoRequest extends FormRequest
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
                'mimes:jpeg,png,jpg,gif',
                'max:5120', // 5MB max
            ],
            'conversation_id' => [
                'required',
                'exists:conversations,id',
            ],
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
            'photo.required' => 'Veuillez sélectionner une photo.',
            'photo.image' => 'Le fichier doit être une image.',
            'photo.mimes' => 'L\'image doit être au format JPEG, PNG, JPG ou GIF.',
            'photo.max' => 'L\'image ne peut pas dépasser 5 Mo.',
            'conversation_id.required' => 'La conversation est requise.',
            'conversation_id.exists' => 'Cette conversation n\'existe pas.',
        ];
    }
}
