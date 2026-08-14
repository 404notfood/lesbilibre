<?php

namespace Tests\Feature\Admin;

use App\Models\GemTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class GemEconomyTest extends TestCase
{
    use RefreshDatabase;

    private function transaction(User $user, string $type, int $amount, float $price = 0): GemTransaction
    {
        return GemTransaction::create([
            'user_id' => $user->id,
            'type' => $type,
            'amount' => $amount,
            'price' => $price,
            'balance_after' => max(0, $amount),
            'description' => "Mouvement {$type}",
        ]);
    }

    public function test_non_admin_cannot_reach_the_gem_economy(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.gems.index'))
            ->assertForbidden();
    }

    public function test_economy_separates_issued_from_spent_gems(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'gems' => 0]);
        $member = User::factory()->create(['gems' => 300]);

        $this->transaction($member, 'purchase', 500, 19.99);
        $this->transaction($member, 'gift_sent', -200);

        $this->actingAs($admin)
            ->get(route('admin.gems.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Gems/Index')
                ->where('stats.issued', 500)
                ->where('stats.spent', 200)
                ->where('stats.in_circulation', 300)
                ->where('stats.revenue', 19.99)
            );
    }

    public function test_economy_groups_movements_by_type(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();

        $this->transaction($member, 'purchase', 100);
        $this->transaction($member, 'purchase', 250);
        $this->transaction($member, 'gift_sent', -50);

        $this->actingAs($admin)
            ->get(route('admin.gems.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('byType', 2)
                ->where('byType.0.type', 'purchase')
                ->where('byType.0.movements', 2)
                ->where('byType.0.total', 350)
            );
    }

    public function test_transactions_can_be_filtered_by_type(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();

        $this->transaction($member, 'purchase', 100);
        $this->transaction($member, 'gift_sent', -50);

        $this->actingAs($admin)
            ->get(route('admin.gems.index', ['type' => 'gift_sent']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('transactions.data', 1)
                ->where('transactions.data.0.type', 'gift_sent')
            );
    }

    public function test_transactions_can_be_searched_by_member(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $alice = User::factory()->create(['pseudo' => 'alice']);
        $bea = User::factory()->create(['pseudo' => 'bea']);

        $this->transaction($alice, 'purchase', 100);
        $this->transaction($bea, 'purchase', 200);

        $this->actingAs($admin)
            ->get(route('admin.gems.index', ['search' => 'alice']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('transactions.data', 1)
                ->where('transactions.data.0.user.pseudo', 'alice')
            );
    }

    public function test_top_holders_are_ranked_by_balance(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'gems' => 0]);
        User::factory()->create(['pseudo' => 'riche', 'gems' => 900]);
        User::factory()->create(['pseudo' => 'moyenne', 'gems' => 400]);
        User::factory()->create(['pseudo' => 'vide', 'gems' => 0]);

        $this->actingAs($admin)
            ->get(route('admin.gems.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('topHolders', 2)
                ->where('topHolders.0.pseudo', 'riche')
                ->where('topHolders.1.pseudo', 'moyenne')
            );
    }

    public function test_admin_can_open_a_member_gem_sheet(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create(['gems' => 120]);
        $this->transaction($member, 'admin_add', 120);

        $this->actingAs($admin)
            ->get(route('admin.gems.show', $member))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Gems/Show')
                ->where('user.gems', 120)
                ->has('transactions', 1)
            );
    }

    public function test_admin_can_credit_gems_to_a_member(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create(['gems' => 10]);

        $this->actingAs($admin)
            ->post(route('admin.gems.add', $member), [
                'amount' => 50,
                'description' => 'Geste commercial',
            ])
            ->assertRedirect();

        $this->assertSame(60, $member->fresh()->gems);
        $this->assertDatabaseHas('gem_transactions', [
            'user_id' => $member->id,
            'type' => 'admin_add',
            'amount' => 50,
            'balance_after' => 60,
        ]);
    }

    public function test_removing_more_gems_than_owned_empties_the_balance(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create(['gems' => 30]);

        $this->actingAs($admin)
            ->post(route('admin.gems.remove', $member), [
                'amount' => 100,
                'description' => 'Correction',
            ])
            ->assertRedirect();

        $this->assertSame(0, $member->fresh()->gems);
        $this->assertDatabaseHas('gem_transactions', [
            'user_id' => $member->id,
            'type' => 'admin_remove',
            'amount' => -30,
        ]);
    }
}
