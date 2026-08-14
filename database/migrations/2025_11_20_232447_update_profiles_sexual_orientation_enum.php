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
        // For MySQL, use direct SQL for ENUM modification
        // For SQLite, recreation is handled differently
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE profiles MODIFY COLUMN sexual_orientation ENUM('lesbian', 'bisexual', 'pansexual', 'queer', 'questioning', 'other') DEFAULT 'lesbian'");
        } else {
            // For SQLite and other databases, use Schema facade
            Schema::table('profiles', function (Blueprint $table) {
                $table->string('sexual_orientation', 20)->default('lesbian')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE profiles MODIFY COLUMN sexual_orientation ENUM('lesbian', 'bisexual', 'pansexual', 'queer', 'other') DEFAULT 'lesbian'");
        } else {
            // For SQLite, no rollback needed as it's a string column
            Schema::table('profiles', function (Blueprint $table) {
                $table->string('sexual_orientation', 20)->default('lesbian')->change();
            });
        }
    }
};
