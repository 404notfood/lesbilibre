<?php

namespace Tests\Feature;

use App\Jobs\ModeratePhoto;
use App\Models\BlockedUser;
use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\GalleryAccessRequest;
use App\Models\Message;
use App\Models\Photo;
use App\Models\Report;
use App\Models\User;
use App\Models\VerificationPhoto;
use App\Services\EphemeralReportService;
use App\Services\ModerationAuditService;
use App\Services\PhotoProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ModerationSafetyRegressionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['app.debug' => false]);
        Http::preventStrayRequests();
        Storage::fake('local');
        Storage::fake('public');
    }

    private function parties(): array
    {
        $sender = User::factory()->communityMember()->create();
        $recipient = User::factory()->communityMember()->create();
        $conversation = Conversation::create(['user1_id' => $sender->id, 'user2_id' => $recipient->id]);

        return [$sender, $recipient, $conversation];
    }

    private function media(): EphemeralMedia
    {
        [$sender, $recipient, $conversation] = $this->parties();

        return EphemeralMedia::factory()->create([
            'sender_id' => $sender->id, 'recipient_id' => $recipient->id, 'conversation_id' => $conversation->id,
        ]);
    }

    public function test_automatic_quarantine_is_unavailable_to_members_and_visible_to_moderation(): void
    {
        [$viewer, $owner] = $this->parties();
        $photo = Photo::factory()->create(['user_id' => $owner->id, 'is_approved' => true]);
        config(['services.moderation.url' => 'http://moderation.test', 'services.moderation.quarantine_threshold' => 0.8]);
        Http::fake(['http://moderation.test/classify' => Http::response(['scores' => ['nsfw' => 0.99]])]);
        (new ModeratePhoto($photo->id))->handle();
        $this->assertFalse($photo->fresh()->is_approved);
        $this->actingAs($viewer)->get(route('media.photo', $photo))->assertNotFound();

        // Legacy quarantines used to retain is_approved=true.
        $photo->update(['is_approved' => true]);
        $this->assertFalse($photo->fresh()->isVisibleTo(true));
        $this->get(route('media.photo', $photo))->assertNotFound();
        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->get(route('admin.photos.pending'))->assertOk()
            ->assertInertia(fn ($page) => $page->has('photos.data', 1)->where('photos.data.0.id', $photo->id)
                ->where('photos.data.0.moderation_status', 'quarantined'));
    }

    public function test_approval_of_a_quarantine_clears_the_old_rejection_reason(): void
    {
        $photo = Photo::factory()->create(['moderation_status' => 'quarantined', 'rejection_reason' => 'À examiner']);
        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->post(route('admin.photos.approve', $photo))->assertRedirect();
        $this->assertSame('approved', $photo->fresh()->moderation_status);
        $this->assertNull($photo->fresh()->rejection_reason);
        $this->assertTrue($photo->fresh()->is_approved);
    }

    public function test_blocking_preserves_reported_evidence_and_cuts_member_access(): void
    {
        Storage::fake('local');
        $medium = $this->media();
        Storage::disk('local')->put($medium->path, 'synthetic evidence');
        $message = Message::create(['conversation_id' => $medium->conversation_id, 'sender_id' => $medium->sender_id, 'content' => 'Synthetic message']);
        $this->actingAs($medium->recipient)->post(route('ephemeral.report', $medium), ['reason' => 'Signalement synthétique pour cet essai.'])->assertRedirect();
        $this->post(route('block.store', $medium->sender_id))->assertRedirect();
        $this->post(route('block.store', $medium->sender_id))->assertRedirect();
        $this->assertDatabaseCount('blocked_users', 1);
        $this->assertDatabaseHas('conversations', ['id' => $medium->conversation_id]);
        $this->assertDatabaseHas('messages', ['id' => $message->id]);
        $this->assertDatabaseHas('ephemeral_media', ['id' => $medium->id, 'is_flagged' => true]);
        Storage::disk('local')->assertExists($medium->path);
        $this->get(route('ephemeral.show', $medium))->assertForbidden();
        $response = $this->get(route('conversations.show', $medium->conversation_id));
        $this->assertContains($response->status(), [403, 404]);
        $this->actingAs(User::factory()->create(['is_admin' => true]))->get(route('admin.ephemeral.file', $medium))->assertOk();
    }

    public function test_report_and_gallery_payloads_expose_only_public_account_fields(): void
    {
        [$requester, $owner] = $this->parties();
        $photo = Photo::factory()->primary()->create(['user_id' => $requester->id]);
        $access = GalleryAccessRequest::create(['requester_user_id' => $requester->id, 'owner_user_id' => $owner->id, 'status' => 'pending']);
        $this->actingAs($owner)->get(route('reports.create', $requester->id))->assertOk()
            ->assertInertia(fn ($page) => $page->missing('reportedUser.email')->missing('reportedUser.name')->missing('reportedUser.gems')->missing('reportedUser.profile'));
        $this->get(route('gallery-access.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->where('requests.0.requester.avatar_url', route('media.photo', $photo))
            ->missing('requests.0.requester.email')->missing('requests.0.requester.name')->missing('requests.0.requester.photos')
            ->missing('requests.0.requester.profile')->missing('requests.0.requester.gems'));
        $access->update(['status' => 'accepted']);
        $this->get(route('gallery-access.manage'))->assertOk()->assertInertia(fn ($page) => $page
            ->missing('accessGranted.0.requester.email')->missing('accessGranted.0.requester.photos'));
    }

    public function test_gallery_requests_and_grants_cannot_contact_a_blocked_account(): void
    {
        foreach ([false, true] as $otherBlocks) {
            $viewer = User::factory()->communityMember()->create(['gems' => 200]);
            $other = User::factory()->communityMember()->create();
            BlockedUser::create(['blocker_id' => $otherBlocks ? $other->id : $viewer->id, 'blocked_id' => $otherBlocks ? $viewer->id : $other->id]);
            $this->actingAs($viewer)->post(route('gallery-access.request', $other->id))->assertForbidden();
            $this->post(route('gallery-access.grant', $other->id))->assertForbidden();
            $this->assertSame(200, $viewer->fresh()->gems);
            $this->assertDatabaseMissing('gallery_access_requests', ['requester_user_id' => $viewer->id, 'owner_user_id' => $other->id]);
        }
    }

    public function test_ephemeral_reports_are_structured_idempotent_and_do_not_extend_retention(): void
    {
        $medium = $this->media();
        $purgeAt = $medium->purge_after;
        $this->actingAs($medium->recipient);
        foreach (range(1, 2) as $attempt) {
            $this->post(route('ephemeral.report', $medium), ['reason' => 'Signalement synthétique répété.'])->assertRedirect();
        }
        $this->assertDatabaseCount('reports', 1);
        $this->assertDatabaseHas('reports', ['ephemeral_media_id' => $medium->id, 'reporter_id' => $medium->recipient_id]);
        $this->assertTrue($medium->fresh()->is_flagged);
        $this->assertTrue($medium->fresh()->purge_after->equalTo($purgeAt));
    }

    public function test_reviewed_reports_keep_the_hold_until_every_linked_report_is_closed(): void
    {
        $medium = $this->media();
        $first = app(EphemeralReportService::class)->report($medium, $medium->recipient, 'Signalement synthétique.');
        $second = Report::factory()->create(['ephemeral_media_id' => $medium->id, 'reporter_id' => $medium->recipient_id, 'reported_user_id' => $medium->sender_id]);
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $this->put(route('admin.reports.update', $first), ['status' => 'reviewed', 'admin_notes' => 'Examen en cours.'])->assertRedirect();
        $this->assertTrue($medium->fresh()->is_flagged);
        $this->put(route('admin.reports.update', $first), ['status' => 'dismissed', 'admin_notes' => 'Après examen des éléments.'])->assertRedirect();
        $this->assertTrue($medium->fresh()->is_flagged);
        $this->put(route('admin.reports.update', $second), ['status' => 'dismissed', 'admin_notes' => 'Après examen des éléments.'])->assertRedirect();
        $this->assertFalse($medium->fresh()->is_flagged);
    }

    public function test_media_console_closes_linked_reports_and_requires_a_decision_reason(): void
    {
        $medium = $this->media();
        $report = app(EphemeralReportService::class)->report($medium, $medium->recipient, 'Signalement synthétique.');
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $this->post(route('admin.ephemeral.dismiss', $medium))->assertSessionHasErrors('reason');
        $this->assertTrue($medium->fresh()->is_flagged);
        $this->post(route('admin.ephemeral.dismiss', $medium), ['reason' => 'Après examen, aucun manquement.'])->assertRedirect();
        $this->assertSame('dismissed', $report->fresh()->status);
        $this->assertFalse($medium->fresh()->is_flagged);
        $this->assertDatabaseHas('moderation_actions', ['action' => 'ephemeral_report_dismissed', 'notes' => 'Après examen, aucun manquement.']);
    }

    public function test_duplicate_upload_is_rejected_before_creating_additional_files(): void
    {
        Storage::fake('public');
        Bus::fake([ModeratePhoto::class]);
        $user = User::factory()->communityMember()->create();
        $upload = UploadedFile::fake()->image('duplicate.jpg', 100, 100);
        $this->actingAs($user)->post(route('photos.store'), ['photo' => $upload])->assertRedirect();
        $files = Storage::disk('public')->allFiles();
        $this->post(route('photos.store'), ['photo' => $upload])->assertRedirect()->assertSessionHas('error');
        $this->assertSame($files, Storage::disk('public')->allFiles());
        $this->assertDatabaseCount('photos', 1);
    }

    public function test_a_duplicate_detected_after_processing_cleans_only_the_new_files(): void
    {
        Storage::fake('public');
        $user = User::factory()->communityMember()->create();
        $existing = Photo::factory()->create(['user_id' => $user->id]);
        $stored = ['path' => 'photos/new.jpg', 'thumbnail_path' => 'photos/new-thumb.jpg', 'content_hash' => $existing->content_hash];
        Storage::disk('public')->put($existing->path, 'existing synthetic bytes');
        Storage::disk('public')->put($stored['path'], 'new synthetic bytes');
        Storage::disk('public')->put($stored['thumbnail_path'], 'new synthetic poster');
        $this->mock(PhotoProcessingService::class, fn ($mock) => $mock->shouldReceive('storePublicPhoto')->once()->andReturn($stored));
        $this->actingAs($user)->post(route('photos.store'), ['photo' => UploadedFile::fake()->image('new.jpg', 100, 100)])
            ->assertRedirect()->assertSessionHas('error');
        Storage::disk('public')->assertMissing([$stored['path'], $stored['thumbnail_path']]);
        Storage::disk('public')->assertExists($existing->path);
        $this->assertDatabaseCount('photos', 1);
    }

    public function test_oversized_image_dimensions_are_refused_before_processing(): void
    {
        $this->mock(PhotoProcessingService::class, fn ($mock) => $mock->shouldNotReceive('storePublicPhoto'));
        $this->actingAs(User::factory()->communityMember()->create())
            ->post(route('photos.store'), ['photo' => UploadedFile::fake()->image('too-wide.png', 6001, 10)])
            ->assertSessionHasErrors('photo');
        $this->assertDatabaseCount('photos', 0);
    }

    public function test_classifier_never_publishes_a_photo_even_for_a_verified_owner(): void
    {
        $owner = User::factory()->communityMember()->create(['is_verified' => true]);
        $photo = Photo::factory()->create(['user_id' => $owner->id]);
        config(['services.moderation.url' => 'http://moderation.test', 'services.moderation.quarantine_threshold' => 0.8]);
        Http::fake(['http://moderation.test/classify' => Http::response(['scores' => ['nsfw' => 0.01]])]);
        (new ModeratePhoto($photo->id))->handle();
        $this->assertFalse($photo->fresh()->is_approved);
        $this->assertSame('pending', $photo->fresh()->moderation_status);
        $this->actingAs(User::factory()->communityMember()->create())->get(route('media.photo', $photo))->assertNotFound();
    }

    public function test_ephemeral_requires_an_explicit_admin_decision_before_delivery(): void
    {
        $medium = $this->media();
        Storage::disk('local')->put($medium->path, 'synthetic bytes');
        $this->actingAs($medium->recipient)->get(route('ephemeral.show', $medium))->assertForbidden();
        $this->get(route('conversations.show', $medium->conversation_id))->assertInertia(fn ($page) => $page->has('ephemeral', 0));
        $this->assertNull($medium->fresh()->first_viewed_at);
        $this->actingAs($medium->sender)->get(route('conversations.show', $medium->conversation_id))
            ->assertInertia(fn ($page) => $page->where('ephemeral.0.moderation_status', 'pending')->where('ephemeral.0.can_open', false));

        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->get(route('admin.ephemeral.index'))->assertInertia(fn ($page) => $page
            ->has('pending', 1)->missing('pending.0.sender.name')->missing('pending.0.sender.email'));
        $this->get(route('admin.ephemeral.file', $medium))->assertOk();
        $this->assertDatabaseHas('moderation_actions', ['action' => 'ephemeral_prepublication_reviewed', 'subject_id' => $medium->id]);
        $this->post(route('admin.ephemeral.approve', $medium))->assertSessionHasErrors('review_confirmed');
        $this->post(route('admin.ephemeral.approve', $medium), ['review_confirmed' => true])->assertRedirect();
        $this->assertDatabaseHas('ephemeral_media', ['id' => $medium->id, 'moderation_status' => 'approved', 'moderator_id' => $admin->id]);
        $this->get(route('admin.ephemeral.file', $medium))->assertForbidden();
        $this->actingAs($medium->recipient)->get(route('ephemeral.show', $medium))->assertOk();
    }

    public function test_rejected_or_unprocessed_ephemeral_is_never_delivered(): void
    {
        $medium = $this->media();
        Storage::disk('local')->put($medium->path, 'synthetic bytes');
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $medium->update(['processing_status' => 'pending']);
        $this->post(route('admin.ephemeral.approve', $medium), ['review_confirmed' => true])->assertStatus(422);
        $medium->update(['processing_status' => 'ready']);
        $this->post(route('admin.ephemeral.reject', $medium))->assertSessionHasErrors('reason');
        $this->post(route('admin.ephemeral.reject', $medium), ['reason' => 'Contenu non conforme.'])->assertRedirect();
        $this->post(route('admin.ephemeral.approve', $medium), ['review_confirmed' => true])->assertStatus(409);
        $this->actingAs($medium->recipient)->get(route('ephemeral.show', $medium))->assertForbidden();
        $this->get(route('conversations.show', $medium->conversation_id))->assertInertia(fn ($page) => $page->has('ephemeral', 0));
        $this->actingAs($medium->sender)->get(route('conversations.show', $medium->conversation_id))->assertInertia(fn ($page) => $page
            ->where('ephemeral.0.moderation_status', 'rejected')->where('ephemeral.0.moderation_reason', 'Contenu non conforme.'));
    }

    public function test_legacy_approval_requires_human_audit_and_legacy_evidence_links_are_verified(): void
    {
        $owner = User::factory()->communityMember()->create(['is_verified' => true]);
        $automatic = Photo::factory()->primary()->create(['user_id' => $owner->id]);
        $human = Photo::factory()->approved()->create();
        $selfie = VerificationPhoto::factory()->create(['user_id' => $owner->id]);
        app(ModerationAuditService::class)->record(User::factory()->create(['is_admin' => true]), $human, 'photo_approved', $human->user);
        $medium = $this->media();
        $report = Report::factory()->create([
            'reporter_id' => $medium->recipient_id, 'reported_user_id' => $medium->sender_id,
            'description' => '[Contenu éphémère #'.$medium->id.'] Signalement historique.',
        ]);
        $forged = Report::factory()->create(['description' => $report->description]);
        $migration = require database_path('migrations/2026_10_21_100002_link_reports_to_ephemeral_media.php');
        $migration->down();
        $migration->up();
        $this->assertDatabaseHas('photos', ['id' => $automatic->id, 'is_approved' => false, 'moderation_status' => 'pending']);
        $this->assertDatabaseHas('photos', ['id' => $human->id, 'is_approved' => true, 'moderation_status' => 'approved']);
        $this->assertFalse($owner->fresh()->is_verified);
        $this->assertSame('rejected', $selfie->fresh()->status);
        $this->assertSame($medium->id, $report->fresh()->ephemeral_media_id);
        $this->assertNull($forged->fresh()->ephemeral_media_id);
        $this->assertSame('pending', $medium->fresh()->moderation_status);
        $this->assertTrue($medium->fresh()->is_flagged);
    }
}
