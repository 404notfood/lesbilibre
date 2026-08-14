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
        Schema::create('profile_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visitor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('visited_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Index pour les requêtes fréquentes
            $table->index('visited_user_id');
            $table->index('visitor_id');
            $table->index('created_at');

            // Éviter les doublons récents (même visiteur dans les 5 minutes)
            $table->unique(['visitor_id', 'visited_user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_visits');
    }
};
