<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\GemPackage;
use App\Models\NaughtyInterest;
use App\Models\PremiumPlan;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->disableUnchangedDemoAccounts();

            // Initialize empty catalogs only; reruns preserve administrator edits.
            if (! Badge::query()->exists()) {
                $this->call(BadgeSeeder::class);
            }
            if (! NaughtyInterest::query()->exists()) {
                $this->call(NaughtyInterestSeeder::class);
            }
            if (! Setting::query()->exists()) {
                $this->call(SettingSeeder::class);
                Setting::query()->whereIn('key', ['contact_email', 'support_email'])
                    ->update(['value' => config('seo.support_email', 'contact@lesbi-libre.fr')]);
            }
            if (! PremiumPlan::query()->exists() && ! GemPackage::query()->exists()) {
                $this->call(BillingSeeder::class);
            }

            if (User::query()->where('is_admin', true)->exists()) {
                $this->command?->info('Administrateur existant conserve.');

                return;
            }

            $email = (string) env('DEPLOY_ADMIN_EMAIL', '');
            $password = (string) env('DEPLOY_ADMIN_PASSWORD', '');
            if (! filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 24) {
                throw new RuntimeException('DEPLOY_ADMIN_EMAIL et un mot de passe aleatoire de 24 caracteres minimum sont requis.');
            }
            if (User::withTrashed()->where('email', $email)->exists()) {
                throw new RuntimeException('Cette adresse existe deja : aucun compte existant ne sera promu automatiquement.');
            }

            User::forceCreate([
                'name' => 'Administration',
                'pseudo' => 'admin-'.bin2hex(random_bytes(4)),
                'email' => $email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
                'is_admin' => true,
            ]);
            $this->command?->info('LESBILIBRE_ADMIN_CREATED');
        });
    }

    private function disableUnchangedDemoAccounts(): void
    {
        foreach ([
            ['admin@lesbi-libre.test', 'steff', 'admin1234'],
            ['sophie@test.com', 'sophie', 'password'],
        ] as [$email, $pseudo, $password]) {
            $user = User::query()->where('email', $email)->where('pseudo', $pseudo)->lockForUpdate()->first();
            if ($user === null || ! Hash::check($password, $user->password)) {
                continue;
            }

            $user->forceFill([
                'is_admin' => false,
                'is_banned' => true,
                'banned_at' => now(),
                'ban_reason' => 'Compte de démonstration à mot de passe par défaut, désactivé pendant l’installation.',
                'password' => Hash::make(bin2hex(random_bytes(32))),
                'remember_token' => null,
            ])->save();
            $this->command?->warn("Compte de démonstration désactivé : {$email}");
        }
    }
}
