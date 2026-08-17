<?php

namespace Tests\Feature;

use App\Jobs\ModeratePhoto;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PhotoGalleryTest extends TestCase
{
    use RefreshDatabase;

    public function test_gallery_lists_the_users_own_photos_only(): void
    {
        $user = User::factory()->create();
        Photo::factory()->approved()->create(['user_id' => $user->id]);
        Photo::factory()->create(['user_id' => $user->id]);
        Photo::factory()->create();

        $this->actingAs($user)
            ->get(route('photos.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Photos/Index')
                ->has('photos', 2)
            );
    }

    public function test_gallery_tells_photos_and_videos_apart(): void
    {
        $user = User::factory()->create();

        Photo::factory()->approved()->create([
            'user_id' => $user->id,
            'media_type' => 'photo',
        ]);

        Photo::factory()->approved()->create([
            'user_id' => $user->id,
            'media_type' => 'video',
            'thumbnail_path' => 'photos/poster.jpg',
        ]);

        $this->actingAs($user)
            ->get(route('photos.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Photos/Index')
                ->has('photos', 2)
                // L'onglet Vidéos et la vignette de lecture s'appuient sur ce
                // champ : sans lui, tout retombe dans l'onglet Photos.
                ->where('photos.0.media_type', 'photo')
                ->where('photos.1.media_type', 'video')
                ->where('photos.0.poster_url', null)
                ->whereNot('photos.1.poster_url', null)
            );
    }

    public function test_user_can_upload_a_photo(): void
    {
        Storage::fake('public');
        Queue::fake();

        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('photos.store'), [
                'photo' => UploadedFile::fake()->image('portrait.jpg', 800, 1000),
            ])
            ->assertRedirect();

        // Publiée d'emblée : la modération de galerie se fait a posteriori.
        $this->assertDatabaseHas('photos', [
            'user_id' => $user->id,
            'is_approved' => true,
            'is_naughty' => false,
            'moderation_status' => 'pending',
        ]);

        Queue::assertPushed(ModeratePhoto::class);
    }

    public function test_user_can_flag_an_upload_as_sensitive(): void
    {
        Storage::fake('public');
        Queue::fake();

        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('photos.store'), [
                'photo' => UploadedFile::fake()->image('portrait.jpg', 800, 1000),
                'is_naughty' => '1',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('photos', [
            'user_id' => $user->id,
            'is_naughty' => true,
        ]);
    }

    public function test_upload_is_refused_beyond_ten_photos(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Photo::factory()->count(10)->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->post(route('photos.store'), [
                'photo' => UploadedFile::fake()->image('portrait.jpg', 800, 1000),
            ])
            ->assertRedirect();

        $this->assertSame(10, $user->photos()->count());
    }

    public function test_only_approved_photos_can_become_primary(): void
    {
        $user = User::factory()->create();
        $pending = Photo::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->post(route('photos.primary', $pending))
            ->assertRedirect();

        $this->assertFalse($pending->fresh()->is_primary);
    }

    public function test_setting_a_primary_photo_unsets_the_previous_one(): void
    {
        $user = User::factory()->create();
        $current = Photo::factory()->primary()->create(['user_id' => $user->id]);
        $next = Photo::factory()->approved()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->post(route('photos.primary', $next))
            ->assertRedirect();

        $this->assertFalse($current->fresh()->is_primary);
        $this->assertTrue($next->fresh()->is_primary);
    }

    public function test_user_cannot_touch_someone_elses_photo(): void
    {
        $user = User::factory()->create();
        $foreign = Photo::factory()->approved()->create();

        $this->actingAs($user)
            ->post(route('photos.primary', $foreign))
            ->assertForbidden();

        $this->actingAs($user)
            ->delete(route('photos.destroy', $foreign))
            ->assertForbidden();

        $this->assertDatabaseHas('photos', ['id' => $foreign->id]);
    }

    public function test_user_can_delete_their_own_photo(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $photo = Photo::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->delete(route('photos.destroy', $photo))
            ->assertRedirect();

        $this->assertDatabaseMissing('photos', ['id' => $photo->id]);
    }

    public function test_legacy_gallery_video_files_are_moved_out_of_ephemeral_storage(): void
    {
        Storage::fake('local');

        $video = Photo::factory()->create([
            'media_type' => 'video',
            'path' => 'ephemeral/legacy-video.mp4',
            'thumbnail_path' => 'ephemeral/legacy-video.jpg',
        ]);
        Storage::disk('local')->put($video->path, 'video-content');
        Storage::disk('local')->put($video->thumbnail_path, 'poster-content');

        $migration = require database_path(
            'migrations/2026_08_17_143223_move_gallery_videos_out_of_ephemeral_storage.php'
        );
        $migration->up();

        $video->refresh();

        $this->assertSame('gallery/videos/legacy-video.mp4', $video->path);
        $this->assertSame('gallery/videos/legacy-video.jpg', $video->thumbnail_path);
        Storage::disk('local')->assertExists($video->path);
        Storage::disk('local')->assertExists($video->thumbnail_path);
        Storage::disk('local')->assertMissing('ephemeral/legacy-video.mp4');
        Storage::disk('local')->assertMissing('ephemeral/legacy-video.jpg');
    }
}
