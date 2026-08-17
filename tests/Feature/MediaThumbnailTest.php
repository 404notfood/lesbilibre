<?php

namespace Tests\Feature;

use App\Models\Photo;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaThumbnailTest extends TestCase
{
    use RefreshDatabase;

    protected function createMember(bool $naughtyMode = false, ?string $city = 'Laval'): User
    {
        $user = User::factory()->create([
            'is_verified' => true,
            'is_banned' => false,
        ]);

        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
            'city' => $city,
            'is_discoverable' => true,
            'is_naughty_mode' => $naughtyMode,
        ]);

        return $user;
    }

    protected function addMedia(
        User $user,
        bool $isNaughty = false,
        bool $isPrivate = false,
        string $mediaType = 'photo',
        bool $isPrimary = true,
        int $order = 0
    ): Photo {
        return Photo::create([
            'user_id' => $user->id,
            'media_type' => $mediaType,
            'path' => 'photos/'.$user->id.'-'.$order.'.jpg',
            'thumbnail_path' => 'photos/thumb-'.$user->id.'-'.$order.'.jpg',
            'is_approved' => true,
            'moderation_status' => 'approved',
            'is_naughty' => $isNaughty,
            'is_private' => $isPrivate,
            'is_primary' => $isPrimary,
            'order' => $order,
        ]);
    }

    public function test_dashboard_exposes_a_usable_photo_url(): void
    {
        $me = $this->createMember();
        $other = $this->createMember();
        $this->addMedia($other);

        $profiles = $this->actingAs($me)
            ->get(route('dashboard'))
            ->viewData('page')['props']['profiles'];

        $card = collect($profiles)->firstWhere('id', $other->id);

        $this->assertNotNull($card);
        $this->assertNotNull($card['primary_photo'], 'Le dashboard doit exposer une URL de photo.');
        $this->assertStringContainsString('/media/photos/', $card['primary_photo']);
    }

    public function test_dashboard_never_uses_a_private_or_naughty_photo_as_thumbnail(): void
    {
        $me = $this->createMember(naughtyMode: true);
        $other = $this->createMember();
        $this->addMedia($other, isNaughty: true, isPrivate: true);

        $profiles = $this->actingAs($me)
            ->get(route('dashboard'))
            ->viewData('page')['props']['profiles'];

        $card = collect($profiles)->firstWhere('id', $other->id);

        $this->assertNull(
            $card['primary_photo'],
            'Une photo coquine ou privée ne peut pas servir de vignette publique.'
        );
    }

    public function test_search_results_never_expose_the_storage_path(): void
    {
        $me = $this->createMember();
        $other = $this->createMember();
        $this->addMedia($other);

        $results = $this->actingAs($me)
            ->get(route('search'))
            ->viewData('page')['props']['results']['data'];

        $row = collect($results)->firstWhere('id', $other->id);

        $this->assertNotEmpty($row['photos']);
        $this->assertArrayNotHasKey('path', $row['photos'][0], 'Le chemin disque ne doit jamais sortir.');
        $this->assertArrayHasKey('url', $row['photos'][0]);
        $this->assertStringContainsString('/media/photos/', $row['photos'][0]['url']);
    }

    public function test_search_thumbnails_skip_private_media(): void
    {
        $me = $this->createMember(naughtyMode: true);
        $other = $this->createMember();
        $this->addMedia($other, isPrivate: true);

        $results = $this->actingAs($me)
            ->get(route('search'))
            ->viewData('page')['props']['results']['data'];

        $row = collect($results)->firstWhere('id', $other->id);

        $this->assertEmpty($row['photos']);
    }

    public function test_videos_are_not_used_as_profile_thumbnails(): void
    {
        $me = $this->createMember();
        $other = $this->createMember();
        $this->addMedia($other, mediaType: 'video');

        $profiles = $this->actingAs($me)
            ->get(route('dashboard'))
            ->viewData('page')['props']['profiles'];

        $card = collect($profiles)->firstWhere('id', $other->id);

        $this->assertNull($card['primary_photo'], 'Une vidéo ne peut pas servir de vignette.');
    }

    public function test_video_poster_is_served_from_private_storage(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $viewer = $this->createMember();
        $owner = $this->createMember();
        $poster = UploadedFile::fake()->image('poster.jpg', 640, 360);
        $posterPath = 'gallery/videos/video-poster.jpg';

        Storage::disk('local')->put($posterPath, file_get_contents($poster->getRealPath()));

        $video = $this->addMedia(
            $owner,
            mediaType: 'video',
            isPrimary: false,
        );
        $video->update([
            'path' => 'gallery/videos/video.mp4',
            'thumbnail_path' => $posterPath,
        ]);

        $this->actingAs($viewer)
            ->get(route('media.photo', [$video, 'thumb' => 1]))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/jpeg');
    }
}
