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
        Schema::table('profiles', function (Blueprint $table) {
            $table->integer('age')->nullable()->after('date_of_birth');
            $table->string('postal_code', 10)->nullable()->after('city');
            $table->string('interested_in')->nullable()->after('sexual_orientation');
            $table->string('looking_for')->nullable()->after('interested_in');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn(['age', 'postal_code', 'interested_in', 'looking_for']);
        });
    }
};
