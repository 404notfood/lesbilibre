<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return $user->canUseCommunity() && (int) $user->id === (int) $id;
});

// Canal privé pour les conversations
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);

    if (! $conversation) {
        return false;
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (! in_array($user->id, [$conversation->user1_id, $conversation->user2_id], true)) {
        return false;
    }
    $other = $conversation->user1_id === $user->id ? $conversation->user2 : $conversation->user1;

    return $other && $user->canInteractWith($other);
});
