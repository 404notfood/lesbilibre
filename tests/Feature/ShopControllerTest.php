<?php

namespace Tests\Feature;

use App\Models\GemPackage;
use App\Models\User;
use App\Services\StripePaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
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
        $package = GemPackage::factory()->create([
            'amount' => 500,
            'bonus' => 75,
            'price' => 19.99,
        ]);

        $this->mock(StripePaymentService::class, function (MockInterface $mock) use ($package, $user) {
            $mock->shouldReceive('createGemCheckoutSession')
                ->once()
                ->with(1999, $package->totalGems(), $user->id)
                ->andReturn('https://checkout.stripe.test/gems');
        });

        $response = $this->actingAs($user)
            ->withHeader('X-Inertia', 'true')
            ->post(route('shop.gems.purchase'), [
                'package_id' => $package->id,
            ]);

        $response
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', 'https://checkout.stripe.test/gems');

        $user->refresh();
        $this->assertSame(0, $user->gems);
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
