<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->string('content_hash', 64)->nullable()->after('path');
            $table->enum('moderation_status', ['pending', 'approved', 'rejected', 'quarantined'])->default('pending')->after('is_approved');
            $table->index('content_hash');
            $table->index('moderation_status');
        });
    }

    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dropIndex(['content_hash']);
            $table->dropIndex(['moderation_status']);
            $table->dropColumn(['content_hash', 'moderation_status']);
        });
    }
};
