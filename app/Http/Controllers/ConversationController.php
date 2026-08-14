<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Like;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    /**
     * Display all conversations for the current user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $conversations = Conversation::where(function ($q) use ($user) {
            $q->where('user1_id', $user->id)
                ->orWhere('user2_id', $user->id);
        })
            ->with(['user1.profile', 'user2.profile', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->withCount(['messages as unread_count' => function ($query) use ($user) {
                $query->where('sender_id', '!=', $user->id)
                    ->whereNull('read_at');
            }])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                $conversation->other_user = $conversation->user1_id === $user->id
                    ? $conversation->user2
                    : $conversation->user1;

                return $conversation;
            });

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Display a specific conversation.
     */
    public function show(Request $request, Conversation $conversation): Response
    {
        $user = $request->user();

        // Check if user is part of this conversation
        if ($conversation->user1_id !== $user->id && $conversation->user2_id !== $user->id) {
            abort(403, 'Vous n\'avez pas accès à cette conversation.');
        }

        // Get the other user
        $otherUser = $conversation->user1_id === $user->id
            ? $conversation->user2
            : $conversation->user1;

        abort_unless($user->canInteractWith($otherUser), 403, 'Cette conversation n’est plus disponible.');

        // Load messages with pagination
        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        // Reverse for chronological display while keeping pagination
        $messages->setCollection($messages->getCollection()->reverse()->values());

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Chat/Show', [
            'conversation' => $conversation,
            'otherUser' => $otherUser,
            'messages' => $messages,
            'canSendMessage' => $conversation->canSendMessage($user),
        ]);
    }

    /**
     * Create a new conversation with a user (if matched).
     */
    public function store(Request $request, int $userId)
    {
        $currentUser = $request->user();
        $otherUser = User::findOrFail($userId);

        if (! $currentUser->canInteractWith($otherUser)) {
            return redirect()->back()->with('error', 'Cette interaction n’est pas disponible.');
        }

        if ($otherUser->profile?->message_permission === 'verified_members' && ! $currentUser->is_verified) {
            return redirect()->back()->with('error', 'Cette personne accepte uniquement les messages de profils vérifiés.');
        }

        // Check if users are matched
        $isMatched = UserMatch::where(function ($query) use ($currentUser, $userId) {
            $query->where('user1_id', $currentUser->id)
                ->where('user2_id', $userId);
        })->orWhere(function ($query) use ($currentUser, $userId) {
            $query->where('user1_id', $userId)
                ->where('user2_id', $currentUser->id);
        })->exists();

        // Without a match, a like is enough to send a single introduction message.
        $hasLiked = Like::where('user_id', $currentUser->id)
            ->where('liked_user_id', $userId)
            ->exists();

        if (! $isMatched && ! $hasLiked) {
            return redirect()->back()->with('error', 'Vous devez d’abord liker cette personne pour lui écrire.');
        }

        // Check if conversation already exists
        $existingConversation = Conversation::where(function ($query) use ($currentUser, $userId) {
            $query->where('user1_id', $currentUser->id)
                ->where('user2_id', $userId);
        })->orWhere(function ($query) use ($currentUser, $userId) {
            $query->where('user1_id', $userId)
                ->where('user2_id', $currentUser->id);
        })->first();

        if ($existingConversation) {
            return redirect()->route('conversations.show', $existingConversation);
        }

        // Create new conversation
        $user1Id = min($currentUser->id, $userId);
        $user2Id = max($currentUser->id, $userId);

        $conversation = Conversation::create([
            'user1_id' => $user1Id,
            'user2_id' => $user2Id,
        ]);

        return redirect()->route('conversations.show', $conversation);
    }
}
