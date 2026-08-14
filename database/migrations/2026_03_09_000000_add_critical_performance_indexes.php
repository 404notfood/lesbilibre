<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Profiles: geospatial search (core dating feature)
        Schema::table('profiles', function (Blueprint $table) {
            $table->index(['latitude', 'longitude'], 'profiles_lat_lng_index');
            $table->index('city');
            $table->index('is_naughty_mode');
        });

        // Users: online/activity sorting
        Schema::table('users', function (Blueprint $table) {
            $table->index('last_activity_at');
            $table->index('is_banned');
        });

        // Messages: conversation message loading
        Schema::table('messages', function (Blueprint $table) {
            $table->index(['conversation_id', 'created_at'], 'messages_conv_created_index');
            $table->index('read_at');
        });

        // Conversations: bidirectional user lookup
        Schema::table('conversations', function (Blueprint $table) {
            $table->index('user2_id');
            $table->index('last_message_at');
        });

        // User matches: bidirectional lookup
        Schema::table('user_matches', function (Blueprint $table) {
            $table->index('user2_id');
        });

        // Photos: primary photo and approval queries
        Schema::table('photos', function (Blueprint $table) {
            $table->index(['user_id', 'is_primary'], 'photos_user_primary_index');
            $table->index('is_approved');
        });

        // Likes: "who liked me" queries
        Schema::table('likes', function (Blueprint $table) {
            $table->index('liked_user_id');
        });

        // Reports: admin filtering
        Schema::table('reports', function (Blueprint $table) {
            $table->index('status');
            $table->index('reported_user_id');
        });

        // Subscriptions: active subscription lookups
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'subscriptions_user_status_index');
            $table->index('expires_at');
        });

        // Verification photos: admin pending queue
        Schema::table('verification_photos', function (Blueprint $table) {
            $table->index('status');
        });

        // Gallery access requests: owner lookup
        Schema::table('gallery_access_requests', function (Blueprint $table) {
            $table->index('owner_user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropIndex('profiles_lat_lng_index');
            $table->dropIndex(['city']);
            $table->dropIndex(['is_naughty_mode']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['last_activity_at']);
            $table->dropIndex(['is_banned']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_conv_created_index');
            $table->dropIndex(['read_at']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['user2_id']);
            $table->dropIndex(['last_message_at']);
        });

        Schema::table('user_matches', function (Blueprint $table) {
            $table->dropIndex(['user2_id']);
        });

        Schema::table('photos', function (Blueprint $table) {
            $table->dropIndex('photos_user_primary_index');
            $table->dropIndex(['is_approved']);
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->dropIndex(['liked_user_id']);
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['reported_user_id']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex('subscriptions_user_status_index');
            $table->dropIndex(['expires_at']);
        });

        Schema::table('verification_photos', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('gallery_access_requests', function (Blueprint $table) {
            $table->dropIndex(['owner_user_id']);
            $table->dropIndex(['status']);
        });
    }
};
