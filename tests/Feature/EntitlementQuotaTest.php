<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Like;
use App\Models\Message;
use App\Models\PremiumPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\EntitlementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EntitlementQuotaTest extends TestCase
{
    use RefreshDatabase;

    /** Subscribe a member to a plan carrying the given entitlements. */
    private function subscribe(User $user, array $entitlements): PremiumPlan
    {
        $plan = PremiumPlan::factory()->create([
            'slug' => 'test-plan-'.$user->id,
            'entitlements' => $entitlements,
        ]);

        // is_premium et premium_expires_at ne sont pas mass-assignables :
        // update() les ignorerait en silence.
        $user->is_premium = true;
        $user->premium_expires_at = now()->addMonth();
        $user->save();

        Subscription::create([
            'user_id' => $user->id,
            'plan' => $plan->slug,
            'amount' => 19.99,
            'status' => 'active',
            'starts_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);

        // La relation subscriptions est peut-être déjà chargée sur l'instance.
        $user->unsetRelation('subscriptions')->refresh();

        return $plan;
    }

    // --- Résolution des droits ---

    public function test_a_free_account_falls_back_to_the_free_tier(): void
    {
        $user = User::factory()->create(['is_premium' => false]);

        $entitlements = app(EntitlementService::class)->for($user);

        $this->assertSame(config('entitlements.free.likes_per_day'), $entitlements['likes_per_day']);
        $this->assertFalse($entitlements['see_who_liked']);
    }

    public function test_a_plan_overrides_only_what_it_grants(): void
    {
        $user = User::factory()->create();
        $this->subscribe($user, ['see_who_liked' => true]);

        $entitlements = app(EntitlementService::class)->for($user);

        $this->assertTrue($entitlements['see_who_liked']);
        // Non accordé par le plan : la valeur du palier gratuit subsiste.
        $this->assertSame(
            config('entitlements.free.likes_per_day'),
            $entitlements['likes_per_day']
        );
    }

    public function test_an_expired_subscription_returns_to_free_limits(): void
    {
        $user = User::factory()->create();
        $this->subscribe($user, ['unlimited_likes' => true]);

        $user->premium_expires_at = now()->subDay();
        $user->save();

        $this->assertFalse(app(EntitlementService::class)->allows($user->fresh(), 'unlimited_likes'));
    }

    // --- Quota de likes ---

    public function test_free_account_is_blocked_once_the_like_quota_is_spent(): void
    {
        config(['entitlements.free.likes_per_day' => 2]);

        $user = User::factory()->create();
        Like::factory()->count(2)->create(['user_id' => $user->id]);

        $target = User::factory()->create();

        $this->actingAs($user)
            ->post(route('likes.store', $target->id))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseMissing('likes', [
            'user_id' => $user->id,
            'liked_user_id' => $target->id,
        ]);
    }

    public function test_likes_from_previous_days_do_not_count(): void
    {
        config(['entitlements.free.likes_per_day' => 2]);

        $user = User::factory()->create();
        Like::factory()->count(5)->create([
            'user_id' => $user->id,
            'created_at' => now()->subDays(2),
        ]);

        $target = User::factory()->create();

        $this->actingAs($user)
            ->post(route('likes.store', $target->id))
            ->assertRedirect();

        $this->assertDatabaseHas('likes', [
            'user_id' => $user->id,
            'liked_user_id' => $target->id,
        ]);
    }

    public function test_unlimited_likes_bypasses_the_quota(): void
    {
        config(['entitlements.free.likes_per_day' => 1]);

        $user = User::factory()->create();
        $this->subscribe($user, ['unlimited_likes' => true]);
        Like::factory()->count(30)->create(['user_id' => $user->id]);

        $target = User::factory()->create();

        $this->actingAs($user)
            ->post(route('likes.store', $target->id))
            ->assertRedirect();

        $this->assertDatabaseHas('likes', [
            'user_id' => $user->id,
            'liked_user_id' => $target->id,
        ]);
    }

    public function test_a_plan_can_raise_the_like_quota_without_unlimiting_it(): void
    {
        config(['entitlements.free.likes_per_day' => 2]);

        $user = User::factory()->create();
        $this->subscribe($user, ['likes_per_day' => 5]);
        Like::factory()->count(3)->create(['user_id' => $user->id]);

        $this->assertSame(2, app(EntitlementService::class)->likesRemaining($user->fresh()));
    }

    public function test_re_liking_a_profile_does_not_consume_quota(): void
    {
        config(['entitlements.free.likes_per_day' => 1]);

        $user = User::factory()->create();
        $target = User::factory()->create();
        Like::factory()->create(['user_id' => $user->id, 'liked_user_id' => $target->id]);

        // Le quota est épuisé, mais re-liker doit répondre « déjà aimé »,
        // pas « quota atteint ».
        $this->actingAs($user)
            ->post(route('likes.store', $target->id))
            ->assertRedirect()
            ->assertSessionHas('info');
    }

    // --- Quota de premiers messages ---

    public function test_opening_a_conversation_consumes_the_first_message_quota(): void
    {
        config(['entitlements.free.first_messages_per_day' => 1]);

        $user = User::factory()->create();
        $first = User::factory()->create();
        $second = User::factory()->create();

        $this->actingAs($user)
            ->post(route('messages.store', $this->conversationBetween($user, $first)), [
                'content' => 'Bonjour, ravie de te rencontrer.',
            ])
            ->assertRedirect();

        // Deuxième ouverture le même jour : refusée.
        $this->actingAs($user)
            ->post(route('messages.store', $this->conversationBetween($user, $second)), [
                'content' => 'Bonjour, comment vas-tu aujourd’hui ?',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertSame(1, Message::where('sender_id', $user->id)->count());
    }

    public function test_replying_is_never_rationed(): void
    {
        config(['entitlements.free.first_messages_per_day' => 1]);

        $user = User::factory()->create();
        $other = User::factory()->create();
        $conversation = $this->conversationBetween($user, $other);

        // L'autre personne écrit en premier.
        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $other->id,
            'content' => 'Coucou, ton profil me plaît beaucoup.',
        ]);

        // Le quota est déjà consommé ailleurs.
        $third = User::factory()->create();
        $this->actingAs($user)->post(
            route('messages.store', $this->conversationBetween($user, $third)),
            ['content' => 'Bonjour, enchantée de faire ta connaissance.']
        );

        // Répondre doit rester possible.
        $this->actingAs($user)
            ->post(route('messages.store', $conversation), [
                'content' => 'Merci beaucoup, le tien aussi.',
            ])
            ->assertRedirect()
            ->assertSessionMissing('error');

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
        ]);
    }

    public function test_zero_means_unlimited_first_messages(): void
    {
        $user = User::factory()->create();
        $this->subscribe($user, ['first_messages_per_day' => 0]);

        $this->assertNull(app(EntitlementService::class)->firstMessagesRemaining($user->fresh()));
    }

    private function conversationBetween(User $a, User $b): Conversation
    {
        return Conversation::create([
            'user1_id' => $a->id,
            'user2_id' => $b->id,
            'last_message_at' => now(),
        ]);
    }
}
