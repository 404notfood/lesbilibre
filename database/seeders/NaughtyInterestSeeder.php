<?php

namespace Database\Seeders;

use App\Models\NaughtyInterest;
use Illuminate\Database\Seeder;

class NaughtyInterestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $interests = [
            // Pratiques sexuelles
            ['name' => '69', 'slug' => '69', 'category' => 'practices', 'emoji' => '♋'],
            ['name' => 'Cybersex', 'slug' => 'cybersex', 'category' => 'practices', 'emoji' => '💻'],
            ['name' => 'Dominer', 'slug' => 'dominate', 'category' => 'practices', 'emoji' => '👑'],
            ['name' => 'Être dominée', 'slug' => 'be-dominated', 'category' => 'practices', 'emoji' => '🙇'],
            ['name' => 'Expérimentale', 'slug' => 'experimental', 'category' => 'practices', 'emoji' => '🧪'],
            ['name' => 'Cunnilingus', 'slug' => 'cunnilingus', 'category' => 'practices', 'emoji' => '👅'],
            ['name' => 'Anulingus', 'slug' => 'anulingus', 'category' => 'practices', 'emoji' => '🍑'],
            ['name' => 'Tribadisme', 'slug' => 'tribadism', 'category' => 'practices', 'emoji' => '✂️'],
            ['name' => 'Masturbation mutuelle', 'slug' => 'mutual-masturbation', 'category' => 'practices', 'emoji' => '🤝'],
            ['name' => 'Sexe tantrique', 'slug' => 'tantric', 'category' => 'practices', 'emoji' => '🕉️'],
            ['name' => 'Orgasme multiple', 'slug' => 'multiple-orgasm', 'category' => 'practices', 'emoji' => '🌟'],
            ['name' => 'Squirting', 'slug' => 'squirting', 'category' => 'practices', 'emoji' => '💧'],

            // Positions
            ['name' => 'Levrette', 'slug' => 'doggy-style', 'category' => 'positions', 'emoji' => '🐕'],
            ['name' => 'Amazone', 'slug' => 'cowgirl', 'category' => 'positions', 'emoji' => '🤠'],
            ['name' => 'Missionnaire', 'slug' => 'missionary', 'category' => 'positions', 'emoji' => '👥'],
            ['name' => '69', 'slug' => '69-position', 'category' => 'positions', 'emoji' => '♋'],
            ['name' => 'Cuillère', 'slug' => 'spooning', 'category' => 'positions', 'emoji' => '🥄'],
            ['name' => 'Assis/debout', 'slug' => 'standing', 'category' => 'positions', 'emoji' => '🧍'],
            ['name' => 'Face-sitting', 'slug' => 'face-sitting', 'category' => 'positions', 'emoji' => '🪑'],

            // Anatomie/préférences
            ['name' => 'Gros seins', 'slug' => 'big-tits', 'category' => 'anatomy', 'emoji' => '🍈'],
            ['name' => 'Petits seins', 'slug' => 'small-tits', 'category' => 'anatomy', 'emoji' => '🍒'],
            ['name' => 'Gros fessier', 'slug' => 'big-butt', 'category' => 'anatomy', 'emoji' => '🍑'],
            ['name' => 'Tatouages', 'slug' => 'tattoos', 'category' => 'anatomy', 'emoji' => '🎨'],
            ['name' => 'Piercings', 'slug' => 'piercings', 'category' => 'anatomy', 'emoji' => '💎'],
            ['name' => 'Poilue', 'slug' => 'hairy', 'category' => 'anatomy', 'emoji' => '🦊'],
            ['name' => 'Épilée', 'slug' => 'shaved', 'category' => 'anatomy', 'emoji' => '✨'],

            // Jeux et accessoires
            ['name' => 'Gode', 'slug' => 'dildo', 'category' => 'toys', 'emoji' => '🍆'],
            ['name' => 'Gode-ceinture', 'slug' => 'strap-on', 'category' => 'toys', 'emoji' => '🎯'],
            ['name' => 'Vibromasseur', 'slug' => 'vibrator', 'category' => 'toys', 'emoji' => '📳'],
            ['name' => 'Plug anal', 'slug' => 'anal-plug', 'category' => 'toys', 'emoji' => '🔌'],
            ['name' => 'Boules de geisha', 'slug' => 'ben-wa-balls', 'category' => 'toys', 'emoji' => '⚪'],
            ['name' => 'Menottes', 'slug' => 'handcuffs', 'category' => 'toys', 'emoji' => '⛓️'],
            ['name' => 'Fouet', 'slug' => 'whip', 'category' => 'toys', 'emoji' => '🔱'],
            ['name' => 'Corde', 'slug' => 'rope', 'category' => 'toys', 'emoji' => '🪢'],
            ['name' => 'Bandeau', 'slug' => 'blindfold', 'category' => 'toys', 'emoji' => '👓'],
            ['name' => 'Bâillon', 'slug' => 'gag', 'category' => 'toys', 'emoji' => '🤐'],

            // BDSM et fétichisme
            ['name' => 'Fétichisme', 'slug' => 'fetishism', 'category' => 'fetish', 'emoji' => '👠'],
            ['name' => 'Fisting', 'slug' => 'fisting', 'category' => 'fetish', 'emoji' => '✊'],
            ['name' => 'Bondage', 'slug' => 'bondage', 'category' => 'bdsm', 'emoji' => '⛓️'],
            ['name' => 'BDSM', 'slug' => 'bdsm', 'category' => 'bdsm', 'emoji' => '🔒'],
            ['name' => 'Shibari', 'slug' => 'shibari', 'category' => 'bdsm', 'emoji' => '🪢'],
            ['name' => 'Spanking', 'slug' => 'spanking', 'category' => 'bdsm', 'emoji' => '👋'],
            ['name' => 'Wax play', 'slug' => 'wax-play', 'category' => 'bdsm', 'emoji' => '🕯️'],
            ['name' => 'Fétichisme des pieds', 'slug' => 'foot-fetish', 'category' => 'fetish', 'emoji' => '🦶'],
            ['name' => 'Latex', 'slug' => 'latex', 'category' => 'fetish', 'emoji' => '🧥'],
            ['name' => 'Cuir', 'slug' => 'leather', 'category' => 'fetish', 'emoji' => '🖤'],
            ['name' => 'Lingerie', 'slug' => 'lingerie', 'category' => 'fetish', 'emoji' => '👙'],

            // Ambiances et contextes
            ['name' => 'Longs préliminaires', 'slug' => 'long-foreplay', 'category' => 'ambiance', 'emoji' => '⏰'],
            ['name' => 'Sexe rapide', 'slug' => 'quickie', 'category' => 'ambiance', 'emoji' => '⚡'],
            ['name' => 'Sex-toys', 'slug' => 'sex-toys', 'category' => 'ambiance', 'emoji' => '🎁'],
            ['name' => 'Massage sensuel', 'slug' => 'sensual-massage', 'category' => 'ambiance', 'emoji' => '💆'],
            ['name' => 'Sexe public', 'slug' => 'public-sex', 'category' => 'ambiance', 'emoji' => '🏞️'],
            ['name' => 'Plan à trois', 'slug' => 'threesome', 'category' => 'ambiance', 'emoji' => '👯'],
            ['name' => 'Partouze', 'slug' => 'orgy', 'category' => 'ambiance', 'emoji' => '👥'],
            ['name' => 'Échangisme', 'slug' => 'swinging', 'category' => 'ambiance', 'emoji' => '🔄'],
            ['name' => 'Voyeurisme', 'slug' => 'voyeurism', 'category' => 'ambiance', 'emoji' => '👀'],
            ['name' => 'Exhibitionnisme', 'slug' => 'exhibitionism', 'category' => 'ambiance', 'emoji' => '🎭'],
            ['name' => 'Dirty talk', 'slug' => 'dirty-talk', 'category' => 'ambiance', 'emoji' => '💬'],
            ['name' => 'Sexting', 'slug' => 'sexting', 'category' => 'ambiance', 'emoji' => '📱'],
            ['name' => 'Photos/Vidéos', 'slug' => 'photo-video', 'category' => 'ambiance', 'emoji' => '📸'],
            ['name' => 'Cosplay', 'slug' => 'cosplay', 'category' => 'ambiance', 'emoji' => '🎭'],
            ['name' => 'Jeux de rôle', 'slug' => 'roleplay', 'category' => 'ambiance', 'emoji' => '🎬'],
        ];

        foreach ($interests as $interest) {
            NaughtyInterest::create($interest);
        }
    }
}
