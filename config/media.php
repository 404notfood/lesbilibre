<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Binaires vidéo
    |--------------------------------------------------------------------------
    |
    | Chemins vers ffmpeg et ffprobe. Sur un serveur Debian/Ubuntu, un simple
    | `apt install ffmpeg` les place dans /usr/bin. Si les binaires sont
    | absents, l'envoi de vidéos est refusé proprement plutôt que d'échouer
    | après coup.
    |
    */

    'ffmpeg_path' => env('FFMPEG_PATH', 'ffmpeg'),
    'ffprobe_path' => env('FFPROBE_PATH', 'ffprobe'),

    /*
    |--------------------------------------------------------------------------
    | Contenus éphémères
    |--------------------------------------------------------------------------
    */

    'ephemeral' => [
        /** Taille maximale acceptée à l'envoi, en kilo-octets. */
        'max_photo_kb' => 10240,
        'max_video_kb' => 102400,

        /** Durée maximale d'une vidéo éphémère, en secondes. */
        'max_video_seconds' => 60,

        /**
         * Coût en gemmes pour revoir un contenu une seconde fois. Les membres
         * premium dont le plan accorde `free_replays` ne paient pas.
         */
        'replay_cost_gems' => env('EPHEMERAL_REPLAY_COST', 20),
    ],

];
