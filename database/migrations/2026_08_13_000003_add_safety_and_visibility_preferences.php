<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->boolean('is_discoverable')->default(true)->after('is_naughty_mode');
            $table->boolean('incognito_mode')->default(false)->after('is_discoverable');
            $table->enum('message_permission', ['matches_only', 'verified_members'])->default('matches_only')->after('incognito_mode');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn(['is_discoverable', 'incognito_mode', 'message_permission']);
        });
    }
};
