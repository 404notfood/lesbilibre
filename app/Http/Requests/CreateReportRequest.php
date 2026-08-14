<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateReportRequest extends FormRequest
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
            'reported_user_id' => ['required', 'exists:users,id'],
            'reason' => ['required', 'in:spam,harassment,fake_profile,inappropriate_content,other'],
            'description' => ['required', 'string', 'min:10', 'max:1000'],
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
            'reported_user_id.required' => 'L\'utilisateur à signaler est requis.',
            'reported_user_id.exists' => 'L\'utilisateur n\'existe pas.',
            'reason.required' => 'La raison du signalement est requise.',
            'reason.in' => 'La raison sélectionnée n\'est pas valide.',
            'description.required' => 'Une description est requise.',
            'description.min' => 'La description doit contenir au moins 10 caractères.',
            'description.max' => 'La description ne peut pas dépasser 1000 caractères.',
        ];
    }
}
