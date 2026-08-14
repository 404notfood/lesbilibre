<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use App\Services\LocationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locationService = new LocationService;

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@lesbi-libre.test'],
            [
                'name' => 'Steff',
                'pseudo' => 'steff',
                'password' => Hash::make('admin1234'),
                'email_verified_at' => now(),
                'is_admin' => true,
                'is_premium' => true,
                'premium_expires_at' => now()->addYears(10),
                'gems' => 9999,
            ]
        );

        $adminCoords = $locationService->getCoordinatesFromCity('Laval');
        Profile::firstOrCreate(
            ['user_id' => $admin->id],
            [
                'bio' => 'Compte administrateur',
                'date_of_birth' => now()->subYears(30),
                'city' => 'Laval',
                'latitude' => $adminCoords['lat'] ?? null,
                'longitude' => $adminCoords['lon'] ?? null,
                'sexual_orientation' => 'lesbian',
                'interested_in' => 'femmes',
                'looking_for' => 'relation sérieuse',
                'relationship_status' => 'single',
                'show_age' => false,
                'show_location' => false,
                'search_radius' => 200,
                'min_age_preference' => 18,
                'max_age_preference' => 99,
            ]
        );

        // Create a test user
        $testUser = User::firstOrCreate(
            ['email' => 'sophie@test.com'],
            [
                'name' => 'Sophie Martin',
                'pseudo' => 'sophie',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_premium' => true,
                'premium_expires_at' => now()->addMonths(3),
                'gems' => 500,
            ]
        );

        $coords = $locationService->getCoordinatesFromCity('Laval');
        Profile::firstOrCreate(
            ['user_id' => $testUser->id],
            [
                'bio' => 'Passionnée de musique, de voyage et de bons moments entre amies. Toujours partante pour une nouvelle aventure !',
                'date_of_birth' => now()->subYears(28),
                'city' => 'Laval',
                'latitude' => $coords['lat'] ?? null,
                'longitude' => $coords['lon'] ?? null,
                'sexual_orientation' => 'lesbian',
                'interested_in' => 'femmes',
                'looking_for' => 'relation sérieuse',
                'relationship_status' => 'single',
                'occupation' => 'Designer',
                'education' => 'Master',
                'interests' => ['musique', 'voyage', 'photographie', 'cuisine', 'yoga'],
                'languages' => ['Français', 'Anglais', 'Espagnol'],
                'show_age' => true,
                'show_location' => true,
                'search_radius' => 50,
                'min_age_preference' => 25,
                'max_age_preference' => 35,
            ]
        );

        // Generate 50 random users
        $cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'];
        $orientations = ['lesbian', 'bisexual', 'pansexual', 'queer'];
        $lookingFor = ['relationship', 'casual', 'friendship', 'dating', 'open'];
        $occupations = ['Designer', 'Développeuse', 'Professeure', 'Artiste', 'Infirmière', 'Avocate', 'Architecte', 'Chef', 'Photographe', 'Écrivaine'];
        $allInterests = ['musique', 'voyage', 'photographie', 'cuisine', 'yoga', 'sport', 'cinéma', 'lecture', 'art', 'danse', 'randonnée', 'gaming', 'mode', 'politique'];

        foreach (range(1, 50) as $index) {
            $city = $cities[array_rand($cities)];
            $coords = $locationService->getCoordinatesFromCity($city);
            $age = rand(21, 45);

            $isPremium = rand(0, 100) > 70; // 30% premium

            $user = User::firstOrCreate(
                ['email' => "user{$index}@test.com"],
                [
                    'name' => fake()->name('female'),
                    'pseudo' => "user{$index}",
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'is_premium' => $isPremium,
                    'premium_expires_at' => $isPremium ? now()->addMonths(rand(1, 12)) : null,
                    'gems' => rand(0, 1000),
                ]
            );

            $interests = array_rand(array_flip($allInterests), rand(3, 8));

            Profile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'bio' => fake()->paragraph(2),
                    'date_of_birth' => now()->subYears($age),
                    'city' => $city,
                    'latitude' => $coords['lat'] ?? null,
                    'longitude' => $coords['lon'] ?? null,
                    'sexual_orientation' => $orientations[array_rand($orientations)],
                    'interested_in' => 'femmes',
                    'looking_for' => $lookingFor[array_rand($lookingFor)],
                    'relationship_status' => ['single', 'complicated', 'other'][array_rand(['single', 'complicated', 'other'])],
                    'occupation' => $occupations[array_rand($occupations)],
                    'education' => ['Lycée', 'Licence', 'Master', 'Doctorat'][array_rand(['Lycée', 'Licence', 'Master', 'Doctorat'])],
                    'interests' => $interests,
                    'languages' => ['Français', rand(0, 1) ? 'Anglais' : null, rand(0, 1) ? ['Espagnol', 'Italien', 'Allemand'][array_rand(['Espagnol', 'Italien', 'Allemand'])] : null],
                    'has_children' => rand(0, 100) > 80,
                    'wants_children' => rand(0, 100) > 50,
                    'smokes' => rand(0, 100) > 80,
                    'drinks' => rand(0, 100) > 60,
                    'show_age' => true,
                    'show_location' => true,
                    'search_radius' => [25, 50, 100, 200][array_rand([25, 50, 100, 200])],
                    'min_age_preference' => max(18, $age - 10),
                    'max_age_preference' => min(99, $age + 10),
                ]
            );
        }
    }
}
