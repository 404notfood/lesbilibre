<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->uuid('client_uuid')->nullable();
            $table->unique(['sender_id', 'client_uuid']);
            $table->string('moderation_status')->default('pending')->index();
            $table->foreignId('moderated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('moderation_reason')->nullable();
        });

        Schema::create('message_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('state')->default('pending');
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamp('next_attempt_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->index(['state', 'next_attempt_at']);
        });
        Schema::create('message_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->index(['conversation_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_changes');
        Schema::dropIfExists('message_deliveries');
        Schema::table('messages', function (Blueprint $table) {
            $table->dropUnique(['sender_id', 'client_uuid']);
            $table->dropColumn('client_uuid');
            $table->dropForeign(['moderated_by']);
            $table->dropIndex(['moderation_status']);
            $table->dropColumn(['moderation_status', 'moderated_by', 'reviewed_at', 'moderation_reason']);
        });
    }
};
