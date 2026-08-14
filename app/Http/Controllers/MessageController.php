<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Http\Requests\SendMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\AntiAbuseService;
use App\Services\EntitlementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Send a message in a conversation.
     */
    public function store(SendMessageRequest $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();
        $otherUser = $conversation->user1_id === $user->id ? $conversation->user2 : $conversation->user1;

        // Check if user is part of this conversation
        if ($conversation->user1_id !== $user->id && $conversation->user2_id !== $user->id) {
            abort(403, 'Vous n\'avez pas accès à cette conversation.');
        }

        abort_unless($user->canInteractWith($otherUser), 403, 'Cette conversation n’est plus disponible.');
        abort_if($otherUser->profile?->message_permission === 'verified_members' && ! $user->is_verified, 403, 'Cette personne accepte uniquement les messages de profils vérifiés.');

        if (! $conversation->canSendMessage($user)) {
            return redirect()->back()->with('error', 'Attendez sa réponse avant d’envoyer un autre message.');
        }

        app(AntiAbuseService::class)->assertMessageAllowed($user, $request->string('content')->toString());

        // Quota de premiers messages : ne s'applique qu'à l'ouverture d'une
        // conversation. Répondre à quelqu'un n'est jamais rationné, sinon un
        // compte gratuit pourrait se retrouver incapable de répondre.
        $isOpeningConversation = ! $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->exists();

        if ($isOpeningConversation) {
            $remaining = app(EntitlementService::class)->firstMessagesRemaining($user);

            if ($remaining !== null && $remaining <= 0) {
                return redirect()->back()->with(
                    'error',
                    'Vous avez atteint votre limite de nouvelles conversations pour aujourd’hui. Passez Premium pour en ouvrir davantage.'
                );
            }
        }

        // Create the message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $request->content,
        ]);

        // Load sender relationship for broadcasting
        $message->load('sender');

        // Broadcast the message to real-time listeners
        broadcast(new MessageSent($message))->toOthers();

        // Update conversation last_message_at
        $conversation->update([
            'last_message_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Message envoyé.');
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

        $message->update(['read_at' => now()]);

        return redirect()->back();
    }
}
