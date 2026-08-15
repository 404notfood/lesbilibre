<?php

namespace Tests\Feature;

use App\Models\Photo;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileGalleryTest extends TestCase
{
    use RefreshDatabase;

    protected function createMember(bool $naughtyMode = false): User
    {
        $user = User::factory()->create([
            'is_verified' => true,
            'is_banned' => false,
        ]);

        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
            'is_discoverable' => true,
            'is_naughty_mode' => $naughtyMode,
        ]);

        return $user;
    }

    protected function addPhoto(User $user, bool $isNaughty, bool $isPrimary = false, int $order = 0): Photo
    {
        return Photo::create([
            'user_id' => $user->id,
            'path' => 'photos/'.$user->id.'-'.$order.'.jpg',
            'is_approved' => true,
            'moderation_status' => 'approved',
            'is_naughty' => $isNaughty,
            'is_primary' => $isPrimary,
            'order' => $order,
        ]);
    }

    public function test_visiting_a_profile_exposes_its_gallery(): void
    {
        $owner = $this->createMember();
        $this->addPhoto($owner, isNaughty: false, isPrimary: true);
        $this->addPhoto($owner, isNaughty: false, order: 1);

        $response = $this->actingAs($this->createMember())
            ->get(route('profile.view', $owner->id))
            ->assertOk();

        $photos = $response->viewData('page')['props']['photos'];

        $this->assertCount(2, $photos);
        $this->assertArrayHasKey('url', $photos[0]);
    }

    public function test_naughty_photos_are_blurred_without_consent(): void
    {
        $owner = $this->createMember();
        $this->addPhoto($owner, isNaughty: false, isPrimary: true);
        $this->addPhoto($owner, isNaughty: true, order: 1);

        $response = $this->actingAs($this->createMember(naughtyMode: false))
            ->get(route('profile.view', $owner->id))
            ->assertOk();

        $photos = collect($response->viewData('page')['props']['photos']);

        $this->assertCount(2, $photos, 'Les photos coquines restent listées, mais floutées.');
        $this->assertSame(1, $photos->where('is_blurred', true)->count());
    }

    public function test_naughty_photos_are_visible_with_consent(): void
    {
        $owner = $this->createMember();
        $this->addPhoto($owner, isNaughty: true, isPrimary: true);
        $this->addPhoto($owner, isNaughty: true, order: 1);

        $response = $this->actingAs($this->createMember(naughtyMode: true))
            ->get(route('profile.view', $owner->id))
            ->assertOk();

        $photos = collect($response->viewData('page')['props']['photos']);

        $this->assertCount(2, $photos);
        $this->assertSame(0, $photos->where('is_blurred', true)->count());
    }

    public function test_pending_and_rejected_photos_are_never_exposed(): void
    {
        $owner = $this->createMember();
        $this->addPhoto($owner, isNaughty: false, isPrimary: true);

        Photo::create([
            'user_id' => $owner->id,
            'path' => 'photos/pending.jpg',
            'is_approved' => false,
            'moderation_status' => 'pending',
            'is_naughty' => false,
        ]);

        Photo::create([
            'user_id' => $owner->id,
            'path' => 'photos/rejected.jpg',
            'is_approved' => true,
            'moderation_status' => 'rejected',
            'is_naughty' => false,
        ]);

        $response = $this->actingAs($this->createMember())
            ->get(route('profile.view', $owner->id))
            ->assertOk();

        $this->assertCount(1, $response->viewData('page')['props']['photos']);
    }
}
