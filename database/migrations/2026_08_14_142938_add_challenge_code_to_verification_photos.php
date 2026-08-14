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
        Schema::table('verification_photos', function (Blueprint $table) {
            // Code que la membre doit écrire sur une feuille visible dans le
            // selfie : il prouve que la photo a été prise pour cette demande
            // précise, et non récupérée ailleurs.
            $table->string('challenge_code', 12)->nullable()->after('path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('verification_photos', function (Blueprint $table) {
            $table->dropColumn('challenge_code');
        });
    }
};
