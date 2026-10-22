<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageDelivery;
use App\Models\User;
use App\Services\ModerationAuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MessageModerationController extends Controller
{
    public function index()
    {
        $messages = Message::where('moderation_status', 'pending')->oldest()->paginate(30);
        $messages->through(function ($message) {
            $conversation = Conversation::find($message->conversation_id);
            $sender = User::withTrashed()->find($message->sender_id);
            $recipientId = $conversation?->user1_id === $message->sender_id ? $conversation?->user2_id : $conversation?->user1_id;
            $recipient = User::withTrashed()->find($recipientId);

            return ['id' => $message->id, 'content' => $message->publicContent(), 'sender' => $sender?->pseudo ?? 'Compte fermé', 'recipient' => $recipient?->pseudo ?? 'Compte fermé', 'conflict' => $sender && $recipient && $sender->hasOpenConflictWith($recipient), 'created_at' => $message->created_at->toISOString()];
        });

        return Inertia::render('Admin/Messages/Index', ['messages' => $messages]);
    }

    public function approve(Request $request, Message $message)
    {
        $request->validate(['review_confirmed' => ['required', 'accepted']]);
        DB::transaction(function () use ($request, &$message) {
            $message = Message::lockForUpdate()->findOrFail($message->id);
            abort_unless($message->moderation_status === 'pending', 409);
            $conversation = Conversation::findOrFail($message->conversation_id);
            $sender = User::find($message->sender_id);
            $other = User::find($conversation->user1_id === $message->sender_id ? $conversation->user2_id : $conversation->user1_id);
            abort_unless($sender && $other && $sender->canInteractWith($other), 409, 'Le conflit ou la restriction doit être résolu avant validation.');
            $message->update(['moderation_status' => 'approved', 'moderated_by' => $request->user()->id, 'reviewed_at' => now(), 'moderation_reason' => null]);
            MessageDelivery::firstOrCreate(['message_id' => $message->id]);
            app(ModerationAuditService::class)->record($request->user(), $message, 'message_approved', $sender);
        });
        MessageDelivery::enqueueApproved($message);

        return back()->with('success', 'Message validé.');
    }

    public function reject(Request $request, Message $message)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:3', 'max:1000']]);
        DB::transaction(function () use ($request, $message, $data) {
            $message = Message::lockForUpdate()->findOrFail($message->id);
            abort_unless($message->moderation_status === 'pending', 409);
            $message->update(['moderation_status' => 'rejected', 'moderated_by' => $request->user()->id, 'reviewed_at' => now(), 'moderation_reason' => $data['reason']]);
            app(ModerationAuditService::class)->record($request->user(), $message, 'message_rejected', User::withTrashed()->find($message->sender_id), 'message_rejected', $data['reason']);
        });

        return back()->with('success', 'Message refusé.');
    }
}
