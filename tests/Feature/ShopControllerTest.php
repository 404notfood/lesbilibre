<?php

namespace Tests\Feature;

use App\Models\GemPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShopControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_shop_index_displays_gems_and_gifts(): void
    {
        $user = User::factory()->create();
        GemPackage::factory()->count(5)->create();

        $response = $this->actingAs($user)->get(route('shop.index'));

        $nonNaughtyGiftCount = collect(config('gifts'))
            ->reject(fn (array $gift) => $gift['category'] === 'naughty')
            ->count();

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Shop/Index')
            ->has('gemPackages', 5)
            ->has('gifts', $nonNaughtyGiftCount)
            ->where('userGems', $user->gems)
        );
    }

    public function test_user_can_purchase_gems(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        $package = GemPackage::factory()->create(['amount' => 500, 'bonus' => 75]);

        $response = $this->actingAs($user)->post(route('shop.gems.purchase'), [
            'package_id' => $package->id,
            'payment_method' => 'card',
        ]);

        $response->assertRedirect(route('shop.index'));
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertEquals(575, $user->gems); // 500 + 75 bonus
    }

    public function test_user_can_send_gift(): void
    {
        $sender = User::factory()->create(['gems' => 100]);
        $recipient = User::factory()->create(['gems' => 0]);

        $response = $this->actingAs($sender)->post(route('shop.gifts.send'), [
            'gift_id' => 1, // Rose Rouge - 10 gems
            'recipient_id' => $recipient->id,
            'message' => 'Pour toi!',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $sender->refresh();
        $recipient->refresh();

        $this->assertEquals(90, $sender->gems); // 100 - 10
        $this->assertEquals(1, $recipient->gems); // 10% bonus
        $this->assertDatabaseHas('notifications', [
            'user_id' => $recipient->id,
            'type' => 'gift',
        ]);
    }

    public function test_cannot_send_gift_with_insufficient_gems(): void
    {
        $sender = User::factory()->create(['gems' => 5]);
        $recipient = User::factory()->create();

        $response = $this->actingAs($sender)->post(route('shop.gifts.send'), [
            'gift_id' => 1, // Rose Rouge - 10 gems
            'recipient_id' => $recipient->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $sender->refresh();
        $this->assertEquals(5, $sender->gems); // Unchanged
    }
}
