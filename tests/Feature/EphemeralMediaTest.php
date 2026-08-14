<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\PremiumPlan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EphemeralMediaTest extends TestCase
{
    use RefreshDatabase;

    private function storeFile(string $path): void
    {
        $image = imagecreatetruecolor(60, 80);
        ob_start();
        imagejpeg($image);
        $bytes = (string) ob_get_clean();
        imagedestroy($image);

        Storage::disk('local')->put($path, $bytes);
    }

    /** A media addressed to $recipient, with its file actually on disk. */
    private function mediaFor(User $recipient, array $state = []): EphemeralMedia
    {
        $sender = User::factory()->create();
        $conversation = Conversation::factory()->between($sender, $recipient)->create();

        $media = EphemeralMedia::factory()->create(array_merge([
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
        ], $state));

        $this->storeFile($media->path);

        return $media;
    }

    // --- Envoi ---

    public function test_member_can_send_an_ephemeral_photo(): void
    {
        Storage::fake('local');

        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $conversation = Conversation::factory()->between($sender, $recipient)->create();

        $this->actingAs($sender)
            ->post(route('ephemeral.store', $conversation), [
                'file' => UploadedFile::fake()->image('secret.jpg', 800, 1000),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('ephemeral_media', [
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'type' => 'photo',
            'processing_status' => 'ready',
        ]);
    }

    public function test_ephemeral_files_never_land_on_the_public_disk(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $conversation = Conversation::factory()->between($sender, $recipient)->create();

        $this->actingAs($sender)->post(route('ephemeral.store', $conversation), [
            'file' => UploadedFile::fake()->image('secret.jpg', 800, 1000),
        ]);

        $path = EphemeralMedia::first()->path;

        Storage::disk('local')->assertExists($path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_a_stranger_cannot_post_into_a_conversation(): void
    {
        Storage::fake('local');

        $conversation = Conversation::factory()->create();
        $stranger = User::factory()->create();

        $this->actingAs($stranger)
            ->post(route('ephemeral.store', $conversation), [
                'file' => UploadedFile::fake()->image('secret.jpg'),
            ])
            ->assertForbidden();
    }

    public function test_a_video_is_queued_for_transcoding(): void
    {
        Storage::fake('local');
        Queue::fake();

        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $conversation = Conversation::factory()->between($sender, $recipient)->create();

        $this->mock(\App\Services\VideoProcessingService::class, function ($mock) {
            $mock->shouldReceive('isAvailable')->andReturn(true);
            $mock->shouldReceive('durationOf')->andReturn(12.0);
        });

        $this->actingAs($sender)
            ->post(route('ephemeral.store', $conversation), [
                'file' => UploadedFile::fake()->create('clip.mp4', 2048, 'video/mp4'),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('ephemeral_media', [
            'type' => 'video',
            'processing_status' => 'pending',
        ]);

        Queue::assertPushed(\App\Jobs\TranscodeEphemeralVideo::class);
    }

    public function test_an_overlong_video_is_refused(): void
    {
        Storage::fake('local');

        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $conversation = Conversation::factory()->between($sender, $recipient)->create();

        $this->mock(\App\Services\VideoProcessingService::class, function ($mock) {
            $mock->shouldReceive('isAvailable')->andReturn(true);
            $mock->shouldReceive('durationOf')->andReturn(300.0);
        });

        $this->actingAs($sender)
            ->post(route('ephemeral.store', $conversation), [
                'file' => UploadedFile::fake()->create('long.mp4', 2048, 'video/mp4'),
            ])
            ->assertSessionHasErrors('file');
    }

    // --- Première vue ---

    public function test_first_view_is_free_and_opens_the_replay_window(): void
    {
        $recipient = User::factory()->create(['gems' => 100]);
        $media = $this->mediaFor($recipient);

        $this->actingAs($recipient)
            ->get(route('ephemeral.show', $media))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/jpeg');

        $media->refresh();
        $this->assertNotNull($media->first_viewed_at);
        $this->assertNotNull($media->replay_available_until);
        // La première vue est gratuite : le solde ne bouge pas.
        $this->assertSame(100, $recipient->fresh()->gems);
    }

    public function test_an_unopened_media_never_expires(): void
    {
        $recipient = User::factory()->create();

        // Envoyée il y a trois semaines, jamais ouverte : doit rester visible.
        $media = $this->mediaFor($recipient, ['created_at' => now()->subWeeks(3)]);

        $this->actingAs($recipient)
            ->get(route('ephemeral.show', $media))
            ->assertOk();
    }

    public function test_the_sender_cannot_open_what_they_sent(): void
    {
        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient);

        $this->actingAs($media->sender)
            ->get(route('ephemeral.show', $media))
            ->assertForbidden();
    }

    public function test_a_third_party_cannot_open_it(): void
    {
        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient);

        $this->actingAs(User::factory()->create())
            ->get(route('ephemeral.show', $media))
            ->assertForbidden();
    }

    // --- Revoyure ---

    public function test_a_replay_costs_gems_for_a_free_account(): void
    {
        config(['media.ephemeral.replay_cost_gems' => 20]);

        $recipient = User::factory()->create(['gems' => 50]);
        $media = $this->mediaFor($recipient, [
            'first_viewed_at' => now()->subHour(),
            'replay_available_until' => now()->addHours(23),
        ]);

        $this->actingAs($recipient)
            ->get(route('ephemeral.show', $media))
            ->assertOk();

        $this->assertSame(30, $recipient->fresh()->gems);
        $this->assertNotNull($media->fresh()->replayed_at);
    }

    public function test_a_replay_is_refused_without_enough_gems(): void
    {
        config(['media.ephemeral.replay_cost_gems' => 20]);

        $recipient = User::factory()->create(['gems' => 5]);
        $media = $this->mediaFor($recipient, [
            'first_viewed_at' => now()->subHour(),
            'replay_available_until' => now()->addHours(23),
        ]);

        $this->actingAs($recipient)
            ->get(route('ephemeral.show', $media))
            ->assertStatus(402);

        $this->assertSame(5, $recipient->fresh()->gems);
        $this->assertNull($media->fresh()->replayed_at);
    }

    public function test_premium_members_replay_without_paying(): void
    {
        config(['media.ephemeral.replay_cost_gems' => 20]);

        $recipient = User::factory()->create(['gems' => 50]);
        $recipient->is_premium = true;
        $recipient->premium_expires_at = now()->addMonth();
        $recipient->save();

        PremiumPlan::factory()->create([
            'slug' => 'replay-plan',
            'entitlements' => ['free_replays' => true],
        ]);

        Subscription::create([
            'user_id' => $recipient->id,
            'plan' => 'replay-plan',
            'amount' => 19.99,
            'status' => 'active',
            'starts_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);

        $media = $this->mediaFor($recipient->fresh(), [
            'first_viewed_at' => now()->subHour(),
            'replay_available_until' => now()->addHours(23),
        ]);

        $this->actingAs($recipient->fresh())
            ->get(route('ephemeral.show', $media))
            ->assertOk();

        $this->assertSame(50, $recipient->fresh()->gems);
    }

    public function test_a_second_replay_is_refused(): void
    {
        $recipient = User::factory()->create(['gems' => 500]);
        $media = $this->mediaFor($recipient, [
            'first_viewed_at' => now()->subHours(2),
            'replay_available_until' => now()->addHours(22),
            'replayed_at' => now()->subHour(),
        ]);

        $this->actingAs($recipient)
            ->get(route('ephemeral.show', $media))
            ->assertStatus(410);
    }

    public function test_the_replay_window_closes_after_24_hours(): void
    {
        $recipient = User::factory()->create(['gems' => 500]);
        $media = $this->mediaFor($recipient, [
            'first_viewed_at' => now()->subDays(2),
            'replay_available_until' => now()->subDay(),
        ]);

        $this->actingAs($recipient)
            ->get(route('ephemeral.show', $media))
            ->assertStatus(410);
    }

    public function test_a_video_still_processing_cannot_be_opened(): void
    {
        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient, [
            'type' => 'video',
            'processing_status' => 'pending',
        ]);

        $this->actingAs($recipient)
            ->get(route('ephemeral.show', $media))
            ->assertStatus(425);
    }

    // --- Affichage dans la conversation ---

    public function test_conversation_exposes_state_without_the_file(): void
    {
        Storage::fake('local');

        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient);

        $response = $this->actingAs($recipient)
            ->get(route('conversations.show', $media->conversation_id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('ephemeral', 1)
            ->where('ephemeral.0.can_open', true)
            ->where('ephemeral.0.opened', false)
        );

        // Le chemin de stockage ne doit jamais transiter jusqu'au navigateur.
        $response->assertDontSee($media->path);
    }

    public function test_sender_sees_their_own_media_as_unopenable(): void
    {
        Storage::fake('local');

        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient);

        $this->actingAs($media->sender)
            ->get(route('conversations.show', $media->conversation_id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('ephemeral.0.is_mine', true)
                ->where('ephemeral.0.can_open', false)
            );
    }

    public function test_purged_media_disappear_from_the_conversation(): void
    {
        Storage::fake('local');

        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient, ['purged_at' => now()]);

        $this->actingAs($recipient)
            ->get(route('conversations.show', $media->conversation_id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('ephemeral', 0));
    }

    // --- Purge ---

    public function test_purge_deletes_files_past_retention_but_keeps_the_row(): void
    {
        Storage::fake('local');

        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient, ['purge_after' => now()->subDay()]);

        $this->artisan('ephemeral:prune')->assertSuccessful();

        Storage::disk('local')->assertMissing($media->path);
        // La ligne survit : elle alimente les compteurs agrégés de l'admin.
        $this->assertDatabaseHas('ephemeral_media', [
            'id' => $media->id,
            'purged_at' => now()->toDateTimeString(),
        ]);
    }

    public function test_purge_spares_media_under_review(): void
    {
        Storage::fake('local');

        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient, [
            'purge_after' => now()->subDay(),
            'is_flagged' => true,
        ]);

        $this->artisan('ephemeral:prune')->assertSuccessful();

        Storage::disk('local')->assertExists($media->path);
        $this->assertNull($media->fresh()->purged_at);
    }

    public function test_purge_leaves_media_within_retention_alone(): void
    {
        Storage::fake('local');

        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient, ['purge_after' => now()->addDays(10)]);

        $this->artisan('ephemeral:prune')->assertSuccessful();

        Storage::disk('local')->assertExists($media->path);
    }

    public function test_a_purged_media_cannot_be_opened(): void
    {
        $recipient = User::factory()->create();
        $media = $this->mediaFor($recipient, ['purged_at' => now()]);

        $this->actingAs($recipient)
            ->get(route('ephemeral.show', $media))
            ->assertStatus(410);
    }
}
