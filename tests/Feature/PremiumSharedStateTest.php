<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PremiumSharedStateTest extends TestCase
{
    use RefreshDatabase;

    protected function createMember(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);

        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
        ]);

        return $user;
    }

    public function test_a_member_without_subscription_is_not_premium(): void
    {
        $user = $this->createMember(['is_premium' => false]);

        $auth = $this->actingAs($user)
            ->get(route('dashboard'))
            ->viewData('page')['props']['auth'];

        $this->assertFalse($auth['isPremium']);
    }

    public function test_an_active_subscription_is_premium(): void
    {
        $user = $this->createMember([
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
        ]);

        $auth = $this->actingAs($user)
            ->get(route('dashboard'))
            ->viewData('page')['props']['auth'];

        $this->assertTrue($auth['isPremium']);
    }

    public function test_a_lifetime_subscription_is_premium(): void
    {
        $user = $this->createMember([
            'is_premium' => true,
            'premium_expires_at' => null,
        ]);

        $auth = $this->actingAs($user)
            ->get(route('dashboard'))
            ->viewData('page')['props']['auth'];

        $this->assertTrue($auth['isPremium']);
    }

    public function test_an_expired_subscription_is_no_longer_premium(): void
    {
        $user = $this->createMember([
            'is_premium' => true,
            'premium_expires_at' => now()->subDay(),
        ]);

        $auth = $this->actingAs($user)
            ->get(route('dashboard'))
            ->viewData('page')['props']['auth'];

        $this->assertFalse(
            $auth['isPremium'],
            'Un abonnement expiré ne doit plus donner le statut premium.'
        );
    }
}
