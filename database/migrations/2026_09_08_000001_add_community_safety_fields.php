<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('community_charter_accepted_at')->nullable();
            $table->string('community_charter_version', 30)->nullable();
            $table->timestamp('safety_restricted_at')->nullable();
        });
        Schema::table('profiles', function (Blueprint $table) {
            $table->timestamp('birth_date_declared_at')->nullable();
            $table->json('meeting_intentions')->nullable();
            $table->json('boundaries')->nullable();
        });
        Schema::create('intimate_media_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('accepted')->default(false);
            $table->timestamps();
            $table->unique(['conversation_id', 'user_id']);
        });
        Schema::table('reports', fn (Blueprint $table) => $table->string('reason', 60)->change());
    }

    public function down(): void
    {
        Schema::dropIfExists('intimate_media_consents');
        Schema::table('profiles', fn (Blueprint $table) => $table->dropColumn(['birth_date_declared_at', 'meeting_intentions', 'boundaries']));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['community_charter_accepted_at', 'community_charter_version', 'safety_restricted_at']));
    }
};
