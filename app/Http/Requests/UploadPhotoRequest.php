<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadPhotoRequest extends FormRequest
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
                'file',
                'mimes:jpeg,png,jpg,mp4,mov,webm',
                'max:102400', // 100 Mo : une vidéo courte pèse bien plus qu'une photo
            ],
            'is_naughty' => ['boolean'],
            'is_private' => ['boolean'],
        ];
    }

    /**
     * Une vidéo coquine est toujours privée : aucun floutage vidéo n'est
     * produit, la restriction d'accès est donc le seul verrou possible.
     */
    protected function prepareForValidation(): void
    {
        $file = $this->file('photo');
        $isVideo = $file !== null
            && in_array(strtolower($file->getClientOriginalExtension()), ['mp4', 'mov', 'webm'], true);

        if ($isVideo && $this->boolean('is_naughty')) {
            $this->merge(['is_private' => true]);
        }
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'photo.required' => 'Veuillez sélectionner une photo ou une vidéo.',
            'photo.file' => 'Le fichier envoyé est invalide.',
            'photo.mimes' => 'Formats acceptés : JPEG, PNG, JPG, MP4, MOV ou WEBM.',
            'photo.max' => 'Le fichier ne peut pas dépasser 100 Mo.',
        ];
    }
}
