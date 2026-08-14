<?php

namespace Tests\Feature;

use App\Models\Photo;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PhotoPrivacyTest extends TestCase
{
    use RefreshDatabase;

    private function memberWithConsent(bool $acceptsNaughty): User
    {
        $user = User::factory()->create();
        Profile::factory()->create([
            'user_id' => $user->id,
            'is_naughty_mode' => $acceptsNaughty,
        ]);

        return $user->fresh();
    }

    /** Stores a real JPEG so the rendering pipeline has something to read. */
    private function storePhotoFile(string $path): void
    {
        $image = imagecreatetruecolor(120, 150);
        ob_start();
        imagejpeg($image);
        $bytes = (string) ob_get_clean();
        imagedestroy($image);

        Storage::disk('public')->put($path, $bytes);
    }

    // --- Consentement au contenu sensible ---

    public function test_sensitive_photo_is_hidden_from_a_viewer_who_declined(): void
    {
        Storage::fake('public');

        $viewer = $this->memberWithConsent(false);
        $owner = $this->memberWithConsent(true);

        $photo = Photo::factory()->approved()->create([
            'user_id' => $owner->id,
            'is_naughty' => true,
            'path' => 'photos/nude.jpg',
        ]);
        $this->storePhotoFile('photos/nude.jpg');

        $this->actingAs($viewer)
            ->get(route('profile.view', $owner->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('photos.0.is_blurred', true)
                ->where('viewerAcceptsNaughty', false)
            );
    }

    public function test_sensitive_photo_is_clear_for_a_viewer_who_opted_in(): void
    {
        Storage::fake('public');

        $viewer = $this->memberWithConsent(true);
        $owner = $this->memberWithConsent(true);

        Photo::factory()->approved()->create([
            'user_id' => $owner->id,
            'is_naughty' => true,
        ]);

        $this->actingAs($viewer)
            ->get(route('profile.view', $owner->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('photos.0.is_blurred', false)
            );
    }

    public function test_consent_follows_the_viewer_not_the_owner(): void
    {
        Storage::fake('public');

        // L'ancienne implémentation testait le mode coquin de la propriétaire :
        // une visiteuse non consentante voyait donc tout le contenu sensible.
        $viewer = $this->memberWithConsent(false);
        $owner = $this->memberWithConsent(true);

        Photo::factory()->approved()->create([
            'user_id' => $owner->id,
            'is_naughty' => true,
        ]);

        $this->actingAs($viewer)
            ->get(route('profile.view', $owner->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('photos.0.is_blurred', true)
            );
    }

    // --- Photo de profil ---

    public function test_a_sensitive_photo_cannot_become_the_avatar(): void
    {
        $user = User::factory()->create();
        $photo = Photo::factory()->approved()->create([
            'user_id' => $user->id,
            'is_naughty' => true,
        ]);

        $this->actingAs($user)
            ->post(route('photos.primary', $photo))
            ->assertRedirect();

        $this->assertFalse($photo->fresh()->is_primary);
    }

    public function test_an_unmoderated_photo_cannot_become_the_avatar(): void
    {
        $user = User::factory()->create();
        $photo = Photo::factory()->create([
            'user_id' => $user->id,
            'is_approved' => true,
            'moderation_status' => 'pending',
        ]);

        $this->actingAs($user)
            ->post(route('photos.primary', $photo))
            ->assertRedirect();

        $this->assertFalse($photo->fresh()->is_primary);
    }

    public function test_member_can_request_avatar_validation(): void
    {
        $user = User::factory()->create();
        $photo = Photo::factory()->create([
            'user_id' => $user->id,
            'moderation_status' => 'pending',
        ]);

        $this->actingAs($user)
            ->post(route('photos.request-avatar', $photo))
            ->assertRedirect();

        $this->assertNotNull($photo->fresh()->avatar_requested_at);
    }

    public function test_a_sensitive_photo_cannot_be_submitted_as_avatar(): void
    {
        $user = User::factory()->create();
        $photo = Photo::factory()->create([
            'user_id' => $user->id,
            'is_naughty' => true,
        ]);

        $this->actingAs($user)
            ->post(route('photos.request-avatar', $photo))
            ->assertRedirect();

        $this->assertNull($photo->fresh()->avatar_requested_at);
    }

    public function test_approving_a_requested_photo_promotes_it_to_avatar(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();

        $previous = Photo::factory()->primary()->create(['user_id' => $member->id]);
        $photo = Photo::factory()->create([
            'user_id' => $member->id,
            'moderation_status' => 'pending',
            'avatar_requested_at' => now(),
        ]);

        $this->actingAs($admin)
            ->post(route('admin.photos.approve', $photo))
            ->assertRedirect();

        $this->assertTrue($photo->fresh()->is_primary);
        $this->assertFalse($previous->fresh()->is_primary);
        $this->assertNull($photo->fresh()->avatar_requested_at);
    }

    public function test_rejecting_a_photo_retires_it_from_the_gallery(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $photo = Photo::factory()->primary()->create([
            'avatar_requested_at' => now(),
        ]);

        $this->actingAs($admin)
            ->post(route('admin.photos.reject', $photo), [
                'rejection_reason' => 'Visage d’une tierce personne.',
            ])
            ->assertRedirect();

        $photo->refresh();
        $this->assertFalse($photo->is_approved);
        $this->assertFalse($photo->is_primary);
        $this->assertNull($photo->avatar_requested_at);
    }

    // --- Publication immédiate en galerie ---

    public function test_gallery_photos_are_visible_as_soon_as_they_are_added(): void
    {
        Storage::fake('public');
        \Illuminate\Support\Facades\Queue::fake();

        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('photos.store'), [
                'photo' => \Illuminate\Http\UploadedFile::fake()->image('a.jpg', 800, 1000),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('photos', [
            'user_id' => $user->id,
            'is_approved' => true,
            'moderation_status' => 'pending',
        ]);
    }

    // --- Route média ---

    public function test_media_route_refuses_a_blocked_viewer(): void
    {
        Storage::fake('public');

        $viewer = $this->memberWithConsent(true);
        $owner = $this->memberWithConsent(true);
        $owner->blockedUsers()->create(['blocked_id' => $viewer->id]);

        $photo = Photo::factory()->approved()->create(['user_id' => $owner->id]);

        $this->actingAs($viewer)
            ->get(route('media.photo', $photo))
            ->assertNotFound();
    }

    public function test_media_route_refuses_a_rejected_photo(): void
    {
        Storage::fake('public');

        $viewer = $this->memberWithConsent(true);
        $owner = $this->memberWithConsent(true);

        $photo = Photo::factory()->rejected()->create(['user_id' => $owner->id]);

        $this->actingAs($viewer)
            ->get(route('media.photo', $photo))
            ->assertNotFound();
    }

    public function test_media_route_serves_a_watermarked_jpeg(): void
    {
        Storage::fake('public');

        $viewer = $this->memberWithConsent(true);
        $owner = $this->memberWithConsent(true);

        $photo = Photo::factory()->approved()->create([
            'user_id' => $owner->id,
            'path' => 'photos/visible.jpg',
        ]);
        $this->storePhotoFile('photos/visible.jpg');

        $this->actingAs($viewer)
            ->get(route('media.photo', $photo))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/jpeg')
            ->assertHeader('Cache-Control', 'max-age=0, no-store, private');
    }

    public function test_owner_always_sees_their_own_sensitive_photo(): void
    {
        Storage::fake('public');

        $owner = $this->memberWithConsent(false);
        $photo = Photo::factory()->approved()->create([
            'user_id' => $owner->id,
            'is_naughty' => true,
            'path' => 'photos/mine.jpg',
        ]);
        $this->storePhotoFile('photos/mine.jpg');

        $this->actingAs($owner)
            ->get(route('media.photo', $photo))
            ->assertOk();
    }
}
