<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('premium_plans', function (Blueprint $table) {
            // Avantages cochés depuis l'admin, sous la forme
            // { "unlimited_likes": true, "likes_per_day": 100, ... }.
            // Distinct de `perks`, qui reste la liste d'arguments commerciaux
            // affichée telle quelle sur la page premium.
            $table->json('entitlements')->nullable()->after('perks');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('premium_plans', function (Blueprint $table) {
            $table->dropColumn('entitlements');
        });
    }
};
