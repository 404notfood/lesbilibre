<?php

namespace Tests\Feature\Admin;

use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserGalleryModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sheet_lists_the_member_gallery(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();

        $avatar = Photo::factory()->primary()->create(['user_id' => $member->id]);
        Photo::factory()->count(2)->create(['user_id' => $member->id]);

        $this->actingAs($admin)
            ->get(route('admin.users.show', $member))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Users/Show')
                ->has('user.photos', 3)
                ->where(
                    'user.photos',
                    fn ($photos) => collect($photos)
                        ->firstWhere('id', $avatar->id)['is_primary'] === true
                )
            );
    }

    public function test_admin_sheet_serves_private_gallery_videos_through_an_admin_route(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $video = Photo::factory()->create([
            'user_id' => $member->id,
            'media_type' => 'video',
            'path' => 'gallery/videos/gallery-video.mp4',
            'thumbnail_path' => 'gallery/videos/gallery-video.jpg',
        ]);

        Storage::disk('local')->put($video->path, 'video-content');
        Storage::disk('local')->put($video->thumbnail_path, 'poster-content');

        $fileUrl = route('admin.users.photos.file', [$member, $video]);
        $posterUrl = route('admin.users.photos.file', [$member, $video, 'thumb' => 1]);

        $this->actingAs($admin)
            ->get(route('admin.users.show', $member))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('user.photos.0.url', $fileUrl)
                ->where('user.photos.0.poster_url', $posterUrl)
                ->where('user.photos.0.media_type', 'video')
                ->where('user.photos.0.available', true)
            );

        $this->actingAs($admin)
            ->get($fileUrl)
            ->assertOk()
            ->assertHeader('Content-Type', 'video/mp4');
    }

    public function test_admin_sheet_does_not_request_a_missing_gallery_file(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        Photo::factory()->create([
            'user_id' => $member->id,
            'media_type' => 'video',
            'path' => 'gallery/videos/missing.mp4',
            'thumbnail_path' => 'gallery/videos/missing.jpg',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.users.show', $member))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('user.photos.0.url', null)
                ->where('user.photos.0.poster_url', null)
                ->where('user.photos.0.available', false)
            );
    }

    public function test_non_admin_cannot_stream_an_admin_gallery_file(): void
    {
        Storage::fake('public');

        $member = User::factory()->create(['is_admin' => false]);
        $owner = User::factory()->create();
        $photo = Photo::factory()->create(['user_id' => $owner->id]);
        Storage::disk('public')->put($photo->path, 'image-content');

        $this->actingAs($member)
            ->get(route('admin.users.photos.file', [$owner, $photo]))
            ->assertForbidden();
    }

    public function test_admin_can_flag_a_photo_as_sensitive(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $photo = Photo::factory()->primary()->create([
            'user_id' => $member->id,
            'is_naughty' => false,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.users.photos.sensitivity', [$member, $photo]))
            ->assertRedirect();

        $photo->refresh();
        $this->assertTrue($photo->is_naughty);
        // Marquer sensible doit démettre l'avatar : sinon la photo resterait
        // visible partout malgré le classement.
        $this->assertFalse($photo->is_primary);
    }

    public function test_admin_can_clear_the_sensitive_flag(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $photo = Photo::factory()->create([
            'user_id' => $member->id,
            'is_naughty' => true,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.users.photos.sensitivity', [$member, $photo]))
            ->assertRedirect();

        $this->assertFalse($photo->fresh()->is_naughty);
    }

    public function test_flagging_a_photo_is_written_to_the_audit_log(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $photo = Photo::factory()->create(['user_id' => $member->id]);

        $this->actingAs($admin)
            ->post(route('admin.users.photos.sensitivity', [$member, $photo]))
            ->assertRedirect();

        $this->assertDatabaseHas('moderation_actions', [
            'moderator_id' => $admin->id,
            'subject_user_id' => $member->id,
            'action' => 'photo_marked_sensitive',
        ]);
    }

    public function test_admin_can_clear_the_member_avatar(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $photo = Photo::factory()->primary()->create(['user_id' => $member->id]);

        $this->actingAs($admin)
            ->post(route('admin.users.clear-avatar', $member))
            ->assertRedirect();

        $this->assertFalse($photo->fresh()->is_primary);
    }

    public function test_admin_can_delete_a_photo_with_a_reason(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $photo = Photo::factory()->create(['user_id' => $member->id]);

        $this->actingAs($admin)
            ->delete(route('admin.users.photos.destroy', [$member, $photo]), [
                'reason' => 'Visage d’un tiers sans consentement.',
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('photos', ['id' => $photo->id]);
        $this->assertDatabaseHas('moderation_actions', [
            'moderator_id' => $admin->id,
            'action' => 'photo_deleted_by_admin',
        ]);
    }

    public function test_deleting_a_photo_requires_a_reason(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $photo = Photo::factory()->create(['user_id' => $member->id]);

        $this->actingAs($admin)
            ->delete(route('admin.users.photos.destroy', [$member, $photo]))
            ->assertSessionHasErrors('reason');

        $this->assertDatabaseHas('photos', ['id' => $photo->id]);
    }

    public function test_admin_cannot_act_on_a_photo_belonging_to_someone_else(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $foreign = Photo::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.users.photos.sensitivity', [$member, $foreign]))
            ->assertNotFound();

        $this->assertFalse($foreign->fresh()->is_naughty);
    }

    public function test_non_admin_cannot_moderate_a_gallery(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $member = User::factory()->create();
        $photo = Photo::factory()->create(['user_id' => $member->id]);

        $this->actingAs($user)
            ->post(route('admin.users.photos.sensitivity', [$member, $photo]))
            ->assertForbidden();
    }
}
