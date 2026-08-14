<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Services\AntiAbuseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        // Log incoming data for debugging
        Log::info('Registration attempt with data:', array_keys($input));

        Validator::make($input, [
            'pseudo' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique(User::class),
            ],
            'name' => ['required', 'string', 'max:255'],
            'age' => ['required', 'integer', 'min:18', 'max:99'],
            'city_name' => ['required', 'string', 'max:255'],
            'city_latitude' => ['required', 'numeric', 'between:-90,90'],
            'city_longitude' => ['required', 'numeric', 'between:-180,180'],
            'city_postal_code' => ['nullable', 'string', 'max:10'],
            'sexual_orientation' => ['required', 'in:lesbian,bisexual,pansexual,queer,questioning,other'],
            'interested_in' => ['required', 'in:single_woman,couple,curious,all,other'],
            'looking_for' => ['required', 'in:friendship,dating,relationship,casual,open'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ], [
            'pseudo.alpha_dash' => 'Le pseudo ne peut contenir que des lettres, des chiffres, des tirets et des underscores.',
            'pseudo.unique' => 'Ce pseudo est déjà utilisé.',
            'age.min' => 'Vous devez avoir au moins 18 ans pour vous inscrire.',
        ])->validate();

        app(AntiAbuseService::class)->assertRegistrationAllowed($input['email'], app(Request::class));

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'pseudo' => $input['pseudo'],
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);

            // Calculate date_of_birth from age (approximation: year - age on January 1st)
            $dateOfBirth = now()->subYears($input['age'])->startOfYear();

            // Create associated profile
            $user->profile()->create([
                'date_of_birth' => $dateOfBirth,
                'age' => $input['age'],
                'city' => $input['city_name'],
                'latitude' => $input['city_latitude'],
                'longitude' => $input['city_longitude'],
                'postal_code' => $input['city_postal_code'] ?? null,
                'sexual_orientation' => $input['sexual_orientation'],
                'interested_in' => $input['interested_in'],
                'looking_for' => $input['looking_for'],
            ]);

            return $user;
        });
    }
}
