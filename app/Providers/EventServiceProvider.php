<?php

namespace App\Providers;

use App\Events\LikeReceived;
use App\Events\MatchCreated;
use App\Events\MessageSent;
use App\Events\PhotoApproved;
use App\Events\ProfileUpdated;
use App\Events\UserSubscribed;
use App\Events\UserVerified;
use App\Listeners\CheckUserBadges;
use App\Listeners\SendLikePushNotification;
use App\Listeners\SendMatchPushNotification;
use App\Listeners\SendMessagePushNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register badge check listeners for various events
        Event::listen(LikeReceived::class, CheckUserBadges::class);
        Event::listen(LikeReceived::class, SendLikePushNotification::class);
        Event::listen(MatchCreated::class, CheckUserBadges::class);
        Event::listen(MatchCreated::class, SendMatchPushNotification::class);
        Event::listen(MessageSent::class, CheckUserBadges::class);
        Event::listen(MessageSent::class, SendMessagePushNotification::class);
        Event::listen(PhotoApproved::class, CheckUserBadges::class);
        Event::listen(ProfileUpdated::class, CheckUserBadges::class);
        Event::listen(UserVerified::class, CheckUserBadges::class);
        Event::listen(UserSubscribed::class, CheckUserBadges::class);
    }
}
