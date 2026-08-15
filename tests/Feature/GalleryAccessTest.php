<?php

namespace Tests\Feature;

use App\Models\GalleryAccessRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class GalleryAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_sees_pending_requests_for_their_private_gallery(): void
    {
        $owner = User::factory()->create();
        $requester = User::factory()->create(['pseudo' => 'curieuse']);

        GalleryAccessRequest::create([
            'requester_user_id' => $requester->id,
            'owner_user_id' => $owner->id,
            'status' => 'pending',
            'gems_cost' => 50,
        ]);

        $this->actingAs($owner)
            ->get(route('gallery-access.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('GalleryAccess/Index')
                ->has('requests', 1)
                ->where('requests.0.requester.pseudo', 'curieuse')
                ->where('requests.0.gems_cost', 50)
            );
    }

    public function test_pending_requests_of_other_users_are_not_listed(): void
    {
        $owner = User::factory()->create();
        $someoneElse = User::factory()->create();

        GalleryAccessRequest::create([
            'requester_user_id' => User::factory()->create()->id,
            'owner_user_id' => $someoneElse->id,
            'status' => 'pending',
            'gems_cost' => 50,
        ]);

        $this->actingAs($owner)
            ->get(route('gallery-access.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('requests', 0));
    }

    public function test_pending_gallery_requests_count_is_shared_with_the_layout(): void
    {
        $owner = User::factory()->create();

        GalleryAccessRequest::create([
            'requester_user_id' => User::factory()->create()->id,
            'owner_user_id' => $owner->id,
            'status' => 'pending',
            'gems_cost' => 50,
        ]);

        $this->actingAs($owner)
            ->get(route('gallery-access.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('counts.pendingGalleryRequests', 1)
            );
    }

    public function test_manage_page_separates_granted_and_received_access(): void
    {
        $user = User::factory()->create();
        $viewer = User::factory()->create(['pseudo' => 'invitee']);
        $otherOwner = User::factory()->create(['pseudo' => 'hotesse']);

        GalleryAccessRequest::create([
            'requester_user_id' => $viewer->id,
            'owner_user_id' => $user->id,
            'status' => 'accepted',
            'gems_cost' => 50,
        ]);

        GalleryAccessRequest::create([
            'requester_user_id' => $user->id,
            'owner_user_id' => $otherOwner->id,
            'status' => 'accepted',
            'gems_cost' => 50,
        ]);

        $this->actingAs($user)
            ->get(route('gallery-access.manage'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('GalleryAccess/Manage')
                ->has('accessGranted', 1)
                ->where('accessGranted.0.requester.pseudo', 'invitee')
                ->has('accessReceived', 1)
                ->where('accessReceived.0.owner.pseudo', 'hotesse')
            );
    }

    public function test_guest_cannot_access_the_private_gallery_pages(): void
    {
        $this->get(route('gallery-access.index'))->assertRedirect(route('login'));
    }

    public function test_requesting_access_deducts_gems_and_notifies_the_owner(): void
    {
        $owner = User::factory()->create();
        $requester = User::factory()->create(['gems' => 200]);

        $this->actingAs($requester)
            ->post(route('gallery-access.request', $owner->id))
            ->assertRedirect();

        $this->assertDatabaseHas('gallery_access_requests', [
            'requester_user_id' => $requester->id,
            'owner_user_id' => $owner->id,
            'status' => 'pending',
        ]);

        $this->assertSame(150, $requester->fresh()->gems);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'gallery_access',
        ]);
    }

    public function test_requesting_access_without_enough_gems_does_not_create_a_request(): void
    {
        $owner = User::factory()->create();
        $requester = User::factory()->create(['gems' => 10]);

        $this->actingAs($requester)
            ->post(route('gallery-access.request', $owner->id))
            ->assertRedirect();

        $this->assertDatabaseCount('gallery_access_requests', 0);
        $this->assertSame(10, $requester->fresh()->gems);
    }

    public function test_accepting_a_request_notifies_the_requester(): void
    {
        $owner = User::factory()->create();
        $requester = User::factory()->create();

        $accessRequest = GalleryAccessRequest::create([
            'requester_user_id' => $requester->id,
            'owner_user_id' => $owner->id,
            'status' => 'pending',
            'gems_cost' => 50,
        ]);

        $this->actingAs($owner)
            ->post(route('gallery-access.accept', $accessRequest->id))
            ->assertRedirect();

        $this->assertSame('accepted', $accessRequest->fresh()->status);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $requester->id,
            'type' => 'gallery_access',
        ]);
    }

    public function test_rejecting_a_request_refunds_gems_and_notifies_the_requester(): void
    {
        $owner = User::factory()->create();
        $requester = User::factory()->create(['gems' => 0]);

        $accessRequest = GalleryAccessRequest::create([
            'requester_user_id' => $requester->id,
            'owner_user_id' => $owner->id,
            'status' => 'pending',
            'gems_cost' => 50,
        ]);

        $this->actingAs($owner)
            ->post(route('gallery-access.reject', $accessRequest->id))
            ->assertRedirect();

        $this->assertSame('rejected', $accessRequest->fresh()->status);
        $this->assertSame(50, $requester->fresh()->gems);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $requester->id,
            'type' => 'gallery_access',
        ]);
    }

    public function test_granting_access_directly_notifies_the_beneficiary(): void
    {
        $owner = User::factory()->create();
        $beneficiary = User::factory()->create();

        $this->actingAs($owner)
            ->post(route('gallery-access.grant', $beneficiary->id))
            ->assertRedirect();

        $this->assertDatabaseHas('gallery_access_requests', [
            'requester_user_id' => $beneficiary->id,
            'owner_user_id' => $owner->id,
            'status' => 'accepted',
            'gems_cost' => 0,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $beneficiary->id,
            'type' => 'gallery_access',
        ]);
    }
}
