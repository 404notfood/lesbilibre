<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\Like;
use App\Models\Message;
use App\Models\User;
use App\Models\UserMatch;
use App\Services\EntitlementService;
use App\Services\VideoProcessingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            ->with(['user1.avatarPhoto', 'user1.profile', 'user2.avatarPhoto', 'user2.profile', 'messages' => function ($query) use ($user) {
                $query->where(fn ($visible) => $visible->where('sender_id', $user->id)->orWhere('moderation_status', 'approved'))->latest()->limit(1);
            }])
            ->withCount(['messages as unread_count' => function ($query) use ($user) {
                $query->where('sender_id', '!=', $user->id)
                    ->where('moderation_status', 'approved')
                    ->whereNull('read_at');
            }])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->filter(function (Conversation $conversation) use ($user) {
                $other = $conversation->user1_id === $user->id ? $conversation->user2 : $conversation->user1;

                return ! $other || $user->canInteractWith($other);
            })
            ->map(function (Conversation $conversation) use ($user) {
                $otherUser = $conversation->user1_id === $user->id
                    ? $conversation->user2
                    : $conversation->user1;

                $lastMessage = $conversation->messages->first();

                return [
                    'id' => $conversation->id,
                    'other_user' => $this->conversationUser($otherUser, $conversation->user1_id === $user->id ? $conversation->user2_id : $conversation->user1_id),
                    'last_message' => $lastMessage ? [
                        'id' => $lastMessage->id,
                        'content' => $lastMessage->publicContent(),
                        'moderation_status' => $lastMessage->moderation_status,
                        'created_at' => $lastMessage->created_at->toISOString(),
                    ] : null,
                    'unread_count' => $conversation->unread_count,
                ];
            })->values();

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

        $archived = $otherUser === null;
        abort_unless($archived || $user->canInteractWith($otherUser), 403, 'Cette conversation n’est plus disponible.');

        $otherUser?->load('avatarPhoto');
        $messageCursor = (int) DB::table('message_changes')->where('conversation_id', $conversation->id)->max('id');

        // Load messages with pagination
        $messages = $conversation->messages()
            ->where(fn ($query) => $query->where('sender_id', $user->id)->orWhere('moderation_status', 'approved'))
            ->orderBy('id', 'desc')
            ->paginate(50);

        // Reverse for chronological display while keeping pagination
        $messages->setCollection($messages->getCollection()->reverse()->map(fn (Message $message) => $this->messageData($message))->values());

        // Contenus éphémères du fil. On expose l'état, jamais le fichier :
        // celui-ci ne s'obtient qu'en ouvrant explicitement le média.
        $ephemeral = $archived ? collect() : $this->ephemeralData($conversation, $user);

        return Inertia::render('Chat/Show', [
            'conversation' => ['id' => $conversation->id],
            'otherUser' => $this->conversationUser($otherUser, $conversation->user1_id === $user->id ? $conversation->user2_id : $conversation->user1_id),
            'messages' => $messages,
            'messageCursor' => $messageCursor,
            'archived' => $archived,
            'intimateConsent' => ! $archived && $conversation->acceptsIntimateMedia($user->id),
            'recipientIntimateConsent' => ! $archived && $conversation->acceptsIntimateMedia($otherUser->id),
            'canSendMessage' => ! $archived && $conversation->canSendMessage($user),
            'ephemeral' => $ephemeral,
            'ephemeralSettings' => [
                'replay_cost' => (int) config('media.ephemeral.replay_cost_gems'),
                'free_replays' => app(EntitlementService::class)->allows($user, 'free_replays'),
                'video_enabled' => app(VideoProcessingService::class)->isAvailable(),
                'max_video_seconds' => (int) config('media.ephemeral.max_video_seconds'),
            ],
        ]);
    }

    /** Cursor-based recovery and older history; no read acknowledgement is implicit. */
    public function sync(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        abort_unless(in_array($user->id, [$conversation->user1_id, $conversation->user2_id], true), 403);
        $other = $conversation->user1_id === $user->id ? $conversation->user2 : $conversation->user1;
        $archived = $other === null;
        abort_unless($archived || $user->canInteractWith($other), 403, 'Cette conversation n’est plus disponible.');
        $data = $request->validate([
            'after_id' => ['nullable', 'integer', 'min:0', \Illuminate\Validation\Rule::prohibitedIf($request->filled('before_id'))],
            'after_change_id' => ['nullable', 'integer', 'min:0', \Illuminate\Validation\Rule::prohibitedIf($request->filled('before_id'))],
            'before_id' => ['nullable', 'integer', 'min:1', \Illuminate\Validation\Rule::prohibitedIf($request->filled('after_id') || $request->filled('after_change_id'))],
        ]);
        $older = isset($data['before_id']);
        $query = $conversation->messages()->where(fn ($visible) => $visible->where('sender_id', $user->id)->orWhere('moderation_status', 'approved'));
        $cursor = (int) ($data['after_change_id'] ?? 0);
        if (isset($data['after_change_id'])) {
            $changes = DB::table('message_changes')->where('conversation_id', $conversation->id)->where('id', '>', $cursor)->orderBy('id')->limit(101)->get();
            $hasMore = $changes->count() > 100;
            $changes = $changes->take(100);
            $cursor = (int) ($changes->max('id') ?? $cursor);
            $rows = $query->whereIn('id', $changes->pluck('message_id'))->orderBy('id')->get();
        } else {
            if ($older) {
                $query->where('id', '<', $data['before_id'])->orderByDesc('id');
            } else {
                $query->where('id', '>', $data['after_id'] ?? 0)->orderBy('id');
            }
            $rows = $query->limit(101)->get();
            $hasMore = $rows->count() > 100;
            $rows = $rows->take(100);
            if ($older) {
                $rows = $rows->reverse();
            }
        }

        return response()->json([
            'messages' => $rows->map(fn (Message $message) => $this->messageData($message))->values(),
            'has_more' => $hasMore,
            'cursor' => $cursor,
            'canSendMessage' => ! $archived && $conversation->canSendMessage($user),
            'intimateConsent' => ! $archived && $conversation->acceptsIntimateMedia($user->id),
            'recipientIntimateConsent' => ! $archived && $conversation->acceptsIntimateMedia($other->id),
            'ephemeral' => $archived ? [] : $this->ephemeralData($conversation, $user),
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

        $conversation = Conversation::firstOrCreate([
            'user1_id' => $user1Id,
            'user2_id' => $user2Id,
        ]);

        return redirect()->route('conversations.show', $conversation);
    }

    /**
     * Contrat minimal partagé par la liste et l'en-tête de conversation.
     *
     * @return array{id: int, name: string, avatar_url: string|null}
     */
    private function conversationUser(?User $user, ?int $fallbackId = null): array
    {
        if (! $user) {
            return ['id' => $fallbackId, 'name' => 'Compte supprimé', 'avatar_url' => null];
        }

        return [
            'id' => $user->id,
            'name' => $user->pseudo ?: 'Membre',
            'avatar_url' => $user->avatarPhoto?->viewUrl(thumbnail: true),
        ];
    }

    private function messageData(Message $message): array
    {
        return ['id' => $message->id, 'content' => $message->publicContent(), 'sender_id' => $message->sender_id, 'created_at' => $message->created_at->toISOString(), 'read_at' => $message->read_at?->toISOString(), 'moderation_status' => $message->moderation_status, 'moderation_reason' => $message->moderation_status === 'rejected' && $message->moderation_reason ? Message::maskEmails($message->moderation_reason) : null];
    }

    private function ephemeralData(Conversation $conversation, User $user): \Illuminate\Support\Collection
    {
        return $conversation->ephemeralMedia()->stored()
            ->where(fn ($query) => $query->where('sender_id', $user->id)->orWhere('moderation_status', 'approved'))
            ->orderBy('created_at')->get()
            ->map(fn (EphemeralMedia $medium) => [
                'id' => $medium->id,
                'type' => $medium->type,
                'is_naughty' => $medium->is_naughty,
                'is_mine' => $medium->sender_id === $user->id,
                'processing' => $medium->processing_status === 'pending',
                'failed' => $medium->processing_status === 'failed',
                'opened' => ! $medium->isUnopened(),
                'replayed' => $medium->replayed_at !== null,
                'replay_open' => $medium->replayWindowIsOpen(),
                'can_open' => $medium->canBeOpenedBy($user),
                'moderation_status' => $medium->moderation_status,
                'moderation_reason' => $medium->sender_id === $user->id && $medium->moderation_reason ? Message::maskEmails($medium->moderation_reason) : null,
                'created_at' => $medium->created_at->toISOString(),
            ]);
    }
}
