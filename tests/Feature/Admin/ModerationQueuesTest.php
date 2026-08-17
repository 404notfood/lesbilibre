<?php

namespace Tests\Feature\Admin;

use App\Models\Photo;
use App\Models\Report;
use App\Models\User;
use App\Models\VerificationPhoto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ModerationQueuesTest extends TestCase
{
    use RefreshDatabase;

    // --- Admin/Reports/Show ---

    public function test_admin_can_open_a_single_report(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $reporter = User::factory()->create(['pseudo' => 'signaleuse']);
        $reported = User::factory()->create(['pseudo' => 'signalee']);

        $report = Report::factory()->create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $reported->id,
            'reason' => 'harassment',
            'description' => 'Messages insistants après un refus.',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.reports.show', $report))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Reports/Show')
                ->where('report.id', $report->id)
                ->where('report.reason', 'harassment')
                ->where('report.reporter.pseudo', 'signaleuse')
                ->where('report.reported_user.pseudo', 'signalee')
                ->has('relatedReports', 0)
            );
    }

    public function test_report_show_lists_other_reports_against_the_same_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $reported = User::factory()->create();

        $report = Report::factory()->create(['reported_user_id' => $reported->id]);
        Report::factory()->count(2)->create(['reported_user_id' => $reported->id]);
        Report::factory()->create();

        $this->actingAs($admin)
            ->get(route('admin.reports.show', $report))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('relatedReports', 2));
    }

    public function test_non_admin_cannot_open_a_report(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $report = Report::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.reports.show', $report))
            ->assertForbidden();
    }

    // --- Admin/Photos/Pending ---

    public function test_admin_sees_only_untreated_photos_in_the_queue(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $owner = User::factory()->create(['pseudo' => 'photographe']);

        Photo::factory()->create(['user_id' => $owner->id]);
        Photo::factory()->approved()->create();
        Photo::factory()->rejected()->create();

        $this->actingAs($admin)
            ->get(route('admin.photos.pending'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Photos/Pending')
                ->has('photos.data', 1)
                ->where('photos.data.0.user.pseudo', 'photographe')
            );
    }

    public function test_pending_photos_expose_a_usable_image_url(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['is_admin' => true]);
        $photo = Photo::factory()->create([
            'path' => 'photos/abc.jpg',
            'thumbnail_path' => 'photos/thumbnails/abc.jpg',
        ]);
        Storage::disk('public')->put($photo->path, 'image-content');
        Storage::disk('public')->put($photo->thumbnail_path, 'thumbnail-content');

        $this->actingAs($admin)
            ->get(route('admin.photos.pending'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where(
                    'photos.data.0.url',
                    route('admin.users.photos.file', [$photo->user, $photo])
                )
                ->where(
                    'photos.data.0.thumbnail_url',
                    route('admin.users.photos.file', [$photo->user, $photo, 'thumb' => 1])
                )
                ->where('photos.data.0.available', true)
            );
    }

    public function test_pending_queue_does_not_expose_missing_private_video_files(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);
        Photo::factory()->create([
            'media_type' => 'video',
            'path' => 'gallery/videos/missing.mp4',
            'thumbnail_path' => 'gallery/videos/missing.jpg',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.photos.pending'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('photos.data.0.url', null)
                ->where('photos.data.0.thumbnail_url', null)
                ->where('photos.data.0.media_type', 'video')
                ->where('photos.data.0.available', false)
            );
    }

    public function test_non_admin_cannot_open_the_photo_queue(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.photos.pending'))
            ->assertForbidden();
    }

    // --- Admin/Verification/Index ---

    public function test_admin_sees_pending_verifications(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $candidate = User::factory()->create(['pseudo' => 'candidate']);

        $verification = VerificationPhoto::factory()->create(['user_id' => $candidate->id]);
        VerificationPhoto::factory()->approved()->create();

        $this->actingAs($admin)
            ->get(route('admin.verifications.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Verification/Index')
                ->has('verifications.data', 1)
                ->where('verifications.data.0.user.pseudo', 'candidate')
                ->where(
                    'verifications.data.0.image_url',
                    route('admin.verifications.image', $verification)
                )
            );
    }

    public function test_verification_payload_never_exposes_the_storage_path(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        VerificationPhoto::factory()->create(['path' => 'verifications/secret.jpg']);

        $response = $this->actingAs($admin)->get(route('admin.verifications.index'));

        $response->assertOk();
        $response->assertDontSee('verifications/secret.jpg');
    }

    public function test_non_admin_cannot_open_the_verification_queue(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.verifications.index'))
            ->assertForbidden();
    }
}
