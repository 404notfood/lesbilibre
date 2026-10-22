<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            $this->call(ProductionSeeder::class);

            return;
        }

        $this->call([
            // Paramètres et catalogues utilisés par les autres seeders.
            SettingSeeder::class,
            BadgeSeeder::class,
            NaughtyInterestSeeder::class,
            BillingSeeder::class,

            // Comptes et données de démonstration.
            UserSeeder::class,
            DemoUserSeeder::class,
            DemoDataSeeder::class,

            // Profils et médias des utilisateurs.
            ProfileSeeder::class,
            PhotoSeeder::class,
            VerificationPhotoSeeder::class,

            // Interactions et données liées aux utilisateurs.
            LikeSeeder::class,
            UserMatchSeeder::class,
            ConversationSeeder::class,
            MessageSeeder::class,
            ReportSeeder::class,
            ReferralSeeder::class,
        ]);
    }
}
