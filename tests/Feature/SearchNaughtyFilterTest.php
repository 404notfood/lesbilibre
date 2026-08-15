<?php

namespace Tests\Feature;

use App\Models\Photo;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchNaughtyFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function addPhoto(
        User $user,
        bool $isNaughty,
        bool $isApproved = true,
        string $moderationStatus = 'approved'
    ): Photo {
        return Photo::create([
            'user_id' => $user->id,
            'path' => 'photos/'.$user->id.'.jpg',
            'is_approved' => $isApproved,
            'moderation_status' => $moderationStatus,
            'is_naughty' => $isNaughty,
        ]);
    }

    protected function createMember(bool $naughtyMode, string $city = 'Laval'): User
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

    public function test_naughty_filters_are_offered_to_members_in_naughty_mode(): void
    {
        $response = $this->actingAs($this->createMember(true))
            ->get(route('search'))
            ->assertOk();

        $this->assertTrue($response->viewData('page')['props']['canFilterNaughty']);
    }

    public function test_naughty_filters_are_hidden_from_members_without_naughty_mode(): void
    {
        $response = $this->actingAs($this->createMember(false))
            ->get(route('search'))
            ->assertOk();

        $this->assertFalse($response->viewData('page')['props']['canFilterNaughty']);
    }

    public function test_naughty_mode_filter_narrows_the_results(): void
    {
        $me = $this->createMember(true);
        $naughty = $this->createMember(true);
        $vanilla = $this->createMember(false);

        $response = $this->actingAs($me)
            ->get(route('search', ['naughty_mode' => 1]))
            ->assertOk();

        $ids = array_column($response->viewData('page')['props']['results']['data'], 'id');

        $this->assertContains($naughty->id, $ids);
        $this->assertNotContains($vanilla->id, $ids);
    }

    public function test_naughty_mode_filter_is_ignored_for_a_non_consenting_member(): void
    {
        $me = $this->createMember(false);
        $naughty = $this->createMember(true);
        $vanilla = $this->createMember(false);

        $response = $this->actingAs($me)
            ->get(route('search', ['naughty_mode' => 1]))
            ->assertOk();

        $ids = array_column($response->viewData('page')['props']['results']['data'], 'id');

        // Le filtre est neutralisé : les deux profils restent visibles.
        $this->assertContains($naughty->id, $ids);
        $this->assertContains($vanilla->id, $ids);
    }

    public function test_private_gallery_filter_keeps_only_members_with_naughty_photos(): void
    {
        $me = $this->createMember(true);

        $withGallery = $this->createMember(true);
        $this->addPhoto($withGallery, isNaughty: true);

        $withPublicPhotoOnly = $this->createMember(true);
        $this->addPhoto($withPublicPhotoOnly, isNaughty: false);

        $response = $this->actingAs($me)
            ->get(route('search', ['has_private_gallery' => 1]))
            ->assertOk();

        $ids = array_column($response->viewData('page')['props']['results']['data'], 'id');

        $this->assertContains($withGallery->id, $ids);
        $this->assertNotContains($withPublicPhotoOnly->id, $ids);
    }

    public function test_private_gallery_filter_ignores_unapproved_or_rejected_photos(): void
    {
        $me = $this->createMember(true);

        $pending = $this->createMember(true);
        $this->addPhoto($pending, isNaughty: true, isApproved: false);

        $rejected = $this->createMember(true);
        $this->addPhoto($rejected, isNaughty: true, moderationStatus: 'rejected');

        $response = $this->actingAs($me)
            ->get(route('search', ['has_private_gallery' => 1]))
            ->assertOk();

        $ids = array_column($response->viewData('page')['props']['results']['data'], 'id');

        $this->assertNotContains($pending->id, $ids);
        $this->assertNotContains($rejected->id, $ids);
    }

    public function test_private_gallery_filter_is_ignored_for_a_non_consenting_member(): void
    {
        $me = $this->createMember(false);

        $withoutGallery = $this->createMember(true);

        $response = $this->actingAs($me)
            ->get(route('search', ['has_private_gallery' => 1]))
            ->assertOk();

        $ids = array_column($response->viewData('page')['props']['results']['data'], 'id');

        $this->assertContains($withoutGallery->id, $ids, 'Le filtre doit être neutralisé sans consentement.');
    }
}
