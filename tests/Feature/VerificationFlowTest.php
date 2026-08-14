<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VerificationPhoto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class VerificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_page_offers_the_upload_when_nothing_was_submitted(): void
    {
        $user = User::factory()->create(['is_verified' => false]);

        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Verification/create')
                ->where('status.is_verified', false)
                ->where('status.has_pending', false)
                ->where('status.rejected_reason', null)
            );
    }

    public function test_page_reports_a_pending_request(): void
    {
        $user = User::factory()->create(['is_verified' => false]);
        VerificationPhoto::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('status.has_pending', true)
                ->where('status.is_verified', false)
            );
    }

    public function test_page_surfaces_the_rejection_reason(): void
    {
        $user = User::factory()->create(['is_verified' => false]);
        VerificationPhoto::factory()
            ->rejected('Le visage n\'est pas visible.')
            ->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('status.has_pending', false)
                ->where('status.rejected_reason', 'Le visage n\'est pas visible.')
            );
    }

    public function test_page_reports_a_verified_account(): void
    {
        $user = User::factory()->create(['is_verified' => true]);
        VerificationPhoto::factory()->approved()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('status.is_verified', true)
                ->where('status.has_pending', false)
            );
    }

    public function test_user_can_submit_a_verification_selfie(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['is_verified' => false]);

        $this->actingAs($user)
            ->post(route('verification.store'), [
                'photo' => UploadedFile::fake()->image('selfie.jpg', 600, 800),
            ])
            ->assertRedirect(route('verification.create'));

        $this->assertDatabaseHas('verification_photos', [
            'user_id' => $user->id,
            'status' => 'pending',
        ]);
    }

    public function test_selfie_is_stored_on_the_private_disk(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $user = User::factory()->create(['is_verified' => false]);

        $this->actingAs($user)
            ->post(route('verification.store'), [
                'photo' => UploadedFile::fake()->image('selfie.jpg', 600, 800),
            ])
            ->assertRedirect();

        $path = VerificationPhoto::where('user_id', $user->id)->value('path');

        Storage::disk('local')->assertExists($path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_user_cannot_submit_while_a_request_is_pending(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['is_verified' => false]);
        VerificationPhoto::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->post(route('verification.store'), [
                'photo' => UploadedFile::fake()->image('selfie.jpg', 600, 800),
            ])
            ->assertRedirect();

        $this->assertSame(1, $user->verificationPhotos()->count());
    }

    public function test_guest_cannot_reach_the_verification_page(): void
    {
        $this->get(route('verification.create'))->assertRedirect(route('login'));
    }
}
