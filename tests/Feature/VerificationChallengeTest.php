<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VerificationPhoto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class VerificationChallengeTest extends TestCase
{
    use RefreshDatabase;

    public function test_page_hands_out_a_numeric_code(): void
    {
        $user = User::factory()->create(['is_verified' => false]);

        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('challengeCode', fn (string $code) => (bool) preg_match('/^\d{5,9}$/', $code))
            );
    }

    public function test_code_stays_identical_across_reloads(): void
    {
        $user = User::factory()->create(['is_verified' => false]);

        $first = null;
        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertInertia(function (AssertableInertia $page) use (&$first) {
                $first = $page->toArray()['props']['challengeCode'];
            });

        // La membre lit le code, va chercher une feuille, revient : le code
        // doit être le même, sinon elle photographie un code périmé.
        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('challengeCode', $first)
            );
    }

    public function test_submitted_code_is_stored_with_the_photo(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['is_verified' => false]);

        $code = null;
        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertInertia(function (AssertableInertia $page) use (&$code) {
                $code = $page->toArray()['props']['challengeCode'];
            });

        $this->actingAs($user)
            ->post(route('verification.store'), [
                'photo' => UploadedFile::fake()->image('selfie.jpg', 600, 800),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('verification_photos', [
            'user_id' => $user->id,
            'challenge_code' => $code,
        ]);
    }

    public function test_a_new_code_is_issued_after_a_submission(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['is_verified' => false]);

        $first = null;
        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertInertia(function (AssertableInertia $page) use (&$first) {
                $first = $page->toArray()['props']['challengeCode'];
            });

        $this->actingAs($user)->post(route('verification.store'), [
            'photo' => UploadedFile::fake()->image('selfie.jpg', 600, 800),
        ]);

        // La demande est traitée puis rejetée : la membre recommence.
        VerificationPhoto::where('user_id', $user->id)->update([
            'status' => 'rejected',
            'rejection_reason' => 'Code illisible.',
        ]);

        $this->actingAs($user)
            ->get(route('verification.create'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('challengeCode', fn (string $code) => $code !== $first)
            );
    }

    public function test_moderation_queue_shows_the_expected_code(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        VerificationPhoto::factory()->create(['challenge_code' => '483920']);

        $this->actingAs($admin)
            ->get(route('admin.verifications.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('verifications.data.0.challenge_code', '483920')
            );
    }
}
