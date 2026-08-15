<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShopGiftTest extends TestCase
{
    use RefreshDatabase;

    protected function createMember(bool $naughtyMode = false, int $gems = 1000): User
    {
        $user = User::factory()->create([
            'is_verified' => true,
            'is_banned' => false,
            'gems' => $gems,
        ]);

        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
            'is_naughty_mode' => $naughtyMode,
        ]);

        return $user;
    }

    public function test_naughty_gifts_are_offered_to_members_in_naughty_mode(): void
    {
        $response = $this->actingAs($this->createMember(naughtyMode: true))
            ->get(route('shop.index'))
            ->assertOk();

        $categories = array_column($response->viewData('page')['props']['gifts'], 'category');

        $this->assertContains('naughty', $categories);
    }

    public function test_naughty_gifts_are_hidden_from_members_without_naughty_mode(): void
    {
        $response = $this->actingAs($this->createMember(naughtyMode: false))
            ->get(route('shop.index'))
            ->assertOk();

        $categories = array_column($response->viewData('page')['props']['gifts'], 'category');

        $this->assertNotContains('naughty', $categories);
    }

    public function test_gift_to_preselects_the_recipient(): void
    {
        $me = $this->createMember();
        $target = $this->createMember();

        $response = $this->actingAs($me)
            ->get(route('shop.index', ['gift_to' => $target->id]))
            ->assertOk();

        $recipient = $response->viewData('page')['props']['giftRecipient'];

        $this->assertNotNull($recipient);
        $this->assertSame($target->id, $recipient['id']);
    }

    public function test_gift_to_ignores_self_and_unknown_users(): void
    {
        $me = $this->createMember();

        $this->actingAs($me)
            ->get(route('shop.index', ['gift_to' => $me->id]))
            ->assertOk()
            ->viewData('page');

        $selfResponse = $this->actingAs($me)->get(route('shop.index', ['gift_to' => $me->id]));
        $this->assertNull($selfResponse->viewData('page')['props']['giftRecipient']);

        $unknownResponse = $this->actingAs($me)->get(route('shop.index', ['gift_to' => 999999]));
        $this->assertNull($unknownResponse->viewData('page')['props']['giftRecipient']);
    }

    public function test_a_member_can_send_a_standard_gift(): void
    {
        $me = $this->createMember(gems: 100);
        $target = $this->createMember();

        $this->actingAs($me)
            ->post(route('shop.gifts.send'), [
                'gift_id' => 1, // Rose Rouge, 10 gemmes
                'recipient_id' => $target->id,
            ])
            ->assertRedirect();

        $this->assertSame(90, $me->fresh()->gems);
    }

    public function test_a_naughty_gift_requires_naughty_mode(): void
    {
        $me = $this->createMember(naughtyMode: false, gems: 100);
        $target = $this->createMember();

        $this->actingAs($me)
            ->post(route('shop.gifts.send'), [
                'gift_id' => 20, // Fantasme, catégorie naughty
                'recipient_id' => $target->id,
            ])
            ->assertSessionHas('error');

        $this->assertSame(100, $me->fresh()->gems, 'Aucune gemme ne doit être débitée.');
    }

    public function test_a_naughty_gift_is_allowed_in_naughty_mode(): void
    {
        $me = $this->createMember(naughtyMode: true, gems: 100);
        $target = $this->createMember();

        $this->actingAs($me)
            ->post(route('shop.gifts.send'), [
                'gift_id' => 13, // Bisou, 8 gemmes
                'recipient_id' => $target->id,
            ])
            ->assertRedirect();

        $this->assertSame(92, $me->fresh()->gems);
    }

    public function test_a_member_cannot_gift_themselves(): void
    {
        $me = $this->createMember(gems: 100);

        $this->actingAs($me)
            ->post(route('shop.gifts.send'), [
                'gift_id' => 1,
                'recipient_id' => $me->id,
            ])
            ->assertSessionHas('error');

        $this->assertSame(100, $me->fresh()->gems);
    }

    public function test_an_unknown_gift_is_rejected(): void
    {
        $me = $this->createMember();
        $target = $this->createMember();

        $this->actingAs($me)
            ->post(route('shop.gifts.send'), [
                'gift_id' => 999,
                'recipient_id' => $target->id,
            ])
            ->assertSessionHasErrors('gift_id');
    }
}
