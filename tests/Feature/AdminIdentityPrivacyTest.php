<?php

namespace Tests\Feature;

use App\Models\GemTransaction;
use App\Models\Referral;
use App\Models\Report;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminIdentityPrivacyTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrative_pages_expose_pseudos_without_member_emails_or_civil_names(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->communityMember()->create(['name' => 'Identite civile confidentielle', 'pseudo' => 'CamilleLibre', 'email' => 'camille.private@example.com']);
        $other = User::factory()->communityMember()->create(['name' => 'Autre identite confidentielle', 'pseudo' => 'LouLibre', 'email' => 'lou.private@example.com']);
        $subscription = Subscription::factory()->create(['user_id' => $member->id]);
        Referral::factory()->create(['referrer_id' => $member->id, 'referred_user_id' => $other->id]);
        Report::factory()->create(['reporter_id' => $member->id, 'reported_user_id' => $other->id]);
        GemTransaction::create(['user_id' => $member->id, 'type' => 'purchase', 'amount' => 10, 'balance_after' => 10, 'description' => 'Achat de gemmes']);

        $routes = [
            route('admin.dashboard'),
            route('admin.users.index'),
            route('admin.users.show', $member),
            route('admin.gems.index'),
            route('admin.gems.show', $member),
            route('admin.subscriptions.index'),
            route('admin.subscriptions.show', $subscription),
            route('admin.subscriptions.edit', $subscription),
            route('admin.subscriptions.create', ['user_id' => $member->id]),
            route('admin.subscriptions.create', ['search' => 'CamilleLibre']),
            route('admin.referrals.index'),
        ];
        foreach ($routes as $url) {
            $props = $this->actingAs($admin)->get($url)->assertOk()->viewData('page')['props'];
            unset($props['auth']); // The authenticated account keeps its own email for settings.
            $payload = json_encode($props, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
            $this->assertStringNotContainsString($member->email, $payload, $url);
            $this->assertStringNotContainsString($other->email, $payload, $url);
            $this->assertStringNotContainsString($member->name, $payload, $url);
            $this->assertStringNotContainsString($other->name, $payload, $url);
            $this->assertStringNotContainsString('"email":', $payload, $url);
        }
    }

    public function test_subscription_admin_pages_survive_a_closed_member_account(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $subscription = Subscription::factory()->create(['user_id' => $member->id]);
        $member->delete();
        foreach (['admin.subscriptions.index', 'admin.subscriptions.show', 'admin.subscriptions.edit'] as $route) {
            $this->actingAs($admin)->get(route($route, $route === 'admin.subscriptions.index' ? [] : [$subscription]))->assertOk();
        }
    }

    public function test_old_gift_text_and_identity_metadata_are_not_shared_in_gem_history(): void
    {
        $member = User::factory()->communityMember()->create();
        $transaction = GemTransaction::create([
            'user_id' => $member->id, 'type' => 'earn', 'reason' => 'gift_received',
            'amount' => 10, 'balance_after' => 10,
            'description' => 'Cadeau reçu de Identite privee',
            'metadata' => ['sender_name' => 'Identite privee', 'message' => 'Texte jamais modéré test@example.com'],
        ]);
        $response = $this->actingAs($member)->get(route('gems.history'))->assertOk();
        $data = $response->viewData('page')['props']['transactions'][0];
        $this->assertSame('Cadeau reçu', $data['description']);
        $this->assertArrayNotHasKey('metadata', $data);
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->get(route('admin.gems.show', $member))->assertOk()->assertInertia(fn ($page) => $page->where('transactions.0.id', $transaction->id)->where('transactions.0.description', 'Cadeau reçu'));
    }
}
