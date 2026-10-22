<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IntimateConsentController extends Controller
{
    public function update(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        abort_unless(in_array($user->id, [$conversation->user1_id, $conversation->user2_id], true), 403);
        $other = $conversation->user1_id === $user->id ? $conversation->user2 : $conversation->user1;
        abort_unless($user->canInteractWith($other), 403);
        $data = $request->validate(['accepted' => ['required', 'boolean']]);
        DB::table('intimate_media_consents')->updateOrInsert(
            ['conversation_id' => $conversation->id, 'user_id' => $user->id],
            ['accepted' => $data['accepted'], 'created_at' => now(), 'updated_at' => now()]
        );

        return back()->with('success', $data['accepted'] ? 'Réception de médias intimes autorisée pour cette conversation.' : 'Autorisation de médias intimes retirée.');
    }
}
