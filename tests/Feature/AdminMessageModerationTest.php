<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AdminMessageModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admin_can_release_a_pending_message_and_delivery_is_queued_after_approval(): void
    {
        Queue::fake();
        $sender = User::factory()->communityMember()->create();
        $recipient = User::factory()->communityMember()->create();
        $conversation = Conversation::factory()->between($sender, $recipient)->create();
        $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Bonjour !']);
        $this->actingAs($sender)->post(route('admin.messages.approve', $message), ['review_confirmed' => true])->assertForbidden();
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->get(route('admin.messages.index'))->assertOk();
        $this->post(route('admin.messages.approve', $message), ['review_confirmed' => true])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('messages', ['id' => $message->id, 'moderation_status' => 'approved', 'moderated_by' => $admin->id]);
        Queue::assertPushed(\App\Jobs\DeliverMessage::class);
    }

    public function test_open_conflict_freezes_both_directions_until_admin_closes_the_last_report(): void
    {
        Queue::fake();
        $sender = User::factory()->communityMember()->create();
        $recipient = User::factory()->communityMember()->create();
        $conversation = Conversation::factory()->between($sender, $recipient)->create();
        $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Bonjour']);
        $report = Report::factory()->create(['reporter_id' => $sender->id, 'reported_user_id' => $recipient->id, 'status' => 'pending']);
        $second = Report::factory()->create(['reporter_id' => $recipient->id, 'reported_user_id' => $sender->id, 'status' => 'reviewed']);
        $this->assertFalse($sender->canInteractWith($recipient));
        $this->assertFalse($recipient->canInteractWith($sender));
        $this->actingAs(User::factory()->create(['is_admin' => true]))->post(route('admin.messages.approve', $message), ['review_confirmed' => true])->assertStatus(409);
        Queue::assertNothingPushed();
        $report->update(['status' => 'dismissed']);
        $this->assertFalse($sender->canInteractWith($recipient));
        $second->update(['status' => 'actioned']);
        $this->assertTrue($sender->canInteractWith($recipient));
        $this->post(route('admin.messages.approve', $message), ['review_confirmed' => true])->assertSessionHasNoErrors();
    }

    public function test_rejection_requires_a_reason_and_never_dispatches_delivery(): void
    {
        Queue::fake();
        $conversation = Conversation::factory()->create();
        $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $conversation->user1_id, 'content' => 'Texte à examiner']);
        $this->actingAs(User::factory()->create(['is_admin' => true]))->post(route('admin.messages.reject', $message))->assertSessionHasErrors('reason');
        $this->post(route('admin.messages.reject', $message), ['reason' => str_repeat('Motif détaillé ', 35)])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('messages', ['id' => $message->id, 'moderation_status' => 'rejected']);
        Queue::assertNothingPushed();
    }
}
