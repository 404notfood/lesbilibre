<?php

namespace App\Services;

use App\Models\AccountErasure;
use App\Models\BlockedUser;
use App\Models\EphemeralMedia;
use App\Models\Like;
use App\Models\Message;
use App\Models\Notification;
use App\Models\ProfileView;
use App\Models\Referral;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Throwable;

class AccountErasureService
{
    public function __construct(private MediaDeletionService $media, private StripePaymentService $billing) {}

    public function requestDeletion(User $subject): void
    {
        DB::transaction(function () use ($subject) {
            $subject = User::withTrashed()->lockForUpdate()->findOrFail($subject->id);
            $request = AccountErasure::firstOrCreate(['user_id' => $subject->id], ['requested_by' => $subject->id, 'status' => 'awaiting_admin', 'billing_pending' => true]);
            if ($request->wasRecentlyCreated) {
                foreach (User::where('is_admin', true)->where('id', '!=', $subject->id)->get() as $admin) {
                    Notification::createNotification($admin->id, 'account_deletion', 'Un compte a été fermé', $subject->pseudo.' a demandé la suppression de son compte.', ['subject_id' => $subject->id, 'pseudo' => $subject->pseudo, 'url' => '/admin/account-deletions', 'account_erasure_id' => $request->id]);
                }
            }
            $subject->forceFill(['safety_restricted_at' => now(), 'remember_token' => null])->save();
            if (Schema::hasTable('sessions')) {
                DB::table('sessions')->where('user_id', $subject->id)->delete();
            }
            DB::table('push_subscriptions')->where('user_id', $subject->id)->delete();
            if (! $subject->trashed()) {
                $subject->delete();
            }
        });
        $this->retryClosureBilling($subject);
    }

    public function retryClosureBilling(User $subject): void
    {
        $request = AccountErasure::where('user_id', $subject->id)->firstOrFail();
        if (! $request->billing_pending) {
            return;
        }
        try {
            $this->cancelBilling($subject);
            $request->update(['billing_pending' => false, 'failure_stage' => null]);
        } catch (Throwable) {
            $request->update(['billing_pending' => true, 'failure_stage' => 'billing', 'last_attempt_at' => now()]);
            report(new \RuntimeException('Closed account billing requires retry: '.$request->id));
        }
    }

    private function cancelBilling(User $subject): void
    {
        foreach ($subject->subscriptions()->whereNotNull('stripe_subscription_id')->whereNotIn('status', ['canceled', 'incomplete_expired'])->get() as $subscription) {
            $this->billing->cancelSubscription($subscription->stripe_subscription_id);
            $subscription->update(['status' => 'canceled']);
        }
    }

    public function erase(User $subject, ?User $requestedBy = null): void
    {
        abort_unless($requestedBy?->is_admin && $requestedBy->id !== $subject->id, 403);
        $lock = Cache::lock('account-erasure:'.$subject->id, 120);
        if (! $lock->get()) {
            throw ValidationException::withMessages(['erasure' => 'Une suppression est déjà en cours. Réessayez dans un instant.']);
        }
        try {
            $this->perform($subject, $requestedBy);
        } finally {
            $lock->release();
        }
    }

    private function perform(User $subject, ?User $requestedBy): void
    {
        $request = AccountErasure::firstOrCreate(['user_id' => $subject->id], ['requested_by' => $requestedBy?->id]);
        if ($request->status === 'completed') {
            return;
        }
        if (! $request->approved_at) {
            $request->update(['approved_by' => $requestedBy->id, 'approved_at' => now()]);
        }
        $request->update(['status' => 'processing', 'attempts' => $request->attempts + 1, 'last_attempt_at' => now(), 'failure_stage' => null]);
        // Restrict interactions immediately, keeping account controls available
        // if a remote cancellation or storage operation needs another attempt.
        $subject->forceFill(['safety_restricted_at' => now(), 'remember_token' => null])->save();
        $stage = 'billing';
        try {
            $this->cancelBilling($subject);
            $request->update(['billing_pending' => false]);

            $stage = 'storage';
            foreach ($subject->photos()->get() as $photo) {
                $this->media->deletePhoto($photo);
            }
            foreach ($subject->verificationPhotos()->get() as $photo) {
                $this->media->deletePath('local', $photo->path);
            }
            // A flagged proof has a separate moderation lifecycle. Unflagged
            // files are erased even when their sender/recipient is soft deleted.
            $ephemeralIds = EphemeralMedia::where(fn ($query) => $query->where('sender_id', $subject->id)->orWhere('recipient_id', $subject->id))
                ->whereNull('purged_at')->pluck('id');
            foreach ($ephemeralIds as $mediumId) {
                DB::transaction(function () use ($mediumId) {
                    $medium = EphemeralMedia::lockForUpdate()->find($mediumId);
                    if (! $medium || $medium->is_flagged || $medium->purged_at || \App\Models\Report::where('ephemeral_media_id', $mediumId)->whereIn('status', EphemeralReportService::OPEN_STATUSES)->exists()) {
                        return;
                    }
                    $this->media->deleteEphemeral($medium);
                    // Reporting uses the same row lock and refuses an already
                    // purged medium, so a new report cannot race this deletion.
                    $medium->update(['purged_at' => now()]);
                });
            }
            $this->media->deleteRenderCache();

            $stage = 'data';
            DB::transaction(function () use ($subject, $requestedBy, $request) {
                $subject->photos()->delete();
                $subject->verificationPhotos()->delete();
                Message::where('sender_id', $subject->id)->update(['content' => '[message supprimé]']);
                Like::where('user_id', $subject->id)->orWhere('liked_user_id', $subject->id)->delete();
                UserMatch::where('user1_id', $subject->id)->orWhere('user2_id', $subject->id)->delete();
                BlockedUser::where('blocker_id', $subject->id)->orWhere('blocked_id', $subject->id)->delete();
                $subject->appNotifications()->delete();
                Notification::where('type', 'account_deletion')->where('data->account_erasure_id', $request->id)->update([
                    'message' => 'Un compte fermé a été effacé.',
                    'data' => json_encode(['subject_id' => $subject->id, 'account_erasure_id' => $request->id, 'url' => '/admin/account-deletions']),
                ]);
                $subject->gemTransactions()->delete();
                // Keep report rows and flagged proofs, with an anonymized user,
                // so erasure cannot destroy an unresolved moderation case.
                if ($profile = $subject->profile()->first()) {
                    $profile->naughtyInterests()->detach();
                    $profile->delete();
                }
                $subject->badges()->detach();
                $subject->subscriptions()->delete();
                DB::table('push_subscriptions')->where('user_id', $subject->id)->delete();
                Referral::where('referrer_id', $subject->id)->orWhere('referred_user_id', $subject->id)->delete();
                ProfileView::where('viewer_id', $subject->id)->orWhere('profile_user_id', $subject->id)->delete();
                if (Schema::hasTable('profile_visits')) {
                    DB::table('profile_visits')->where('visitor_id', $subject->id)->orWhere('visited_user_id', $subject->id)->delete();
                }
                if (Schema::hasTable('sessions')) {
                    DB::table('sessions')->where('user_id', $subject->id)->delete();
                }
                DB::table('intimate_media_consents')->where('user_id', $subject->id)->delete();
                $subject->forceFill([
                    'email' => "deleted_{$subject->id}@deleted.local", 'name' => 'Utilisateur supprimé', 'pseudo' => "deleted_{$subject->id}",
                    'password' => '', 'remember_token' => null, 'two_factor_secret' => null, 'two_factor_recovery_codes' => null,
                    'two_factor_confirmed_at' => null, 'data_processing_consent' => false, 'data_processing_consented_at' => null,
                    'marketing_consent' => false, 'community_charter_version' => null, 'community_charter_accepted_at' => null,
                    'is_premium' => false, 'premium_expires_at' => null, 'gems' => 0,
                ])->save();
                if ($requestedBy?->is_admin && $requestedBy->id !== $subject->id) {
                    app(ModerationAuditService::class)->record($requestedBy, $subject, 'account_erased', $subject, 'account_erasure');
                }
                if (! $subject->trashed()) {
                    $subject->delete();
                }
                $request->update(['status' => 'completed', 'failure_stage' => null, 'completed_at' => now()]);
            });
        } catch (Throwable $exception) {
            $request->update(['status' => 'failed', 'failure_stage' => $stage]);
            report(new \RuntimeException('Account erasure requires retry: '.$request->id.' ('.$stage.')'));
            throw ValidationException::withMessages(['erasure' => 'La suppression reste en attente : une opération n’a pas abouti. Les interactions sont suspendues et la demande pourra être reprise.']);
        }
    }
}
