<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\Photo;
use App\Models\Report;
use App\Models\User;
use App\Models\VerificationPhoto;
use App\Services\AccountErasureService;
use App\Services\ModerationAuditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class ClosedAccountModerationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        // This suite does not touch files or the shared Storage::fake folders.
        $disk = Mockery::mock();
        $disk->shouldReceive('exists')->andReturn(false);
        Storage::shouldReceive('disk')->andReturn($disk);
    }

    public function test_closure_preserves_media_but_excludes_it_from_publication_queues_and_counts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $closed = User::factory()->communityMember()->create();
        $active = User::factory()->communityMember()->create();
        $closedPhoto = Photo::factory()->create(['user_id' => $closed->id, 'created_at' => now()->subDays(2)]);
        Photo::factory()->create(['user_id' => $closed->id, 'moderation_status' => 'quarantined']);
        $closedSelfie = VerificationPhoto::factory()->create(['user_id' => $closed->id, 'created_at' => now()->subDays(2)]);
        Photo::factory()->create(['user_id' => $active->id, 'created_at' => now()->subDays(2)]);
        Photo::factory()->create(['user_id' => $active->id, 'moderation_status' => 'quarantined']);
        VerificationPhoto::factory()->create(['user_id' => $active->id, 'created_at' => now()->subDays(2)]);
        $conversation = Conversation::create(['user1_id' => $closed->id, 'user2_id' => $active->id]);
        $proof = EphemeralMedia::factory()->flagged()->create(['conversation_id' => $conversation->id, 'sender_id' => $closed->id, 'recipient_id' => $active->id]);
        $report = Report::factory()->create(['reporter_id' => $active->id, 'reported_user_id' => $closed->id, 'ephemeral_media_id' => $proof->id]);

        app(AccountErasureService::class)->requestDeletion($closed);
        $this->assertSoftDeleted('users', ['id' => $closed->id]);
        $this->assertDatabaseHas('photos', ['id' => $closedPhoto->id, 'moderation_status' => 'pending']);
        $this->assertDatabaseHas('verification_photos', ['id' => $closedSelfie->id, 'status' => 'pending']);

        $this->actingAs($admin)->get(route('admin.moderation.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->has('pendingPhotos', 2)->has('pendingVerifications', 1)->has('openReports', 1)
            ->where('stats.pending_photos', 2)->where('stats.pending_verifications', 1)
            ->where('adminAlerts.pending_photos', 2)->where('adminAlerts.pending_verifications', 1)
            ->where('operations.backlogs.photos', 1)->where('operations.backlogs.verifications', 1));
        $this->get(route('admin.photos.pending'))->assertOk()->assertInertia(fn ($page) => $page->has('photos.data', 2));
        $this->get(route('admin.verifications.index'))->assertOk()->assertInertia(fn ($page) => $page->has('verifications.data', 1)
            ->missing('verifications.data.0.user.name')->missing('verifications.data.0.user.email')->missing('verifications.data.0.user.photos'));
        $this->get(route('admin.dashboard'))->assertOk()->assertInertia(fn ($page) => $page
            ->where('stats.moderation.pending_photos', 2)->where('stats.moderation.pending_verifications', 1));
        $this->get(route('admin.ephemeral.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->has('flagged', 1)->where('flagged.0.sender.pseudo', $closed->pseudo));
        $this->get(route('admin.reports.show', $report))->assertOk();
        $this->get(route('admin.messages.index'))->assertOk();

        $this->post(route('admin.photos.approve', $closedPhoto))->assertStatus(409);
        $this->post(route('admin.verifications.approve', $closedSelfie), ['photos_match_confirmed' => true])->assertStatus(409);
        $this->get(route('admin.verifications.image', $closedSelfie))->assertNotFound();
        $this->assertDatabaseHas('photos', ['id' => $closedPhoto->id, 'is_approved' => false]);
        $this->assertDatabaseHas('verification_photos', ['id' => $closedSelfie->id, 'status' => 'pending']);
    }

    public function test_email_redaction_in_report_and_audit_payloads_keeps_original_evidence(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'name' => 'Identité privée']);
        $report = Report::factory()->create(['description' => 'Écrit depuis ancienne@example.test.', 'admin_notes' => 'Réponse vers retour@example.test.']);
        $action = app(ModerationAuditService::class)->record($admin, $report, 'report_updated', $report->reportedUser, 'Contact ancienne@example.test', 'Réponse vers retour@example.test.');
        $this->actingAs($admin)->get(route('admin.reports.show', $report))->assertOk()->assertInertia(fn ($page) => $page
            ->where('report.description', 'Écrit depuis [adresse masquée].')
            ->where('report.admin_notes', 'Réponse vers [adresse masquée].'));
        $this->get(route('admin.reports.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->where('reports.data.0.description', 'Écrit depuis [adresse masquée].'));
        $this->get(route('admin.moderation.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->where('openReports.0.description', 'Écrit depuis [adresse masquée].'));
        $this->get(route('admin.moderation.audit'))->assertOk()->assertInertia(fn ($page) => $page
            ->where('actions.data.0.reason', 'Contact [adresse masquée]')
            ->where('actions.data.0.notes', 'Réponse vers [adresse masquée].')
            ->where('actions.data.0.moderator.name', $admin->pseudo)->missing('actions.data.0.moderator.email'));
        $this->assertSame('Écrit depuis ancienne@example.test.', $report->fresh()->description);
        $this->assertSame('Contact ancienne@example.test', $action->fresh()->reason);
    }
}
