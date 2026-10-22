<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Keep the moderation decision when its private selfie is purged.
        Schema::table('verification_photos', function (Blueprint $table) {
            $table->string('path')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Rollback must not delete historical moderation decisions.
        DB::table('verification_photos')->whereNull('path')->update(['path' => '']);
        Schema::table('verification_photos', function (Blueprint $table) {
            $table->string('path')->nullable(false)->change();
        });
    }
};
