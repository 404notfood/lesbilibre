<?php

namespace Tests\Feature;

use App\Events\LikeReceived;
use App\Events\MatchCreated;
use App\Http\Controllers\EphemeralMediaController;
use App\Jobs\TranscodeEphemeralVideo;
use App\Models\BlockedUser;
use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\Like;
use App\Models\Message;
use App\Models\Photo;
use App\Models\User;
use App\Models\UserMatch;
use App\Services\GemService;
use App\Services\VideoProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CouncilRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_conversation_does_not_serialize_other_members_account(): void
    {
        $viewer = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        $conversation = Conversation::factory()->between($viewer, $other)->create();
        Message::factory()->create(['conversation_id' => $conversation->id, 'sender_id' => $other->id, 'content' => 'Bonjour', 'moderation_status' => 'approved']);

        $this->actingAs($viewer)->get(route('conversations.show', $conversation))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('conversation.id', $conversation->id)
            ->missing('conversation.user1')->missing('conversation.user2')
            ->where('messages.data.0.sender_id', $other->id)
            ->missing('messages.data.0.sender')
            );
    }

    public function test_public_profile_respects_hidden_age_and_location(): void
    {
        $viewer = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        $other->profile->update(['show_age' => false, 'show_location' => false, 'age' => 32, 'latitude' => 48.8566, 'longitude' => 2.3522]);

        $this->actingAs($viewer)->get(route('profile.view', $other->id))->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('user.profile.age', null)->where('user.profile.city', null)
                ->missing('user.profile.latitude')->missing('user.profile.longitude')
                ->missing('user.profile.postal_code')->missing('user.profile.date_of_birth')
            );
        $this->actingAs($other)->get(route('profile.edit'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('profile.city', $other->profile->city)->has('profile.date_of_birth'));
    }

    public function test_account_erasure_removes_private_gallery_video_and_poster(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $user = User::factory()->communityMember()->create();
        $photo = Photo::factory()->create(['user_id' => $user->id, 'media_type' => 'video', 'path' => 'gallery/videos/clip.mp4', 'thumbnail_path' => 'gallery/videos/clip.jpg']);
        Storage::disk('local')->put($photo->path, 'video');
        Storage::disk('local')->put($photo->thumbnail_path, 'poster');

        $this->actingAs($user)->delete(route('settings.delete-account'), ['confirmation' => 'SUPPRIMER'])->assertRedirect('/');
        $this->assertSoftDeleted($user);
        Storage::disk('local')->assertExists([$photo->path, $photo->thumbnail_path]);
        app(\App\Services\AccountErasureService::class)->erase(User::withTrashed()->findOrFail($user->id), User::factory()->create(['is_admin' => true]));
        Storage::disk('local')->assertMissing([$photo->path, $photo->thumbnail_path]);
    }

    public static function blockedDirections(): array
    {
        return ['sender blocks recipient' => [true], 'recipient blocks sender' => [false]];
    }

    #[DataProvider('blockedDirections')]
    public function test_gifts_respect_blocking_without_financial_or_notification_effects(bool $senderBlocks): void
    {
        $sender = User::factory()->communityMember()->create(['gems' => 100]);
        $recipient = User::factory()->communityMember()->create(['gems' => 0]);
        BlockedUser::create(['blocker_id' => $senderBlocks ? $sender->id : $recipient->id, 'blocked_id' => $senderBlocks ? $recipient->id : $sender->id]);
        $giftId = array_key_first(config('gifts'));

        $this->actingAs($sender)->post(route('shop.gifts.send'), ['gift_id' => $giftId, 'recipient_id' => $recipient->id, 'message' => 'Contact interdit'])->assertForbidden();
        $this->assertSame(100, $sender->fresh()->gems);
        $this->assertSame(0, $recipient->fresh()->gems);
        $this->assertDatabaseCount('gem_transactions', 0);
        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_stale_user_instances_cannot_spend_the_same_gems_twice(): void
    {
        $first = User::factory()->create(['gems' => 10]);
        $stale = $first->fresh();
        $service = app(GemService::class);
        $this->assertNotNull($service->deductGems($first, 10, 'spend', 'gift_sent'));
        $this->assertNull($service->deductGems($stale, 10, 'spend', 'gift_sent'));
        $this->assertSame(0, $first->fresh()->gems);
        $this->assertDatabaseCount('gem_transactions', 1);
    }

    public function test_video_transcoding_retries_after_a_transient_failure(): void
    {
        Storage::fake('local');
        $media = EphemeralMedia::factory()->create(['type' => 'video', 'processing_status' => 'pending']);
        Storage::disk('local')->put($media->path, 'raw');
        $videos = \Mockery::mock(VideoProcessingService::class);
        $videos->shouldReceive('transcode')->once()->andThrow(new \RuntimeException('temporary'));
        $videos->shouldReceive('transcode')->once()->andReturn(['path' => 'ephemeral/ready.mp4', 'thumbnail_path' => 'ephemeral/ready.jpg']);
        $job = new TranscodeEphemeralVideo($media->id);
        try {
            $job->handle($videos);
            $this->fail('The first attempt must fail.');
        } catch (\RuntimeException $e) {
            $this->assertSame('temporary', $e->getMessage());
        }
        $job->handle($videos);
        $this->assertSame('ready', $media->fresh()->processing_status);
    }

    public function test_activity_and_events_use_protected_avatar_urls(): void
    {
        $viewer = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        $photo = Photo::factory()->create(['user_id' => $other->id, 'is_primary' => true, 'is_approved' => true, 'moderation_status' => 'approved', 'is_private' => false, 'is_naughty' => false]);
        $like = Like::create(['user_id' => $other->id, 'liked_user_id' => $viewer->id]);
        $match = UserMatch::factory()->create(['user1_id' => $viewer->id, 'user2_id' => $other->id]);
        $this->assertSame($photo->viewUrl(thumbnail: true), (new LikeReceived($like))->broadcastWith()['user']['photo']);
        $this->assertSame($photo->viewUrl(thumbnail: true), (new MatchCreated($match, $viewer->id))->broadcastWith()['user']['photo']);
        $this->actingAs($viewer)->get(route('activity'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('likes_received.0.user.photo', $photo->viewUrl(thumbnail: true)));
    }

    public function test_pending_photo_preview_uses_admin_route_and_rejects_members(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['is_admin' => true]);
        $owner = User::factory()->communityMember()->create();
        $member = User::factory()->communityMember()->create();
        $photo = Photo::factory()->create(['user_id' => $owner->id, 'is_approved' => false, 'rejection_reason' => null]);
        Storage::disk('public')->put($photo->path, 'preview');
        $url = route('admin.users.photos.file', [$owner, $photo]);
        $this->actingAs($admin)->get(route('admin.moderation.index'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('pendingPhotos.0.path', $url));
        $this->get($url)->assertOk();
        $this->actingAs($member)->get($url)->assertForbidden();
        $this->get(route('media.photo', $photo))->assertNotFound();
    }

    public function test_stale_media_instances_cannot_obtain_two_free_views(): void
    {
        Storage::fake('local');
        $sender = User::factory()->communityMember()->create();
        $recipient = User::factory()->communityMember()->create(['gems' => 100]);
        $conversation = Conversation::factory()->between($sender, $recipient)->create();
        $media = EphemeralMedia::factory()->approved()->create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'recipient_id' => $recipient->id, 'processing_status' => 'ready', 'is_naughty' => false]);
        $stale = $media->fresh();
        Storage::disk('local')->put($media->path, 'photo');
        $request = \Illuminate\Http\Request::create('/ephemeral/'.$media->id);
        $request->setUserResolver(fn () => $recipient);
        $controller = app(EphemeralMediaController::class);
        $controller->show($request, $media);
        $controller->show($request, $stale);
        $this->assertNotNull($media->fresh()->replayed_at);
        $this->assertSame(100 - (int) config('media.ephemeral.replay_cost_gems'), $recipient->fresh()->gems);
    }

    public function test_search_likes_and_matches_do_not_expose_private_account_or_profile_fields(): void
    {
        $viewer = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        $other->profile->update(['show_age' => false, 'show_location' => false, 'age' => 30, 'latitude' => 48.8566, 'longitude' => 2.3522]);
        Like::create(['user_id' => $other->id, 'liked_user_id' => $viewer->id]);
        $this->actingAs($viewer)->get(route('search'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('results.data', 1)
                ->missing('results.data.0.email')->missing('results.data.0.profile.latitude')
                ->where('results.data.0.profile.age', null)->where('results.data.0.profile.city', null));
        $this->get(route('likes.received'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->missing('likes.data.0.user.email')
                ->missing('likes.data.0.user.profile.latitude')->where('likes.data.0.user.profile.age', null));
        $match = UserMatch::factory()->create(['user1_id' => $viewer->id, 'user2_id' => $other->id]);
        $this->get(route('matches.index'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('matches.0.id', $match->id)
                ->where('matches.0.user.id', $other->id)->missing('matches.0.user.email')
                ->where('matches.0.user.profile.age', null));
    }

    public function test_allowed_gift_still_transfers_gems_and_notifies(): void
    {
        $sender = User::factory()->communityMember()->create(['gems' => 100]);
        $recipient = User::factory()->communityMember()->create(['gems' => 0]);
        $giftId = array_key_first(config('gifts'));
        $cost = config('gifts')[$giftId]['price'];
        $this->actingAs($sender)->post(route('shop.gifts.send'), ['gift_id' => $giftId, 'recipient_id' => $recipient->id])
            ->assertSessionHas('success');
        $this->assertSame(100 - $cost, $sender->fresh()->gems);
        $this->assertSame((int) ceil($cost * 0.1), $recipient->fresh()->gems);
        $this->assertDatabaseCount('gem_transactions', 2);
        $this->assertDatabaseHas('notifications', ['user_id' => $recipient->id, 'type' => 'gift']);
    }

    public function test_blocked_and_restricted_gift_recipients_are_not_preselected(): void
    {
        $sender = User::factory()->communityMember()->create();
        $recipient = User::factory()->communityMember()->create();
        BlockedUser::create(['blocker_id' => $recipient->id, 'blocked_id' => $sender->id]);
        $this->actingAs($sender)->get(route('shop.index', ['gift_to' => $recipient->id]))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('giftRecipient', null));
        BlockedUser::query()->delete();
        $recipient->forceFill(['safety_restricted_at' => now()])->save();
        $this->get(route('shop.index', ['gift_to' => $recipient->id]))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('giftRecipient', null));
        $this->post(route('shop.gifts.send'), ['gift_id' => array_key_first(config('gifts')), 'recipient_id' => $recipient->id])->assertForbidden();
        $this->assertDatabaseCount('gem_transactions', 0);
    }

    public function test_missing_ephemeral_file_does_not_consume_view_or_gems(): void
    {
        Storage::fake('local');
        $sender = User::factory()->communityMember()->create();
        $recipient = User::factory()->communityMember()->create(['gems' => 100]);
        $conversation = Conversation::factory()->between($sender, $recipient)->create();
        $media = EphemeralMedia::factory()->approved()->create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'recipient_id' => $recipient->id, 'processing_status' => 'ready', 'is_naughty' => false]);
        $this->actingAs($recipient)->get(route('ephemeral.show', $media))->assertGone();
        $this->assertNull($media->fresh()->first_viewed_at);
        $media->markFirstView();
        $this->get(route('ephemeral.show', $media))->assertGone();
        $this->assertNull($media->fresh()->replayed_at);
        $this->assertSame(100, $recipient->fresh()->gems);
        $this->assertDatabaseCount('gem_transactions', 0);
    }

    public function test_terminal_video_failure_removes_original_and_marks_purged(): void
    {
        Storage::fake('local');
        $media = EphemeralMedia::factory()->create(['type' => 'video', 'processing_status' => 'pending']);
        Storage::disk('local')->put($media->path, 'raw');
        (new TranscodeEphemeralVideo($media->id))->failed(new \RuntimeException('terminal'));
        Storage::disk('local')->assertMissing($media->path);
        $this->assertSame('failed', $media->fresh()->processing_status);
        $this->assertNotNull($media->fresh()->purged_at);
    }

    public function test_blocked_list_uses_existing_component_and_no_forbidden_photo(): void
    {
        $viewer = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        BlockedUser::create(['blocker_id' => $viewer->id, 'blocked_id' => $other->id]);
        $this->actingAs($viewer)->get(route('blocked.index'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('settings/BlockedUsers')
                ->where('blockedUsers.0.user.photo', null)->where('blockedUsers.0.user.age', null));
    }

    public function test_dashboard_hides_age_city_and_distance_but_public_fields_remain_visible_when_allowed(): void
    {
        $viewer = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        $other->profile->update(['show_age' => false, 'show_location' => false]);
        Photo::factory()->approved()->create(['user_id' => $other->id]);
        Like::create(['user_id' => $other->id, 'liked_user_id' => $viewer->id]);
        $this->actingAs($viewer)->get(route('dashboard'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('profiles', 1)
                ->where('profiles.0.age', null)->where('profiles.0.city', null)->where('profiles.0.distance', null)
                ->where('liveSignals.last_like.age', null));
        $other->profile->update(['show_age' => true, 'show_location' => true]);
        $this->get(route('profile.view', $other->id))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('user.profile.age', $other->profile->age)
                ->where('user.profile.city', $other->profile->city));
    }

    public function test_match_message_action_opens_the_correct_conversation(): void
    {
        $viewer = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        UserMatch::factory()->create(['user1_id' => $viewer->id, 'user2_id' => $other->id, 'matched_at' => now()]);
        $response = $this->actingAs($viewer)->post(route('conversations.store', $other->id));
        $conversation = Conversation::firstOrFail();
        $response->assertRedirect(route('conversations.show', $conversation));
        $this->get(route('conversations.show', $conversation))->assertOk();
        $this->assertDatabaseCount('conversations', 1);
        $this->post(route('conversations.store', $other->id))->assertRedirect(route('conversations.show', $conversation));
        $this->assertDatabaseCount('conversations', 1);
    }
}
