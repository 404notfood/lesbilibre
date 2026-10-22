<?php

namespace App\Services;

use App\Models\Like;
use App\Models\Message;
use App\Models\PremiumPlan;
use App\Models\User;

class EntitlementService
{
    /**
     * Resolve what a member is allowed to do right now.
     *
     * Free limits act as the floor; an active plan overrides only the keys it
     * explicitly grants. A lapsed subscription falls back to the free tier
     * without any extra bookkeeping.
     *
     * @return array<string, mixed>
     */
    public function for(User $user): array
    {
        $free = config('entitlements.free');

        $plan = $this->activePlan($user);

        if ($plan === null) {
            return $free;
        }

        return array_merge($free, array_filter(
            $plan->entitlements ?? [],
            fn ($value) => $value !== null
        ));
    }

    /**
     * The plan backing the member's current subscription, if any.
     */
    public function activePlan(User $user): ?PremiumPlan
    {
        if (! $user->isPremium()) {
            return null;
        }

        $subscription = $user->subscriptions()
            ->where('status', 'active')
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest('starts_at')
            ->first();

        if (! $subscription) {
            return null;
        }

        // Reconcile historical rows that used the Stripe price ID as `plan`.
        return PremiumPlan::where('slug', $subscription->plan)->first()
            ?? PremiumPlan::where('stripe_price_id', $subscription->stripe_price_id ?? $subscription->plan)->first();
    }

    /**
     * Whether a boolean entitlement is granted.
     */
    public function allows(User $user, string $key): bool
    {
        return (bool) ($this->for($user)[$key] ?? false);
    }

    /**
     * Remaining likes for today. Null means unlimited.
     */
    public function likesRemaining(User $user): ?int
    {
        $entitlements = $this->for($user);

        if (! empty($entitlements['unlimited_likes'])) {
            return null;
        }

        $allowance = (int) ($entitlements['likes_per_day'] ?? 0);

        if ($allowance <= 0) {
            return null;
        }

        $used = Like::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();

        return max(0, $allowance - $used);
    }

    /**
     * Remaining new conversations for today. Null means unlimited.
     *
     * Only counts conversations the member opened: replying to somebody who
     * already wrote to them is never rationed, otherwise a free account could
     * be left unable to answer.
     */
    public function firstMessagesRemaining(User $user): ?int
    {
        $allowance = (int) ($this->for($user)['first_messages_per_day'] ?? 0);

        if ($allowance <= 0) {
            return null;
        }

        $used = Message::where('sender_id', $user->id)
            ->whereDate('created_at', today())
            ->whereDoesntHave('conversation.messages', function ($query) use ($user) {
                $query->where('sender_id', '!=', $user->id);
            })
            ->distinct('conversation_id')
            ->count('conversation_id');

        return max(0, $allowance - $used);
    }
}
