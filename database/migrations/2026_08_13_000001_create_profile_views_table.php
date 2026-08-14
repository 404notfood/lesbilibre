<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profile_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('viewer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('profile_user_id')->constrained('users')->cascadeOnDelete();
            $table->date('viewed_on');
            $table->timestamps();

            $table->unique(['viewer_id', 'profile_user_id', 'viewed_on']);
            $table->index(['profile_user_id', 'viewed_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profile_views');
    }
};
