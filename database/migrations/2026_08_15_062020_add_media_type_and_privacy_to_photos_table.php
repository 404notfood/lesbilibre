<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sépare deux notions jusqu'ici confondues dans `is_naughty` :
     *
     *  - `is_naughty`  : contenu coquin, flouté tant que la visiteuse n'a pas
     *                    activé son mode coquin ;
     *  - `is_private`  : galerie privée, dont l'accès se demande à sa propriétaire.
     *
     * Une photo peut être coquine sans être privée, et inversement. Les vidéos
     * coquines sont, elles, toujours privées (aucun floutage vidéo n'est produit).
     */
    public function up(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->enum('media_type', ['photo', 'video'])->default('photo')->after('user_id');
            $table->boolean('is_private')->default(false)->after('is_naughty');
            $table->unsignedInteger('duration')->nullable()->after('thumbnail_path');

            $table->index(['user_id', 'is_private']);
        });

        // Les médias déjà marqués coquins étaient de fait des médias à accès
        // restreint : on les bascule en galerie privée pour ne rien exposer
        // qui ne l'était pas avant cette migration.
        DB::table('photos')->where('is_naughty', true)->update(['is_private' => true]);
    }

    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'is_private']);
            $table->dropColumn(['media_type', 'is_private', 'duration']);
        });
    }
};
