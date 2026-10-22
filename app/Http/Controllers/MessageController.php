<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageDelivery;
use App\Models\User;
use App\Services\AntiAbuseService;
use App\Services\EntitlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Send a message in a conversation.
     */
    public function store(SendMessageRequest $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();
        $result = DB::transaction(function () use ($request, $conversation, $user) {
            // Serialize a sender's quota and both sides of the first-reply rule.
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $conversation = Conversation::whereKey($conversation->id)->lockForUpdate()->firstOrFail();
            $this->assertAccess($user, $conversation);
            $uuid = $request->input('client_uuid');
            if ($uuid) {
                $existing = Message::where('sender_id', $user->id)->where('client_uuid', $uuid)->first();
                if ($existing) {
                    abort_unless($existing->conversation_id === $conversation->id && $existing->content === $request->input('content'), 409, 'Cet identifiant d’envoi est déjà utilisé.');

                    return ['delivery' => null, 'error' => null];
                }
            }

            if (! $conversation->canSendMessage($user)) {
                return ['delivery' => null, 'error' => 'Attendez sa réponse avant d’envoyer un autre message.'];
            }
            app(AntiAbuseService::class)->assertMessageAllowed($user, $request->string('content')->toString());
            $isOpening = ! $conversation->messages()->where('sender_id', '!=', $user->id)->exists();
            $remaining = $isOpening ? app(EntitlementService::class)->firstMessagesRemaining($user) : null;
            if ($remaining !== null && $remaining <= 0) {
                return ['delivery' => null, 'error' => 'Vous avez atteint votre limite de nouvelles conversations pour aujourd’hui.'];
            }

            $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $user->id, 'content' => $request->input('content'), 'client_uuid' => $uuid, 'moderation_status' => 'pending']);
            $conversation->update(['last_message_at' => $message->created_at]);
            $delivery = MessageDelivery::create(['message_id' => $message->id, 'next_attempt_at' => now()->addMinutes(2)]);

            return ['delivery' => $delivery->id, 'error' => null];
        }, attempts: 3);

        if ($result['error']) {
            return back()->with('error', $result['error']);
        }

        // The administrator's approval schedules the existing durable outbox.
        return redirect()->back()->with('success', 'Message soumis à validation. Il sera visible après accord de l’administration.');
    }

    /**
     * Mark a message as read.
     */
    public function markAsRead(Request $request, Message $message): RedirectResponse
    {
        $user = $request->user();

        // Check if user is the recipient
        if ($message->sender_id === $user->id) {
            abort(403, 'Vous ne pouvez pas marquer votre propre message comme lu.');
        }

        // Check if user is part of the conversation
        $conversation = $message->conversation;
        if ($conversation->user1_id !== $user->id && $conversation->user2_id !== $user->id) {
            abort(403, 'Vous n\'avez pas accès à cette conversation.');
        }

        $this->assertAccess($user, $conversation);
        abort_unless($message->moderation_status === 'approved', 403);

        $message->update(['read_at' => now()]);

        return redirect()->back();
    }

    public function markVisibleAsRead(Request $request, Conversation $conversation): JsonResponse
    {
        $this->assertAccess($request->user(), $conversation);
        $validated = $request->validate(['ids' => ['required', 'array', 'max:100'], 'ids.*' => ['integer', 'min:1']]);
        $conversation->messages()->whereIn('id', $validated['ids'])->where('moderation_status', 'approved')->where('sender_id', '!=', $request->user()->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    private function assertAccess(User $user, Conversation $conversation): void
    {
        abort_unless(in_array($user->id, [$conversation->user1_id, $conversation->user2_id], true), 403);
        $other = $conversation->user1_id === $user->id ? $conversation->user2 : $conversation->user1;
        abort_unless($other && $user->canInteractWith($other), 403, 'Cette conversation n’est plus disponible.');
    }
}
