<?php

namespace Tests\Feature;

use App\Models\EphemeralMedia;
use App\Models\User;
use App\Models\VerificationPhoto;
use App\Services\OperationalHealthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class OperationalHealthTest extends TestCase
{
    use RefreshDatabase;

    public function test_unobserved_tasks_are_unknown_and_make_monitoring_fail(): void
    {
        Cache::flush();
        $snapshot = app(OperationalHealthService::class)->snapshot();
        $this->assertSame('unknown', $snapshot['tasks'][0]['state']);
        $this->assertTrue($snapshot['needs_attention']);
        $this->artisan('operations:status', ['--json' => true])->assertFailed();
    }

    public function test_recent_successes_go_stale_and_a_failure_can_recover(): void
    {
        Cache::flush();
        $health = app(OperationalHealthService::class);
        foreach (array_keys(config('operations.tasks')) as $task) {
            $health->record($task, 'success');
        }
        $this->assertFalse($health->snapshot()['needs_attention']);
        $this->artisan('operations:status')->assertSuccessful();
        $this->travel(6)->minutes();
        $this->assertSame('late', $health->snapshot()['tasks'][0]['state']);
        $health->record('scheduler', 'failed');
        $this->assertSame('failed', $health->snapshot()['tasks'][0]['state']);
        $health->record('scheduler', 'success');
        $health->record('messages:retry-delivery', 'success');
        $this->assertFalse($health->snapshot()['needs_attention']);
        $this->assertNotNull($health->snapshot()['tasks'][0]['last_failure_at']);
    }

    public function test_delays_are_counted_without_exposing_private_media_or_flagged_purges(): void
    {
        VerificationPhoto::factory()->create(['created_at' => now()->subHours(25)]);
        VerificationPhoto::factory()->create();
        EphemeralMedia::factory()->video()->create(['processing_status' => 'pending', 'created_at' => now()->subMinutes(21)]);
        EphemeralMedia::factory()->video()->create(['processing_status' => 'failed']);
        EphemeralMedia::factory()->flagged()->create(['purge_after' => now()->subDays(2)]);
        $snapshot = app(OperationalHealthService::class)->snapshot();
        $this->assertSame(1, $snapshot['backlogs']['verifications']);
        $this->assertSame(1, $snapshot['backlogs']['videos_pending']);
        $this->assertSame(1, $snapshot['backlogs']['videos_failed']);
        $this->assertSame(0, $snapshot['backlogs']['purges_due']);
        $this->assertStringNotContainsString('ephemeral/', json_encode($snapshot));
        $this->assertStringNotContainsString('verifications/', json_encode($snapshot));
    }

    public function test_operations_state_is_only_visible_to_administrators(): void
    {
        $this->actingAs(User::factory()->communityMember()->create())
            ->get(route('admin.moderation.index'))->assertForbidden();
        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->get(route('admin.moderation.index'))->assertOk()
            ->assertInertia(fn ($page) => $page->has('operations.tasks', 7)->has('operations.backlogs'));
    }
}
