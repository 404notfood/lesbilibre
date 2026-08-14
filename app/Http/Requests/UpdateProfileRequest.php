<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
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
            'bio' => ['nullable', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'country' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'sexual_orientation' => ['required', 'in:lesbian,bisexual,pansexual,queer,questioning,other'],
            'interested_in' => ['nullable', 'string', 'max:255'],
            'looking_for' => ['nullable', 'string', 'max:255'],
            'relationship_status' => ['nullable', 'in:single,in_relationship,complicated,open,other'],
            'height' => ['nullable', 'string', 'max:50'],
            'body_type' => ['nullable', 'string', 'max:100'],
            'hair_color' => ['nullable', 'string', 'max:50'],
            'eye_color' => ['nullable', 'string', 'max:50'],
            'ethnicity' => ['nullable', 'string', 'max:100'],
            'education' => ['nullable', 'string', 'max:255'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'has_children' => ['boolean'],
            'wants_children' => ['boolean'],
            'smokes' => ['boolean'],
            'drinks' => ['nullable', 'boolean'],
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string', 'max:100'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'max:50'],
            'is_naughty_mode' => ['boolean'],
            'is_discoverable' => ['boolean'],
            'incognito_mode' => ['boolean'],
            'message_permission' => ['required', 'in:matches_only,verified_members'],
            'show_age' => ['boolean'],
            'show_location' => ['boolean'],
            'search_radius' => ['integer', 'min:1', 'max:500'],
            'min_age_preference' => ['integer', 'min:18', 'max:99'],
            'max_age_preference' => ['integer', 'min:18', 'max:99', 'gte:min_age_preference'],
            'naughty_interest_ids' => ['nullable', 'array'],
            'naughty_interest_ids.*' => ['integer', 'exists:naughty_interests,id'],
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
            'bio.max' => 'La biographie ne peut pas dépasser 1000 caractères.',
            'sexual_orientation.required' => 'L\'orientation sexuelle est requise.',
            'sexual_orientation.in' => 'L\'orientation sexuelle sélectionnée n\'est pas valide.',
            'max_age_preference.gte' => 'L\'âge maximum doit être supérieur ou égal à l\'âge minimum.',
            'min_age_preference.min' => 'L\'âge minimum doit être d\'au moins 18 ans.',
            'search_radius.max' => 'Le rayon de recherche ne peut pas dépasser 500 km.',
        ];
    }
}
