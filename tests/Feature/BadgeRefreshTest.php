<?php

namespace Tests\Feature;

use App\Models\Badge;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BadgeRefreshTest extends TestCase
{
    use RefreshDatabase;

    public function test_refresh_returns_newly_awarded_badges(): void
    {
        $user = User::factory()->create(['is_verified' => true]);
        Badge::create([
            'slug' => 'verified',
            'name' => 'Profil vérifié',
            'description' => 'Compte vérifié par l\'équipe.',
            'icon' => 'check',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('badges.refresh'))
            ->assertOk()
            ->assertJsonPath('message', 'Nouveaux badges obtenus !')
            ->assertJsonCount(1, 'newly_awarded')
            ->assertJsonPath('newly_awarded.0.name', 'Profil vérifié')
            ->assertJsonPath('newly_awarded.0.points', 10);
    }

    public function test_refresh_returns_empty_list_when_nothing_is_earned(): void
    {
        $user = User::factory()->create(['is_verified' => false]);
        Badge::create([
            'slug' => 'verified',
            'name' => 'Profil vérifié',
            'description' => 'Compte vérifié par l\'équipe.',
            'icon' => 'check',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('badges.refresh'))
            ->assertOk()
            ->assertJsonPath('message', 'Aucun nouveau badge pour le moment')
            ->assertJsonCount(0, 'newly_awarded');
    }
}
