<?php

namespace App\Http\Controllers;

use App\Models\BlockedUser;
use App\Models\GemTransaction;
use App\Models\Like;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Photo;
use App\Models\ProfileView;
use App\Models\Referral;
use App\Models\Report;
use App\Models\UserMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DataPrivacyController extends Controller
{
    /**
     * Display the privacy settings page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/privacy', [
            'consent' => [
                'data_processing_consent' => (bool) $user->data_processing_consent,
                'data_processing_consented_at' => $user->data_processing_consented_at?->toISOString(),
                'marketing_consent' => (bool) $user->marketing_consent,
            ],
        ]);
    }

    /**
     * Export all user data as a JSON download (GDPR Article 20 - Right to data portability).
     */
    public function export(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [
            'exported_at' => now()->toISOString(),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'pseudo' => $user->pseudo,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'is_verified' => $user->is_verified,
                'is_premium' => $user->is_premium,
                'premium_expires_at' => $user->premium_expires_at?->toISOString(),
                'gems' => $user->gems,
                'last_login_at' => $user->last_login_at?->toISOString(),
                'last_activity_at' => $user->last_activity_at?->toISOString(),
                'data_processing_consent' => $user->data_processing_consent,
                'data_processing_consented_at' => $user->data_processing_consented_at?->toISOString(),
                'marketing_consent' => $user->marketing_consent,
                'referral_code' => $user->referral_code,
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
            ],
            'profile' => $this->exportProfile($user),
            'photos' => $this->exportPhotos($user),
            'messages' => $this->exportMessages($user),
            'likes_given' => $this->exportLikesGiven($user),
            'likes_received' => $this->exportLikesReceived($user),
            'matches' => $this->exportMatches($user),
            'badges' => $this->exportBadges($user),
            'gem_transactions' => $this->exportGemTransactions($user),
            'notifications' => $this->exportNotifications($user),
            'blocked_users' => $this->exportBlockedUsers($user),
            'reports_made' => $this->exportReportsMade($user),
            'profile_views_made' => $this->exportProfileViewsMade($user),
            'referrals' => $this->exportReferrals($user),
        ];

        return response()->json($data, 200, [
            'Content-Disposition' => 'attachment; filename="mes-donnees-'.now()->format('Y-m-d').'.json"',
        ]);
    }

    /**
     * Delete the user's account and anonymize their data (GDPR Article 17 - Right to erasure).
     */
    public function deleteAccount(Request $request): RedirectResponse
    {
        $request->validate([
            'confirmation' => ['required', 'string', 'in:SUPPRIMER'],
        ], [
            'confirmation.required' => 'Veuillez saisir le mot de confirmation.',
            'confirmation.in' => 'Veuillez saisir exactement "SUPPRIMER" pour confirmer.',
        ]);

        $user = $request->user();

        DB::transaction(function () use ($user) {
            // 1. Delete photos from storage
            $photos = $user->photos()->get();
            foreach ($photos as $photo) {
                if ($photo->path && Storage::disk('public')->exists($photo->path)) {
                    Storage::disk('public')->delete($photo->path);
                }
                if ($photo->thumbnail_path && Storage::disk('public')->exists($photo->thumbnail_path)) {
                    Storage::disk('public')->delete($photo->thumbnail_path);
                }
            }
            $user->photos()->delete();

            // 2. Delete verification photos from storage
            $verificationPhotos = $user->verificationPhotos()->get();
            foreach ($verificationPhotos as $vPhoto) {
                if ($vPhoto->path && Storage::disk('local')->exists($vPhoto->path)) {
                    Storage::disk('local')->delete($vPhoto->path);
                }
            }
            $user->verificationPhotos()->delete();

            // 3. Anonymize messages (replace content, keep structure for other users' conversation history)
            Message::where('sender_id', $user->id)->update([
                'content' => '[message supprimé]',
            ]);

            // 4. Delete likes (given and received)
            Like::where('user_id', $user->id)->orWhere('liked_user_id', $user->id)->delete();

            // 5. Delete matches
            UserMatch::where('user1_id', $user->id)->orWhere('user2_id', $user->id)->delete();

            // 6. Delete blocked users (both directions)
            BlockedUser::where('blocker_id', $user->id)->orWhere('blocked_id', $user->id)->delete();

            // 7. Delete notifications
            $user->appNotifications()->delete();

            // 8. Delete gem transactions
            $user->gemTransactions()->delete();

            // 9. Delete reports made by the user
            Report::where('reporter_id', $user->id)->delete();

            // 10. Delete profile and related data
            if ($user->profile) {
                $user->profile->naughtyInterests()->detach();
                $user->profile->delete();
            }

            // 11. Detach badges
            $user->badges()->detach();

            // 12. Delete subscriptions
            $user->subscriptions()->delete();

            // Referral relationships are no longer needed after erasure.
            Referral::where('referrer_id', $user->id)
                ->orWhere('referred_user_id', $user->id)
                ->delete();

            // 13. Soft-delete user with anonymized data
            $user->update([
                'email' => "deleted_{$user->id}@deleted.local",
                'name' => 'Utilisateur supprimé',
                'pseudo' => "deleted_{$user->id}",
                'password' => '',
                'remember_token' => null,
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
                'data_processing_consent' => false,
                'data_processing_consented_at' => null,
                'marketing_consent' => false,
            ]);

            $user->delete();
        });

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Votre compte a été supprimé avec succès.');
    }

    /**
     * Return the current consent status.
     */
    public function consentStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data_processing_consent' => (bool) $user->data_processing_consent,
            'data_processing_consented_at' => $user->data_processing_consented_at?->toISOString(),
            'marketing_consent' => (bool) $user->marketing_consent,
        ]);
    }

    /**
     * Update consent for data processing (GDPR Article 7 - Conditions for consent).
     */
    public function updateConsent(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'data_processing_consent' => ['required', 'boolean'],
            'marketing_consent' => ['required', 'boolean'],
        ], [
            'data_processing_consent.required' => 'Le consentement au traitement des données est requis.',
            'marketing_consent.required' => 'Le consentement marketing est requis.',
        ]);

        $user = $request->user();

        $updateData = [
            'data_processing_consent' => $validated['data_processing_consent'],
            'marketing_consent' => $validated['marketing_consent'],
        ];

        // Record timestamp when data processing consent is given
        if ($validated['data_processing_consent'] && ! $user->data_processing_consent) {
            $updateData['data_processing_consented_at'] = now();
        } elseif (! $validated['data_processing_consent']) {
            $updateData['data_processing_consented_at'] = null;
        }

        $user->update($updateData);

        return back()->with('success', 'Vos préférences de consentement ont été mises à jour.');
    }

    /**
     * Export user profile data.
     *
     * @return array<string, mixed>|null
     */
    private function exportProfile(mixed $user): ?array
    {
        $profile = $user->profile;

        if (! $profile) {
            return null;
        }

        return [
            'bio' => $profile->bio,
            'date_of_birth' => $profile->date_of_birth?->toDateString(),
            'city' => $profile->city,
            'postal_code' => $profile->postal_code,
            'country' => $profile->country,
            'sexual_orientation' => $profile->sexual_orientation,
            'interested_in' => $profile->interested_in,
            'looking_for' => $profile->looking_for,
            'relationship_status' => $profile->relationship_status,
            'height' => $profile->height,
            'body_type' => $profile->body_type,
            'hair_color' => $profile->hair_color,
            'eye_color' => $profile->eye_color,
            'ethnicity' => $profile->ethnicity,
            'education' => $profile->education,
            'occupation' => $profile->occupation,
            'has_children' => $profile->has_children,
            'wants_children' => $profile->wants_children,
            'smokes' => $profile->smokes,
            'drinks' => $profile->drinks,
            'interests' => $profile->interests,
            'languages' => $profile->languages,
            'is_naughty_mode' => $profile->is_naughty_mode,
            'show_age' => $profile->show_age,
            'show_location' => $profile->show_location,
            'search_radius' => $profile->search_radius,
            'min_age_preference' => $profile->min_age_preference,
            'max_age_preference' => $profile->max_age_preference,
        ];
    }

    /**
     * Export user photos metadata (not the files themselves).
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportPhotos(mixed $user): array
    {
        return $user->photos()->get()->map(fn (Photo $photo) => [
            'id' => $photo->id,
            'is_primary' => $photo->is_primary,
            'is_approved' => $photo->is_approved,
            'is_naughty' => $photo->is_naughty,
            'order' => $photo->order,
            'created_at' => $photo->created_at->toISOString(),
        ])->toArray();
    }

    /**
     * Export user messages.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportMessages(mixed $user): array
    {
        return Message::where('sender_id', $user->id)
            ->select(['id', 'conversation_id', 'content', 'read_at', 'created_at'])
            ->orderBy('created_at')
            ->get()
            ->map(fn (Message $message) => [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'content' => $message->content,
                'read_at' => $message->read_at?->toISOString(),
                'sent_at' => $message->created_at->toISOString(),
            ])->toArray();
    }

    /**
     * Export likes given by the user.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportLikesGiven(mixed $user): array
    {
        return $user->likesGiven()->get()->map(fn (Like $like) => [
            'id' => $like->id,
            'liked_user_id' => $like->liked_user_id,
            'created_at' => $like->created_at->toISOString(),
        ])->toArray();
    }

    /**
     * Export likes received by the user.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportLikesReceived(mixed $user): array
    {
        return $user->likesReceived()->get()->map(fn (Like $like) => [
            'id' => $like->id,
            'user_id' => $like->user_id,
            'created_at' => $like->created_at->toISOString(),
        ])->toArray();
    }

    /**
     * Export user matches.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportMatches(mixed $user): array
    {
        return UserMatch::where('user1_id', $user->id)
            ->orWhere('user2_id', $user->id)
            ->get()
            ->map(fn (UserMatch $match) => [
                'id' => $match->id,
                'matched_with_user_id' => $match->user1_id === $user->id
                    ? $match->user2_id
                    : $match->user1_id,
                'matched_at' => $match->matched_at?->toISOString(),
                'created_at' => $match->created_at->toISOString(),
            ])->toArray();
    }

    /**
     * Export user badges.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportBadges(mixed $user): array
    {
        return $user->badges()->get()->map(fn ($badge) => [
            'id' => $badge->id,
            'name' => $badge->name,
            'slug' => $badge->slug,
            'points' => $badge->points,
            'progress' => $badge->pivot->progress,
            'awarded_at' => $badge->pivot->awarded_at,
        ])->toArray();
    }

    /**
     * Export gem transactions.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportGemTransactions(mixed $user): array
    {
        return $user->gemTransactions()
            ->orderBy('created_at')
            ->get()
            ->map(fn (GemTransaction $tx) => [
                'id' => $tx->id,
                'type' => $tx->type,
                'amount' => $tx->amount,
                'balance_after' => $tx->balance_after,
                'description' => $tx->description,
                'created_at' => $tx->created_at->toISOString(),
            ])->toArray();
    }

    /**
     * Export user notifications.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportNotifications(mixed $user): array
    {
        return $user->appNotifications()
            ->orderBy('created_at')
            ->get()
            ->map(fn (Notification $notif) => [
                'id' => $notif->id,
                'type' => $notif->type,
                'title' => $notif->title,
                'message' => $notif->message,
                'is_read' => $notif->is_read,
                'read_at' => $notif->read_at?->toISOString(),
                'created_at' => $notif->created_at->toISOString(),
            ])->toArray();
    }

    /**
     * Export blocked users.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportBlockedUsers(mixed $user): array
    {
        return $user->blockedUsers()->get()->map(fn (BlockedUser $block) => [
            'id' => $block->id,
            'blocked_user_id' => $block->blocked_id,
            'reason' => $block->reason,
            'created_at' => $block->created_at->toISOString(),
        ])->toArray();
    }

    /**
     * Export reports made by the user.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportReportsMade(mixed $user): array
    {
        return $user->reportsMade()->get()->map(fn (Report $report) => [
            'id' => $report->id,
            'reported_user_id' => $report->reported_user_id,
            'reason' => $report->reason,
            'description' => $report->description,
            'status' => $report->status,
            'created_at' => $report->created_at->toISOString(),
        ])->toArray();
    }

    /**
     * Export profile-view records generated by this user.
     * Views received are deliberately not exported because they identify other
     * users and are not required for portability of the requester’s data.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportProfileViewsMade(mixed $user): array
    {
        return ProfileView::where('viewer_id', $user->id)
            ->orderBy('viewed_on')
            ->get()
            ->map(fn (ProfileView $view) => [
                'profile_user_id' => $view->profile_user_id,
                'viewed_on' => $view->viewed_on->toDateString(),
            ])->toArray();
    }

    /**
     * Export referral relationships involving the requester.
     *
     * @return array<int, array<string, mixed>>
     */
    private function exportReferrals(mixed $user): array
    {
        return Referral::query()
            ->where('referrer_id', $user->id)
            ->orWhere('referred_user_id', $user->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (Referral $referral) => [
                'role' => $referral->referrer_id === $user->id ? 'referrer' : 'referred',
                'status' => $referral->status,
                'referrer_reward' => $referral->referrer_reward,
                'referred_reward' => $referral->referred_reward,
                'created_at' => $referral->created_at->toISOString(),
                'rewarded_at' => $referral->rewarded_at?->toISOString(),
            ])->toArray();
    }
}
