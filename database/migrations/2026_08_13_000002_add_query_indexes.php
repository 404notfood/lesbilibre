<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->index(['user1_id', 'last_message_at'], 'conversations_user1_last_message_index');
            $table->index(['user2_id', 'last_message_at'], 'conversations_user2_last_message_index');
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->index(['liked_user_id', 'created_at'], 'likes_recipient_created_index');
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'reports_status_created_index');
        });

        Schema::table('photos', function (Blueprint $table) {
            $table->index(['user_id', 'is_approved', 'order'], 'photos_profile_display_index');
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex('conversations_user1_last_message_index');
            $table->dropIndex('conversations_user2_last_message_index');
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->dropIndex('likes_recipient_created_index');
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->dropIndex('reports_status_created_index');
        });

        Schema::table('photos', function (Blueprint $table) {
            $table->dropIndex('photos_profile_display_index');
        });
    }
};
