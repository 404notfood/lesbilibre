<?php

namespace Tests\Feature;

use App\Models\GalleryAccessRequest;
use App\Models\Photo;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrivateGalleryAccessTest extends TestCase
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

    protected function addMedia(User $user, bool $isNaughty, bool $isPrivate, int $order = 0): Photo
    {
        return Photo::create([
            'user_id' => $user->id,
            'media_type' => 'photo',
            'path' => 'photos/'.$user->id.'-'.$order.'.jpg',
            'is_approved' => true,
            'moderation_status' => 'approved',
            'is_naughty' => $isNaughty,
            'is_private' => $isPrivate,
            'is_primary' => $order === 0,
            'order' => $order,
        ]);
    }

    protected function grantAccess(User $owner, User $viewer): GalleryAccessRequest
    {
        return GalleryAccessRequest::create([
            'requester_user_id' => $viewer->id,
            'owner_user_id' => $owner->id,
            'status' => 'accepted',
            'gems_cost' => 50,
        ]);
    }

    public function test_naughty_and_private_are_independent_locks(): void
    {
        $naughtyOnly = new Photo(['is_naughty' => true, 'is_private' => false]);
        $privateOnly = new Photo(['is_naughty' => false, 'is_private' => true]);
        $both = new Photo(['is_naughty' => true, 'is_private' => true]);

        // Le mode coquin seul débloque une photo coquine publique.
        $this->assertFalse($naughtyOnly->isObscuredFor(false, true, false));

        // L'accès seul débloque une photo privée non coquine.
        $this->assertFalse($privateOnly->isObscuredFor(false, false, true));

        // Une photo coquine ET privée exige les deux.
        $this->assertTrue($both->isObscuredFor(false, true, false));
        $this->assertTrue($both->isObscuredFor(false, false, true));
        $this->assertFalse($both->isObscuredFor(false, true, true));
    }

    public function test_the_owner_always_sees_their_own_media(): void
    {
        $photo = new Photo(['is_naughty' => true, 'is_private' => true]);

        $this->assertFalse($photo->isObscuredFor(true, false, false));
    }

    public function test_private_media_stays_blurred_until_access_is_granted(): void
    {
        $owner = $this->createMember();
        $viewer = $this->createMember(naughtyMode: true);

        $this->addMedia($owner, isNaughty: false, isPrivate: false);
        $this->addMedia($owner, isNaughty: false, isPrivate: true, order: 1);

        $blurredBefore = collect(
            $this->actingAs($viewer)
                ->get(route('profile.view', $owner->id))
                ->viewData('page')['props']['photos']
        )->where('is_blurred', true)->count();

        $this->assertSame(1, $blurredBefore);

        $this->grantAccess($owner, $viewer);

        $blurredAfter = collect(
            $this->actingAs($viewer)
                ->get(route('profile.view', $owner->id))
                ->viewData('page')['props']['photos']
        )->where('is_blurred', true)->count();

        $this->assertSame(0, $blurredAfter, 'L’accès accordé doit défloutier la galerie privée.');
    }

    public function test_revoked_access_blurs_the_gallery_again(): void
    {
        $owner = $this->createMember();
        $viewer = $this->createMember(naughtyMode: true);
        $this->addMedia($owner, isNaughty: false, isPrivate: true);

        $grant = $this->grantAccess($owner, $viewer);

        $this->assertTrue($owner->fresh()->grantsGalleryAccessTo($viewer));

        $grant->update(['revoked_at' => now()]);

        $this->assertFalse(
            $owner->fresh()->grantsGalleryAccessTo($viewer),
            'Un accès révoqué ne doit plus rien débloquer.'
        );
    }

    public function test_profile_exposes_the_private_gallery_state(): void
    {
        $owner = $this->createMember();
        $viewer = $this->createMember(naughtyMode: true);

        $this->addMedia($owner, isNaughty: false, isPrivate: true);
        $this->addMedia($owner, isNaughty: true, isPrivate: true, order: 1);

        $gallery = $this->actingAs($viewer)
            ->get(route('profile.view', $owner->id))
            ->viewData('page')['props']['gallery'];

        $this->assertSame(2, $gallery['photo_count']);
        $this->assertFalse($gallery['has_access']);
        $this->assertNull($gallery['request_status']);
        $this->assertTrue($gallery['viewer_accepts_naughty']);
    }

    public function test_a_pending_request_is_reported_to_the_viewer(): void
    {
        $owner = $this->createMember();
        $viewer = $this->createMember(naughtyMode: true);
        $this->addMedia($owner, isNaughty: false, isPrivate: true);

        GalleryAccessRequest::create([
            'requester_user_id' => $viewer->id,
            'owner_user_id' => $owner->id,
            'status' => 'pending',
            'gems_cost' => 50,
        ]);

        $gallery = $this->actingAs($viewer)
            ->get(route('profile.view', $owner->id))
            ->viewData('page')['props']['gallery'];

        $this->assertSame('pending', $gallery['request_status']);
        $this->assertFalse($gallery['has_access']);
    }
}
