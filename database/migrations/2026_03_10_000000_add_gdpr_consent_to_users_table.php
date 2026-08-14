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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('data_processing_consent')->default(false)->after('last_activity_at');
            $table->timestamp('data_processing_consented_at')->nullable()->after('data_processing_consent');
            $table->boolean('marketing_consent')->default(false)->after('data_processing_consented_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'data_processing_consent',
                'data_processing_consented_at',
                'marketing_consent',
            ]);
        });
    }
};
