<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Services\AntiAbuseService;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function __construct(private ReferralService $referralService) {}

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $request = app(Request::class);
        $google = $request->session()->get('google_registration');
        if (is_array($google)) {
            if (($google['expires_at'] ?? 0) < now()->timestamp) {
                $request->session()->forget('google_registration');
                throw ValidationException::withMessages(['email' => 'La session Google a expiré. Recommence avec Google.']);
            }
            $input['email'] = $google['email'];
            $input['password'] = $input['password_confirmation'] = Str::password(64);
        }
        if (isset($input['referral_code'])) {
            $input['referral_code'] = mb_strtoupper(trim($input['referral_code']));
        }

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
            'date_of_birth' => ['required', new \App\Rules\AdultBirthDate],
            'community_charter' => ['accepted'],
            'data_processing_consent' => ['accepted'],
            'meeting_intentions' => ['required', 'array', 'list', 'min:1', 'max:6'],
            'meeting_intentions.*' => ['required', 'distinct', Rule::in(array_keys(config('community.intentions')))],
            'city_name' => ['required', 'string', 'max:255'],
            'city_latitude' => ['required', 'numeric', 'between:-90,90'],
            'city_longitude' => ['required', 'numeric', 'between:-180,180'],
            'city_postal_code' => ['nullable', 'string', 'max:10'],
            'sexual_orientation' => ['nullable', 'in:lesbian,bisexual,pansexual,queer,questioning,other'],
            'interested_in' => ['required', 'in:single_woman,couple,curious,all,other'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'referral_code' => [
                'nullable',
                'string',
                'max:12',
                Rule::exists('users', 'referral_code')->where(
                    fn ($query) => $query->whereNull('deleted_at')->where('is_banned', false)
                ),
            ],
            'password' => $this->passwordRules(),
        ], [
            'pseudo.alpha_dash' => 'Le pseudo ne peut contenir que des lettres, des chiffres, des tirets et des underscores.',
            'pseudo.unique' => 'Ce pseudo est déjà utilisé.',
            'date_of_birth.required' => 'Votre date de naissance exacte est requise.',
            'community_charter.accepted' => 'Veuillez accepter la charte de la communauté.',
            'data_processing_consent.accepted' => 'Votre consentement au traitement de vos choix est requis.',
            'meeting_intentions.required' => 'Choisissez au moins une envie de rencontre.',
        ])->validate();

        app(AntiAbuseService::class)->assertRegistrationAllowed($input['email'], app(Request::class));

        $user = DB::transaction(function () use ($input, $google) {
            $user = User::create([
                'pseudo' => $input['pseudo'],
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'data_processing_consent' => true,
                'data_processing_consented_at' => now(),
            ]);

            $user->forceFill(['community_charter_accepted_at' => now(), 'community_charter_version' => config('community.charter_version')])->save();
            if (is_array($google)) {
                $user->forceFill([
                    'google_id' => $google['sub'],
                    'email_verified_at' => ($google['authoritative_email'] ?? false) ? now() : null,
                ])->save();
            }

            // Keep the exact, privately declared birth date.
            $dateOfBirth = \Illuminate\Support\Carbon::parse($input['date_of_birth']);

            // Create associated profile
            $user->profile()->create([
                'date_of_birth' => $dateOfBirth,
                'age' => $dateOfBirth->age,
                'birth_date_declared_at' => now(),
                'city' => $input['city_name'],
                'latitude' => $input['city_latitude'],
                'longitude' => $input['city_longitude'],
                'postal_code' => $input['city_postal_code'] ?? null,
                'sexual_orientation' => $input['sexual_orientation'] ?? 'other',
                'interested_in' => $input['interested_in'],
                'looking_for' => $input['meeting_intentions'][0] === 'ongoing' ? 'casual' : $input['meeting_intentions'][0],
                'meeting_intentions' => $input['meeting_intentions'],
            ]);

            $this->referralService->ensureReferralCode($user);
            $this->referralService->attributeReferral($user, $input['referral_code'] ?? null);

            return $user;
        });

        $request->session()->forget('google_registration');

        return $user;
    }
}
