<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_list_exposes_the_real_gem_balance(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create([
            'name' => 'Steff',
            'gems' => 1234,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.users.index', ['search' => 'Steff']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Users/Index')
                ->has('users.data', 1)
                ->where('users.data.0.id', $member->id)
                ->where('users.data.0.gems_balance', 1234)
            );
    }

    public function test_admin_user_sheet_exposes_the_real_gem_balance(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create(['gems' => 5678]);

        $this->actingAs($admin)
            ->get(route('admin.users.show', $member))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Users/Show')
                ->where('user.gems_balance', 5678)
            );
    }
}
