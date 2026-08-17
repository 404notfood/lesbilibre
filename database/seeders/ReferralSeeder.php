<?php

namespace Database\Seeders;

use App\Models\Referral;
use App\Models\User;
use App\Services\ReferralService;
use Illuminate\Database\Seeder;

class ReferralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::query()->limit(8)->get();

        if ($users->count() < 2) {
            return;
        }

        $referrer = $users->first();
        $code = app(ReferralService::class)->ensureReferralCode($referrer);

        foreach ($users->skip(1) as $referredUser) {
            Referral::factory()->create([
                'referrer_id' => $referrer->id,
                'referred_user_id' => $referredUser->id,
                'code' => $code,
            ]);
        }
    }
}
