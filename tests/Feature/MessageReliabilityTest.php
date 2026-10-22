<?php

namespace Tests\Feature;

use App\Events\MessageSent;
use App\Jobs\DeliverMessage;
use App\Models\BlockedUser;
use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\Message;
use App\Models\MessageDelivery;
use App\Models\User;
use Illuminate\Contracts\Broadcasting\Factory as BroadcastFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use RuntimeException;
use Tests\TestCase;

class MessageReliabilityTest extends TestCase
{
    use RefreshDatabase;

    private function members(): array
    {
        $sender = User::factory()->communityMember()->create();
        $recipient = User::factory()->communityMember()->create();
        $conversation = Conversation::create(['user1_id' => $sender->id, 'user2_id' => $recipient->id]);

        return [$sender, $recipient, $conversation];
    }

    public function test_message_date_and_pending_delivery_are_saved_together(): void
    {
        Queue::fake();
        [$sender, , $conversation] = $this->members();
        $uuid = (string) Str::uuid();
        $this->actingAs($sender)->post(route('messages.store', $conversation), ['content' => 'Bonjour Camille', 'client_uuid' => $uuid])->assertRedirect()->assertSessionHas('success');
        $message = Message::firstOrFail();
        $this->assertSame($uuid, $message->client_uuid);
        $this->assertTrue($conversation->fresh()->last_message_at->equalTo($message->created_at));
        $this->assertDatabaseHas('message_deliveries', ['message_id' => $message->id, 'state' => 'pending']);
        $this->assertSame('pending', $message->fresh()->moderation_status);
        Queue::assertNotPushed(DeliverMessage::class);
    }

    public function test_queue_failure_after_approval_keeps_a_durable_pending_delivery(): void
    {
        [$sender, , $conversation] = $this->members();
        $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Bonjour sans temps réel', 'moderation_status' => 'approved']);
        Bus::shouldReceive('dispatch')->once()->andThrow(new RuntimeException('simulated broker failure'));
        MessageDelivery::enqueueApproved($message);
        $this->assertDatabaseCount('messages', 1);
        $this->assertDatabaseHas('message_deliveries', ['state' => 'pending']);
    }

    public function test_a_retried_uuid_returns_the_same_message_even_while_waiting_for_a_reply(): void
    {
        Queue::fake();
        [$sender, , $conversation] = $this->members();
        $payload = ['content' => 'Une seule introduction', 'client_uuid' => (string) Str::uuid()];
        $this->actingAs($sender)->post(route('messages.store', $conversation), $payload)->assertRedirect();
        $this->post(route('messages.store', $conversation), $payload)->assertRedirect()->assertSessionHas('success');
        $this->assertDatabaseCount('messages', 1);
        $this->assertDatabaseCount('message_deliveries', 1);
        Queue::assertNotPushed(DeliverMessage::class);
        $this->post(route('messages.store', $conversation), ['content' => 'Un autre contenu', 'client_uuid' => $payload['client_uuid']])->assertStatus(409);
        $this->assertDatabaseCount('messages', 1);
    }

    public function test_delivery_failure_can_retry_and_success_is_idempotent(): void
    {
        [$sender, , $conversation] = $this->members();
        $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Message de test', 'moderation_status' => 'approved']);
        $delivery = MessageDelivery::create(['message_id' => $message->id]);
        $this->mock(BroadcastFactory::class, fn ($mock) => $mock->shouldReceive('queue')->once()->andThrow(new RuntimeException('simulated realtime failure')));
        try {
            (new DeliverMessage($delivery->id))->handle();
            $this->fail('Delivery must be retryable after broadcast failure.');
        } catch (RuntimeException $exception) {
            $this->assertSame('simulated realtime failure', $exception->getMessage());
        }
        $this->assertSame('pending', $delivery->fresh()->state);
        $this->assertSame(1, $delivery->fresh()->attempts);
        Event::fake([MessageSent::class]);
        (new DeliverMessage($delivery->id))->handle();
        (new DeliverMessage($delivery->id))->handle();
        Event::assertDispatchedTimes(MessageSent::class, 1);
        $this->assertSame('delivered', $delivery->fresh()->state);
        $this->assertSame(2, $delivery->fresh()->attempts);
    }

    public function test_a_pending_delivery_is_cancelled_after_a_block(): void
    {
        [$sender, $recipient, $conversation] = $this->members();
        $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Avant le blocage', 'moderation_status' => 'approved']);
        $delivery = MessageDelivery::create(['message_id' => $message->id]);
        BlockedUser::create(['blocker_id' => $recipient->id, 'blocked_id' => $sender->id]);
        Event::fake([MessageSent::class]);
        (new DeliverMessage($delivery->id))->handle();
        Event::assertNotDispatched(MessageSent::class);
        $this->assertSame('cancelled', $delivery->fresh()->state);
        $this->artisan('messages:retry-delivery')->assertSuccessful();
        $this->assertSame('cancelled', $delivery->fresh()->state);
    }

    public function test_deleted_interlocutor_is_an_archived_tombstone_without_private_data(): void
    {
        [$sender, $recipient, $conversation] = $this->members();
        Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Mon texte conservé']);
        $recipient->delete();
        $this->actingAs($sender)->get(route('conversations.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->where('conversations.0.other_user.name', 'Compte supprimé')->where('conversations.0.other_user.avatar_url', null));
        $this->get(route('conversations.show', $conversation))->assertOk()->assertInertia(fn ($page) => $page
            ->where('archived', true)->where('canSendMessage', false)->where('otherUser.name', 'Compte supprimé')->has('ephemeral', 0));
        $this->post(route('messages.store', $conversation), ['content' => 'Nouvel envoi interdit'])->assertForbidden();
    }

    public function test_unseen_history_stays_unread_and_can_be_fetched_by_cursor(): void
    {
        [$sender, $recipient, $conversation] = $this->members();
        for ($index = 0; $index < 60; $index++) {
            Message::create(['conversation_id' => $conversation->id, 'sender_id' => $recipient->id, 'content' => 'Message '.$index, 'moderation_status' => 'approved']);
        }
        $response = $this->actingAs($sender)->get(route('conversations.show', $conversation))->assertOk();
        $visible = $response->viewData('page')['props']['messages']['data'];
        $this->assertCount(50, $visible);
        $this->assertSame(60, Message::whereNull('read_at')->count());
        $before = $visible[0]['id'];
        $this->getJson(route('conversations.sync', $conversation).'?before_id='.$before)->assertOk()->assertJsonCount(10, 'messages')->assertJsonPath('has_more', false);
        $this->postJson(route('conversations.read', $conversation), ['ids' => [$visible[49]['id']]])->assertOk();
        $this->assertSame(59, Message::whereNull('read_at')->count());
    }

    public function test_sync_recovers_missed_messages_and_first_reply_permissions(): void
    {
        [$sender, $recipient, $conversation] = $this->members();
        $first = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Introduction', 'moderation_status' => 'approved']);
        $this->actingAs($sender)->getJson(route('conversations.sync', $conversation).'?after_id='.$first->id)->assertOk()->assertJsonPath('canSendMessage', false)->assertJsonCount(0, 'messages');
        $reply = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $recipient->id, 'content' => 'Réponse', 'moderation_status' => 'approved']);
        $this->getJson(route('conversations.sync', $conversation).'?after_id='.$first->id)->assertOk()->assertJsonPath('canSendMessage', true)->assertJsonPath('messages.0.id', $reply->id)->assertJsonCount(1, 'messages');
        $this->assertNull($reply->fresh()->read_at);
        $stranger = User::factory()->communityMember()->create();
        $this->actingAs($stranger)->getJson(route('conversations.sync', $conversation))->assertForbidden();
        $this->postJson(route('conversations.read', $conversation), ['ids' => [$reply->id]])->assertForbidden();
    }

    public function test_pending_and_rejected_messages_are_never_exposed_to_the_recipient(): void
    {
        Queue::fake();
        [$sender, $recipient, $conversation] = $this->members();
        $this->actingAs($sender)->post(route('messages.store', $conversation), ['content' => 'En attente de validation'])->assertRedirect();
        $message = Message::firstOrFail();
        $this->get(route('conversations.show', $conversation))->assertOk()->assertInertia(fn ($page) => $page->where('messages.data.0.moderation_status', 'pending'));
        $this->actingAs($recipient)->get(route('conversations.show', $conversation))->assertOk()->assertInertia(fn ($page) => $page->has('messages.data', 0));
        $this->get(route('conversations.index'))->assertOk()->assertInertia(fn ($page) => $page->where('conversations.0.last_message', null)->where('conversations.0.unread_count', 0));
        $this->getJson(route('conversations.sync', $conversation).'?after_change_id=0')->assertOk()->assertJsonCount(0, 'messages');
        $this->postJson(route('conversations.read', $conversation), ['ids' => [$message->id]])->assertOk();
        $this->assertNull($message->fresh()->read_at);
        $this->assertSame([], (new MessageSent($message))->broadcastOn());
        $message->update(['moderation_status' => 'rejected', 'moderation_reason' => 'Hors charte']);
        $this->get(route('conversations.show', $conversation))->assertOk()->assertInertia(fn ($page) => $page->has('messages.data', 0));
        $this->actingAs($sender)->get(route('conversations.show', $conversation))->assertOk()->assertInertia(fn ($page) => $page->where('messages.data.0.moderation_status', 'rejected')->where('messages.data.0.moderation_reason', 'Hors charte'));
        Queue::assertNotPushed(DeliverMessage::class);
    }

    public function test_late_approval_is_recovered_even_when_the_message_id_is_older(): void
    {
        [$sender, $recipient, $conversation] = $this->members();
        $pending = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Ancien message encore en attente', 'moderation_status' => 'pending']);
        $newer = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Message plus récent déjà validé', 'moderation_status' => 'approved']);
        $response = $this->actingAs($recipient)->get(route('conversations.show', $conversation))->assertOk();
        $cursor = $response->viewData('page')['props']['messageCursor'];
        $this->assertSame($newer->id, $response->viewData('page')['props']['messages']['data'][0]['id']);
        $pending->update(['moderation_status' => 'approved', 'reviewed_at' => now()]);
        $this->getJson(route('conversations.sync', $conversation).'?after_change_id='.$cursor)->assertOk()->assertJsonCount(1, 'messages')->assertJsonPath('messages.0.id', $pending->id)->assertJsonPath('messages.0.moderation_status', 'approved');
    }

    public function test_message_identity_uses_pseudo_and_email_content_is_never_shared(): void
    {
        [$sender, $recipient, $conversation] = $this->members();
        $sender->update(['name' => 'Nom civil privé', 'pseudo' => 'CamilleLibre']);
        $this->actingAs($sender)->post(route('messages.store', $conversation), ['content' => 'Écris-moi sur test.person@example.com'])->assertSessionHasErrors('content');
        $this->assertDatabaseCount('messages', 0);
        $legacy = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Ancien texte test.person@example.com', 'moderation_status' => 'approved']);
        $this->actingAs($recipient)->get(route('conversations.show', $conversation))->assertOk()->assertInertia(fn ($page) => $page->where('otherUser.name', 'CamilleLibre')->where('messages.data.0.content', 'Ancien texte [adresse masquée]'));
        $payload = (new MessageSent($legacy->load('sender')))->broadcastWith();
        $this->assertSame('CamilleLibre', $payload['sender']['name']);
        $this->assertStringNotContainsString('@', $payload['content']);
    }

    public function test_media_sync_hides_pending_uploads_and_recovers_approval_without_a_new_text_message(): void
    {
        [$sender, $recipient, $conversation] = $this->members();
        $medium = EphemeralMedia::factory()->create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'recipient_id' => $recipient->id]);
        $url = route('conversations.sync', $conversation).'?after_change_id=0';
        $this->actingAs($recipient)->getJson($url)->assertOk()->assertJsonCount(0, 'ephemeral');
        $this->actingAs($sender)->getJson($url)->assertOk()->assertJsonPath('ephemeral.0.moderation_status', 'pending')->assertJsonPath('ephemeral.0.can_open', false);
        $medium->update(['moderation_status' => 'approved', 'moderated_at' => now()]);
        $response = $this->actingAs($recipient)->getJson($url)->assertOk()->assertJsonCount(1, 'ephemeral')->assertJsonPath('ephemeral.0.can_open', true)->assertJsonPath('ephemeral.0.moderation_reason', null);
        $this->assertArrayNotHasKey('path', $response->json('ephemeral.0'));
        $medium->update(['moderation_status' => 'rejected', 'moderation_reason' => 'Contacter test@example.com']);
        $this->getJson($url)->assertOk()->assertJsonCount(0, 'ephemeral');
        $this->actingAs($sender)->getJson($url)->assertOk()->assertJsonPath('ephemeral.0.moderation_reason', 'Contacter [adresse masquée]');
    }
}
