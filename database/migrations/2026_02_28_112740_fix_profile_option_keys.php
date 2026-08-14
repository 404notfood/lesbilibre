<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Normalize profile option values to match config keys.
     */
    public function up(): void
    {
        // Fix looking_for values
        $lookingForMap = [
            'relation sérieuse' => 'relationship',
            'relation casual' => 'casual',
            'amitié' => 'friendship',
            'voir ce qui se passe' => 'open',
        ];

        foreach ($lookingForMap as $old => $new) {
            DB::table('profiles')->where('looking_for', $old)->update(['looking_for' => $new]);
        }

        // Fix sexual_orientation values (already correct in DB but handle legacy)
        $orientationMap = [
            'lesbienne' => 'lesbian',
            'bisexuelle' => 'bisexual',
            'pansexuelle' => 'pansexual',
        ];

        foreach ($orientationMap as $old => $new) {
            DB::table('profiles')->where('sexual_orientation', $old)->update(['sexual_orientation' => $new]);
        }

        // Fix relationship_status values
        $statusMap = [
            'celibataire' => 'single',
            'en_couple' => 'in_relationship',
            'complique' => 'complicated',
            'relation_ouverte' => 'open',
        ];

        foreach ($statusMap as $old => $new) {
            DB::table('profiles')->where('relationship_status', $old)->update(['relationship_status' => $new]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $lookingForMap = [
            'relationship' => 'relation sérieuse',
            'casual' => 'relation casual',
            'friendship' => 'amitié',
            'open' => 'voir ce qui se passe',
        ];

        foreach ($lookingForMap as $old => $new) {
            DB::table('profiles')->where('looking_for', $old)->update(['looking_for' => $new]);
        }

        $orientationMap = [
            'lesbian' => 'lesbienne',
            'bisexual' => 'bisexuelle',
            'pansexual' => 'pansexuelle',
        ];

        foreach ($orientationMap as $old => $new) {
            DB::table('profiles')->where('sexual_orientation', $old)->update(['sexual_orientation' => $new]);
        }

        $statusMap = [
            'single' => 'celibataire',
            'in_relationship' => 'en_couple',
            'complicated' => 'complique',
            'open' => 'relation_ouverte',
        ];

        foreach ($statusMap as $old => $new) {
            DB::table('profiles')->where('relationship_status', $old)->update(['relationship_status' => $new]);
        }
    }
};
