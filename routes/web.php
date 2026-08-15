<?php

use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    // Vraies stats globales — utilisées comme social proof sur la landing
    $stats = [
        'total_users' => User::where('is_verified', true)->where('is_banned', false)->count(),
        'active_today' => User::where('last_login_at', '>=', now()->startOfDay())->count(),
        'total_matches' => UserMatch::count(),
    ];

    return Inertia::render('home', [
        'canRegister' => Features::enabled(Features::registration()),
        'stats' => $stats,
    ]);
})->name('home');

// Static pages
Route::get('/terms', [\App\Http\Controllers\StaticPageController::class, 'terms'])->name('terms');
Route::get('/privacy', [\App\Http\Controllers\StaticPageController::class, 'privacy'])->name('privacy');
Route::get('/faq', [\App\Http\Controllers\StaticPageController::class, 'faq'])->name('faq');
Route::get('/about', [\App\Http\Controllers\StaticPageController::class, 'about'])->name('about');
Route::get('/contact', [\App\Http\Controllers\StaticPageController::class, 'contact'])->name('contact');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Profile routes
    Route::get('profile', [\App\Http\Controllers\ProfileController::class, 'show'])->name('profile.show');
    Route::get('profile/edit', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::get('profile/{userId}', [\App\Http\Controllers\ProfileController::class, 'view'])->name('profile.view');

    // Verification routes
    Route::get('verification', [\App\Http\Controllers\VerificationController::class, 'create'])->name('verification.create');
    Route::post('verification', [\App\Http\Controllers\VerificationController::class, 'store'])->name('verification.store');

    // Admin verification routes
    Route::middleware('can:viewAny,App\Models\VerificationPhoto')->group(function () {
        Route::get('admin/verifications', [\App\Http\Controllers\VerificationController::class, 'index'])->name('admin.verifications.index');
        Route::get('admin/verifications/{verification}/image', [\App\Http\Controllers\VerificationController::class, 'image'])->name('admin.verifications.image');
        Route::post('admin/verifications/{verification}/approve', [\App\Http\Controllers\VerificationController::class, 'approve'])->name('admin.verifications.approve');
        Route::post('admin/verifications/{verification}/reject', [\App\Http\Controllers\VerificationController::class, 'reject'])->name('admin.verifications.reject');
    });

    // Like routes
    Route::get('likes', [\App\Http\Controllers\LikeController::class, 'received'])->name('likes.index');
    Route::get('likes/received', [\App\Http\Controllers\LikeController::class, 'received'])->name('likes.received');
    Route::post('likes/{userId}', [\App\Http\Controllers\LikeController::class, 'store'])->name('likes.store')->middleware('throttle:30,1');
    Route::delete('likes/{userId}', [\App\Http\Controllers\LikeController::class, 'destroy'])->name('likes.destroy');

    // Match routes
    Route::get('matches', [\App\Http\Controllers\MatchController::class, 'index'])->name('matches.index');
    Route::get('discover', [\App\Http\Controllers\MatchController::class, 'recommendations'])->name('discover');

    // Search route
    Route::get('search', [\App\Http\Controllers\SearchController::class, 'index'])->name('search');

    // Activity route
    Route::get('activity', [\App\Http\Controllers\ActivityController::class, 'index'])->name('activity');

    // Shop routes
    Route::get('shop', [\App\Http\Controllers\ShopController::class, 'index'])->name('shop.index');
    Route::post('shop/gems/purchase', [\App\Http\Controllers\ShopController::class, 'purchaseGems'])->name('shop.gems.purchase')->middleware('throttle:5,1');
    Route::post('shop/gifts/send', [\App\Http\Controllers\ShopController::class, 'sendGift'])->name('shop.gifts.send')->middleware('throttle:10,1');
    Route::get('shop/checkout/success', [\App\Http\Controllers\ShopController::class, 'checkoutSuccess'])->name('shop.checkout.success');
    Route::get('shop/checkout/cancel', [\App\Http\Controllers\ShopController::class, 'checkoutCancel'])->name('shop.checkout.cancel');

    // Premium routes
    Route::get('premium', [\App\Http\Controllers\PremiumController::class, 'index'])->name('premium.index');
    Route::post('premium/subscribe', [\App\Http\Controllers\PremiumController::class, 'subscribe'])->name('premium.subscribe')->middleware('throttle:3,1');
    Route::get('premium/checkout/success', [\App\Http\Controllers\PremiumController::class, 'checkoutSuccess'])->name('premium.checkout.success');
    Route::get('premium/checkout/cancel', [\App\Http\Controllers\PremiumController::class, 'checkoutCancel'])->name('premium.checkout.cancel');
    Route::post('premium/billing-portal', [\App\Http\Controllers\PremiumController::class, 'billingPortal'])->name('premium.billing-portal')->middleware('throttle:3,1');
    Route::post('premium/cancel', [\App\Http\Controllers\PremiumController::class, 'cancel'])->name('premium.cancel')->middleware('throttle:3,1');

    // Conversation routes
    Route::get('conversations', [\App\Http\Controllers\ConversationController::class, 'index'])->name('conversations.index');
    Route::get('conversations/{conversation}', [\App\Http\Controllers\ConversationController::class, 'show'])->name('conversations.show');
    Route::post('conversations/{userId}', [\App\Http\Controllers\ConversationController::class, 'store'])->name('conversations.store');

    // Message routes
    Route::post('conversations/{conversation}/messages', [\App\Http\Controllers\MessageController::class, 'store'])->name('messages.store')->middleware('throttle:20,1');
    Route::post('messages/{message}/read', [\App\Http\Controllers\MessageController::class, 'markAsRead'])->name('messages.read');

    // Contenus éphémères — servis une vue à la fois, jamais par une URL partageable.
    Route::post('conversations/{conversation}/ephemeral', [\App\Http\Controllers\EphemeralMediaController::class, 'store'])->name('ephemeral.store')->middleware('throttle:10,1');
    Route::get('ephemeral/{medium}', [\App\Http\Controllers\EphemeralMediaController::class, 'show'])->name('ephemeral.show');
    Route::post('ephemeral/{medium}/report', [\App\Http\Controllers\EphemeralMediaController::class, 'report'])->name('ephemeral.report')->middleware('throttle:5,1');

    // Notification routes
    Route::get('notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/unread', [\App\Http\Controllers\NotificationController::class, 'unread'])->name('notifications.unread');
    Route::post('notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::delete('notifications/{notification}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Badge routes
    Route::get('badges', [\App\Http\Controllers\BadgeController::class, 'index'])->name('badges.index');
    Route::post('badges/refresh', [\App\Http\Controllers\BadgeController::class, 'refresh'])->name('badges.refresh');

    // Premium and gem account
    Route::get('stats', [\App\Http\Controllers\StatsController::class, 'index'])->name('stats.index');
    Route::get('gems/history', [\App\Http\Controllers\GemHistoryController::class, 'index'])->name('gems.history');

    // Private gallery permissions
    Route::get('gallery-access', [\App\Http\Controllers\GalleryAccessController::class, 'index'])->name('gallery-access.index');
    Route::get('gallery-access/manage', [\App\Http\Controllers\GalleryAccessController::class, 'manage'])->name('gallery-access.manage');
    Route::post('gallery-access/request/{userId}', [\App\Http\Controllers\GalleryAccessController::class, 'request'])->name('gallery-access.request')->middleware('throttle:5,1');
    Route::post('gallery-access/{requestId}/accept', [\App\Http\Controllers\GalleryAccessController::class, 'accept'])->name('gallery-access.accept');
    Route::post('gallery-access/{requestId}/reject', [\App\Http\Controllers\GalleryAccessController::class, 'reject'])->name('gallery-access.reject');
    Route::post('gallery-access/grant/{userId}', [\App\Http\Controllers\GalleryAccessController::class, 'grant'])->name('gallery-access.grant');
    Route::delete('gallery-access/{requestId}', [\App\Http\Controllers\GalleryAccessController::class, 'revoke'])->name('gallery-access.revoke');

    // Photo routes
    Route::get('photos', [\App\Http\Controllers\PhotoController::class, 'index'])->name('photos.index');
    Route::post('photos', [\App\Http\Controllers\PhotoController::class, 'store'])->name('photos.store')->middleware('throttle:10,1');
    Route::post('photos/{photo}/primary', [\App\Http\Controllers\PhotoController::class, 'setPrimary'])->name('photos.primary');
    // Sert les photos via l'application pour appliquer consentement et filigrane.
    Route::get('media/photos/{photo}', [\App\Http\Controllers\PhotoStreamController::class, 'show'])->name('media.photo');
    Route::post('photos/{photo}/request-avatar', [\App\Http\Controllers\PhotoController::class, 'requestAvatar'])->name('photos.request-avatar');
    Route::delete('photos/{photo}', [\App\Http\Controllers\PhotoController::class, 'destroy'])->name('photos.destroy');

    // Admin photo routes
    Route::get('admin/photos/pending', [\App\Http\Controllers\PhotoController::class, 'pending'])
        ->middleware('can:moderate,App\Models\Photo')
        ->name('admin.photos.pending');
    Route::middleware('can:update,photo')->group(function () {
        Route::post('admin/photos/{photo}/approve', [\App\Http\Controllers\PhotoController::class, 'approve'])->name('admin.photos.approve');
        Route::post('admin/photos/{photo}/reject', [\App\Http\Controllers\PhotoController::class, 'reject'])->name('admin.photos.reject');
    });

    // Report routes
    Route::get('reports/create/{userId}', [\App\Http\Controllers\ReportController::class, 'create'])->name('reports.create');
    Route::post('reports', [\App\Http\Controllers\ReportController::class, 'store'])->name('reports.store')->middleware('throttle:5,1');

    // Admin report routes
    Route::middleware('can:viewAny,App\Models\Report')->group(function () {
        Route::get('admin/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('admin.reports.index');
        Route::get('admin/reports/{report}', [\App\Http\Controllers\ReportController::class, 'show'])->name('admin.reports.show');
        Route::put('admin/reports/{report}', [\App\Http\Controllers\ReportController::class, 'update'])->name('admin.reports.update');
    });

    // Block routes
    Route::get('blocked-users', [\App\Http\Controllers\BlockController::class, 'index'])->name('blocked.index');
    Route::post('block/{userId}', [\App\Http\Controllers\BlockController::class, 'store'])->name('block.store')->middleware('throttle:10,1');
    Route::delete('block/{blockId}', [\App\Http\Controllers\BlockController::class, 'destroy'])->name('block.destroy');

    // Push subscription routes
    Route::post('push/subscribe', [\App\Http\Controllers\PushSubscriptionController::class, 'store'])->name('push.subscribe');
    Route::post('push/unsubscribe', [\App\Http\Controllers\PushSubscriptionController::class, 'destroy'])->name('push.unsubscribe');
    Route::get('push/vapid-key', [\App\Http\Controllers\PushSubscriptionController::class, 'vapidPublicKey'])->name('push.vapid-key');

    // RGPD / Data privacy routes
    Route::get('settings/privacy', [\App\Http\Controllers\DataPrivacyController::class, 'index'])->name('settings.privacy');
    Route::get('settings/data-export', [\App\Http\Controllers\DataPrivacyController::class, 'export'])->name('settings.data-export');
    Route::delete('settings/delete-account', [\App\Http\Controllers\DataPrivacyController::class, 'deleteAccount'])->name('settings.delete-account');
    Route::post('settings/consent', [\App\Http\Controllers\DataPrivacyController::class, 'updateConsent'])->name('settings.update-consent');

    // Admin routes
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        // Dashboard
        Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        // User management
        Route::get('users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
        Route::get('users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'show'])->name('users.show');
        Route::post('users/{user}/ban', [\App\Http\Controllers\Admin\UserController::class, 'ban'])->name('users.ban');
        Route::post('users/{user}/unban', [\App\Http\Controllers\Admin\UserController::class, 'unban'])->name('users.unban');
        Route::post('users/{user}/toggle-premium', [\App\Http\Controllers\Admin\UserController::class, 'togglePremium'])->name('users.toggle-premium');
        Route::post('users/{user}/photos/{photo}/sensitivity', [\App\Http\Controllers\Admin\UserController::class, 'togglePhotoSensitivity'])->name('users.photos.sensitivity');
        Route::delete('users/{user}/photos/{photo}', [\App\Http\Controllers\Admin\UserController::class, 'destroyPhoto'])->name('users.photos.destroy');
        Route::post('users/{user}/clear-avatar', [\App\Http\Controllers\Admin\UserController::class, 'clearAvatar'])->name('users.clear-avatar');
        Route::delete('users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');

        // Subscription management
        Route::get('subscriptions', [\App\Http\Controllers\Admin\SubscriptionController::class, 'index'])->name('subscriptions.index');
        Route::get('subscriptions/create', [\App\Http\Controllers\Admin\SubscriptionController::class, 'create'])->name('subscriptions.create');
        Route::post('subscriptions', [\App\Http\Controllers\Admin\SubscriptionController::class, 'store'])->name('subscriptions.store');
        Route::get('subscriptions/{subscription}', [\App\Http\Controllers\Admin\SubscriptionController::class, 'show'])->name('subscriptions.show');
        Route::get('subscriptions/{subscription}/edit', [\App\Http\Controllers\Admin\SubscriptionController::class, 'edit'])->name('subscriptions.edit');
        Route::put('subscriptions/{subscription}', [\App\Http\Controllers\Admin\SubscriptionController::class, 'update'])->name('subscriptions.update');
        Route::post('subscriptions/{subscription}/extend', [\App\Http\Controllers\Admin\SubscriptionController::class, 'extend'])->name('subscriptions.extend');
        Route::post('subscriptions/{subscription}/cancel', [\App\Http\Controllers\Admin\SubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
        Route::post('subscriptions/{subscription}/reactivate', [\App\Http\Controllers\Admin\SubscriptionController::class, 'reactivate'])->name('subscriptions.reactivate');
        Route::delete('subscriptions/{subscription}', [\App\Http\Controllers\Admin\SubscriptionController::class, 'destroy'])->name('subscriptions.destroy');

        // Billing catalogue — premium plans & gem packages
        Route::get('billing', [\App\Http\Controllers\Admin\BillingCatalogController::class, 'index'])->name('billing.index');
        Route::post('billing/plans', [\App\Http\Controllers\Admin\BillingCatalogController::class, 'storePlan'])->name('billing.plans.store');
        Route::put('billing/plans/{plan}', [\App\Http\Controllers\Admin\BillingCatalogController::class, 'updatePlan'])->name('billing.plans.update');
        Route::delete('billing/plans/{plan}', [\App\Http\Controllers\Admin\BillingCatalogController::class, 'destroyPlan'])->name('billing.plans.destroy');
        Route::post('billing/packages', [\App\Http\Controllers\Admin\BillingCatalogController::class, 'storePackage'])->name('billing.packages.store');
        Route::put('billing/packages/{package}', [\App\Http\Controllers\Admin\BillingCatalogController::class, 'updatePackage'])->name('billing.packages.update');
        Route::delete('billing/packages/{package}', [\App\Http\Controllers\Admin\BillingCatalogController::class, 'destroyPackage'])->name('billing.packages.destroy');

        // Gem economy
        Route::get('gems', [\App\Http\Controllers\Admin\GemController::class, 'index'])->name('gems.index');
        Route::get('gems/{user}', [\App\Http\Controllers\Admin\GemController::class, 'show'])->name('gems.show');
        Route::post('gems/{user}/add', [\App\Http\Controllers\Admin\GemController::class, 'add'])->name('gems.add');
        Route::post('gems/{user}/remove', [\App\Http\Controllers\Admin\GemController::class, 'remove'])->name('gems.remove');

        // Éphémères — statistiques agrégées et file des signalements
        Route::get('ephemeral', [\App\Http\Controllers\Admin\EphemeralMediaController::class, 'index'])->name('ephemeral.index');
        Route::get('ephemeral/{medium}/file', [\App\Http\Controllers\Admin\EphemeralMediaController::class, 'show'])->name('ephemeral.file');
        Route::post('ephemeral/{medium}/dismiss', [\App\Http\Controllers\Admin\EphemeralMediaController::class, 'dismiss'])->name('ephemeral.dismiss');
        Route::delete('ephemeral/{medium}', [\App\Http\Controllers\Admin\EphemeralMediaController::class, 'destroy'])->name('ephemeral.destroy');

        // Moderation
        Route::get('moderation', [\App\Http\Controllers\Admin\ModerationController::class, 'index'])->name('moderation.index');
        Route::get('moderation/audit', [\App\Http\Controllers\Admin\ModerationController::class, 'audit'])->name('moderation.audit');

        // Reports (uses admin.reports routes defined above with can:viewAny middleware)

        // Static pages management
        Route::get('static-pages', [\App\Http\Controllers\Admin\StaticPageAdminController::class, 'index'])->name('static-pages.index');

        // Settings
        Route::get('settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('settings.index');
    });
});

// Stripe webhook (outside auth middleware)
Route::post('webhook/stripe', [\App\Http\Controllers\StripeWebhookController::class, 'handle'])
    ->name('webhook.stripe')
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

require __DIR__.'/settings.php';
