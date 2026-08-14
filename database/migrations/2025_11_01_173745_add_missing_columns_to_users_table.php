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
            $table->string('pseudo')->unique()->after('name');
            $table->boolean('is_admin')->default(false)->after('password');
            $table->boolean('is_verified')->default(false)->after('is_admin');
            $table->boolean('is_banned')->default(false)->after('is_verified');
            $table->timestamp('last_login_at')->nullable()->after('is_banned');
            $table->softDeletes()->after('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['pseudo', 'is_admin', 'is_verified', 'is_banned', 'last_login_at', 'deleted_at']);
        });
    }
};
