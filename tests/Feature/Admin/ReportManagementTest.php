<?php

namespace Tests\Feature\Admin;

use App\Models\ModerationAction;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ReportManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_list_reports(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.reports.index'))
            ->assertForbidden();
    }

    public function test_admin_sees_pending_reports_by_default(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Report::factory()->create();
        Report::factory()->dismissed()->create();

        $this->actingAs($admin)
            ->get(route('admin.reports.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Reports/Index')
                ->where('status', 'pending')
                ->has('reports.data', 1)
                ->where('counts.pending', 1)
                ->where('counts.dismissed', 1)
            );
    }

    public function test_admin_can_filter_reports_by_status(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Report::factory()->create();
        Report::factory()->actioned()->count(2)->create();

        $this->actingAs($admin)
            ->get(route('admin.reports.index', ['status' => 'actioned']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('status', 'actioned')
                ->has('reports.data', 2)
            );
    }

    public function test_invalid_status_falls_back_to_pending(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Report::factory()->create();

        $this->actingAs($admin)
            ->get(route('admin.reports.index', ['status' => 'wat']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('status', 'pending')
                ->has('reports.data', 1)
            );
    }

    public function test_report_payload_exposes_both_parties(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $reporter = User::factory()->create(['pseudo' => 'signaleuse']);
        $reported = User::factory()->create(['pseudo' => 'signalee']);
        Report::factory()->create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $reported->id,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.reports.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('reports.data.0.reporter.pseudo', 'signaleuse')
                ->where('reports.data.0.reported_user.pseudo', 'signalee')
            );
    }

    public function test_admin_can_dismiss_a_report(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $report = Report::factory()->create();

        $this->actingAs($admin)
            ->put(route('admin.reports.update', $report), [
                'status' => 'dismissed',
                'admin_notes' => 'Signalement infondé.',
            ])
            ->assertRedirect();

        $report->refresh();
        $this->assertSame('dismissed', $report->status);
        $this->assertSame('Signalement infondé.', $report->admin_notes);
        $this->assertFalse($report->reportedUser->is_banned);
    }

    public function test_admin_can_action_a_report_and_ban_the_reported_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $report = Report::factory()->create(['reason' => 'harassment']);

        $this->actingAs($admin)
            ->put(route('admin.reports.update', $report), [
                'status' => 'actioned',
                'admin_notes' => 'Récidive.',
                'ban_user' => true,
            ])
            ->assertRedirect();

        $report->refresh();
        $this->assertSame('actioned', $report->status);
        $this->assertTrue($report->reportedUser->is_banned);
        $this->assertSame('harassment', $report->reportedUser->ban_reason);
        $this->assertNotNull($report->reportedUser->banned_at);
    }

    public function test_updating_a_report_records_a_moderation_action(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $report = Report::factory()->create();

        $this->actingAs($admin)
            ->put(route('admin.reports.update', $report), [
                'status' => 'reviewed',
                'admin_notes' => 'En cours.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('moderation_actions', [
            'moderator_id' => $admin->id,
            'subject_user_id' => $report->reported_user_id,
            'subject_type' => Report::class,
            'subject_id' => $report->id,
            'action' => 'report_updated',
        ]);

        $this->assertSame(1, ModerationAction::count());
    }

    public function test_non_admin_cannot_update_a_report(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $report = Report::factory()->create();

        $this->actingAs($user)
            ->put(route('admin.reports.update', $report), ['status' => 'dismissed'])
            ->assertForbidden();

        $this->assertSame('pending', $report->fresh()->status);
    }

    public function test_status_must_be_a_known_value(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $report = Report::factory()->create();

        $this->actingAs($admin)
            ->put(route('admin.reports.update', $report), ['status' => 'wat'])
            ->assertSessionHasErrors('status');
    }
}
