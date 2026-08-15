<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Date de dernière consultation de la page Activité.
     *
     * Distincte de `last_activity_at`, qui sert à la présence en ligne : sans
     * marqueur dédié, la pastille comptait toutes les interactions des 7
     * derniers jours et ne pouvait jamais retomber à zéro.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('activity_seen_at')->nullable()->after('last_activity_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('activity_seen_at');
        });
    }
};
