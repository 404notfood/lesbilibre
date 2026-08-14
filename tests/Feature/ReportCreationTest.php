<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ReportCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_form_shows_the_reported_user(): void
    {
        $user = User::factory()->create();
        $target = User::factory()->create(['pseudo' => 'profil-cible']);

        $this->actingAs($user)
            ->get(route('reports.create', ['userId' => $target->id]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Reports/Create')
                ->where('reportedUser.id', $target->id)
                ->where('reportedUser.pseudo', 'profil-cible')
            );
    }

    public function test_report_form_returns_404_for_an_unknown_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('reports.create', ['userId' => 999999]))
            ->assertNotFound();
    }

    public function test_user_can_submit_a_report(): void
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $this->actingAs($user)
            ->post(route('reports.store'), [
                'reported_user_id' => $target->id,
                'reason' => 'harassment',
                'description' => 'Messages insistants malgré un refus explicite.',
            ])
            ->assertRedirect(route('profile.view', $target->id));

        $this->assertDatabaseHas('reports', [
            'reporter_id' => $user->id,
            'reported_user_id' => $target->id,
            'reason' => 'harassment',
            'status' => 'pending',
        ]);
    }

    public function test_user_cannot_report_themselves(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('reports.store'), [
                'reported_user_id' => $user->id,
                'reason' => 'spam',
                'description' => 'Description suffisamment longue.',
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('reports', 0);
    }

    public function test_user_cannot_report_the_same_person_twice_while_pending(): void
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        Report::factory()->create([
            'reporter_id' => $user->id,
            'reported_user_id' => $target->id,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->post(route('reports.store'), [
                'reason' => 'spam',
                'reported_user_id' => $target->id,
                'description' => 'Description suffisamment longue.',
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('reports', 1);
    }

    public function test_description_must_be_long_enough(): void
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $this->actingAs($user)
            ->post(route('reports.store'), [
                'reported_user_id' => $target->id,
                'reason' => 'spam',
                'description' => 'court',
            ])
            ->assertSessionHasErrors('description');

        $this->assertDatabaseCount('reports', 0);
    }

    public function test_reason_must_be_a_known_value(): void
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $this->actingAs($user)
            ->post(route('reports.store'), [
                'reported_user_id' => $target->id,
                'reason' => 'wat',
                'description' => 'Description suffisamment longue.',
            ])
            ->assertSessionHasErrors('reason');
    }
}
