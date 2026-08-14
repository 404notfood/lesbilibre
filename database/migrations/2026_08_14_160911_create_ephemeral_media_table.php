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
        Schema::create('ephemeral_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();

            $table->enum('type', ['photo', 'video']);
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->boolean('is_naughty')->default(false);

            // Les vidéos sont ré-encodées en tâche de fond : tant que ce n'est
            // pas fait, le fichier d'origine ne doit pas être servi.
            $table->enum('processing_status', ['ready', 'pending', 'failed'])->default('ready');

            /*
             * Cycle de vie. Le contenu reste disponible sans limite jusqu'à la
             * première ouverture — sinon une photo envoyée à quelqu'un qui se
             * connecte peu ne serait jamais vue. Une fois ouverte, la
             * destinataire dispose de 24 h pour la revoir une seule fois.
             */
            $table->timestamp('first_viewed_at')->nullable();
            $table->timestamp('replay_available_until')->nullable();
            $table->timestamp('replayed_at')->nullable();

            /*
             * Purge. Le fichier est effacé du disque à cette date ; la ligne
             * survit pour les statistiques agrégées. Un signalement gèle la
             * purge le temps du traitement.
             */
            $table->timestamp('purge_after');
            $table->timestamp('purged_at')->nullable();
            $table->boolean('is_flagged')->default(false);

            $table->timestamps();

            $table->index(['recipient_id', 'first_viewed_at']);
            $table->index(['purge_after', 'purged_at']);
            $table->index('is_flagged');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ephemeral_media');
    }
};
