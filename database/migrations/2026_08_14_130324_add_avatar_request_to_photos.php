<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->timestamp('avatar_requested_at')->nullable()->after('is_primary');
            $table->index('avatar_requested_at');
        });

        // Les photos de galerie déjà en attente deviennent visibles : le
        // nouveau modèle publie d'emblée et modère a posteriori. Celles qu'un
        // modérateur a explicitement refusées gardent leur statut.
        DB::table('photos')
            ->whereNull('rejection_reason')
            ->update(['is_approved' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dropIndex(['avatar_requested_at']);
            $table->dropColumn('avatar_requested_at');
        });
    }
};
