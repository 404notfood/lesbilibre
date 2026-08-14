<?php

namespace Tests\Feature\Admin;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ModerationDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_moderation_index_loads_with_open_reports(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $reported = User::factory()->create(['name' => 'Compte signalé']);
        Report::factory()->create(['reported_user_id' => $reported->id]);

        $this->actingAs($admin)
            ->get(route('admin.moderation.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Moderation/Index')
                ->has('openReports', 1)
                ->where('openReports.0.reported.name', 'Compte signalé')
                ->where('stats.open_reports', 1)
            );
    }

    public function test_admin_dashboard_loads_with_pending_reports(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $reported = User::factory()->create(['name' => 'Compte signalé']);
        Report::factory()->create(['reported_user_id' => $reported->id]);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('recent_reports', 1)
                ->where('recent_reports.0.reported', 'Compte signalé')
                ->where('recent_reports.0.reported_id', $reported->id)
            );
    }
}
