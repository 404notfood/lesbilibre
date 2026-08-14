<?php

namespace Tests\Feature\Admin;

use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class EphemeralModerationTest extends TestCase
{
    use RefreshDatabase;

    private function media(array $state = []): EphemeralMedia
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $media = EphemeralMedia::factory()->create(array_merge([
            'conversation_id' => Conversation::factory()->between($sender, $recipient),
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
        ], $state));

        Storage::disk('local')->put($media->path, 'contenu');

        return $media;
    }

    public function test_non_admin_cannot_reach_the_ephemeral_console(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.ephemeral.index'))
            ->assertForbidden();
    }

    public function test_console_reports_usage_without_exposing_content(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);

        $this->media();
        $this->media(['type' => 'video']);
        $this->media(['first_viewed_at' => now()]);

        $this->actingAs($admin)
            ->get(route('admin.ephemeral.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Ephemeral/Index')
                ->where('stats.sent_total', 3)
                ->where('stats.videos', 1)
                ->where('stats.opened', 1)
                // Rien n'est signalé : la file est vide, aucun fichier n'est exposé.
                ->has('flagged', 0)
            );
    }

    public function test_only_flagged_media_appear_in_the_queue(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);

        $this->media();
        $flagged = $this->media(['is_flagged' => true]);

        $this->actingAs($admin)
            ->get(route('admin.ephemeral.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('flagged', 1)
                ->where('flagged.0.id', $flagged->id)
            );
    }

    public function test_an_unflagged_file_cannot_be_opened_by_an_admin(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);
        $media = $this->media();

        // Cœur de la promesse faite aux membres : sans signalement, personne
        // ne regarde — pas même une administratrice.
        $this->actingAs($admin)
            ->get(route('admin.ephemeral.file', $media))
            ->assertForbidden();
    }

    public function test_a_flagged_file_can_be_reviewed_and_the_access_is_logged(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);
        $media = $this->media(['is_flagged' => true]);

        $this->actingAs($admin)
            ->get(route('admin.ephemeral.file', $media))
            ->assertOk();

        $this->assertDatabaseHas('moderation_actions', [
            'moderator_id' => $admin->id,
            'action' => 'ephemeral_reviewed',
        ]);
    }

    public function test_admin_can_dismiss_a_report(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);
        $media = $this->media(['is_flagged' => true]);

        $this->actingAs($admin)
            ->post(route('admin.ephemeral.dismiss', $media))
            ->assertRedirect();

        $this->assertFalse($media->fresh()->is_flagged);
    }

    public function test_admin_can_delete_a_flagged_file_with_a_reason(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);
        $media = $this->media(['is_flagged' => true]);

        $this->actingAs($admin)
            ->delete(route('admin.ephemeral.destroy', $media), [
                'reason' => 'Contenu illicite.',
            ])
            ->assertRedirect();

        Storage::disk('local')->assertMissing($media->path);
        $this->assertNotNull($media->fresh()->purged_at);
    }

    public function test_deleting_requires_a_reason(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['is_admin' => true]);
        $media = $this->media(['is_flagged' => true]);

        $this->actingAs($admin)
            ->delete(route('admin.ephemeral.destroy', $media))
            ->assertSessionHasErrors('reason');

        Storage::disk('local')->assertExists($media->path);
    }

    // --- Signalement côté membre ---

    public function test_recipient_can_report_an_ephemeral_media(): void
    {
        Storage::fake('local');

        $media = $this->media();

        $this->actingAs($media->recipient)
            ->post(route('ephemeral.report', $media), [
                'reason' => 'Contenu non sollicité et choquant.',
            ])
            ->assertRedirect();

        $this->assertTrue($media->fresh()->is_flagged);
        $this->assertDatabaseHas('reports', [
            'reporter_id' => $media->recipient_id,
            'reported_user_id' => $media->sender_id,
        ]);
    }

    public function test_reporting_freezes_the_purge(): void
    {
        Storage::fake('local');

        $media = $this->media(['purge_after' => now()->subDay()]);

        $this->actingAs($media->recipient)
            ->post(route('ephemeral.report', $media), [
                'reason' => 'Contenu non sollicité et choquant.',
            ]);

        $this->artisan('ephemeral:prune')->assertSuccessful();

        // Signalé : le fichier survit à la purge le temps du traitement.
        Storage::disk('local')->assertExists($media->path);
        $this->assertNull($media->fresh()->purged_at);
    }

    public function test_only_the_recipient_can_report(): void
    {
        Storage::fake('local');

        $media = $this->media();

        $this->actingAs($media->sender)
            ->post(route('ephemeral.report', $media), [
                'reason' => 'Tentative de signalement par l’expéditrice.',
            ])
            ->assertForbidden();

        $this->assertFalse($media->fresh()->is_flagged);
    }
}
