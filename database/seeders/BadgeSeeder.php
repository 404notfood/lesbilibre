<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $badges = [
            // Badges débutants - Common
            [
                'slug' => 'premiere-photo',
                'name' => 'Première Photo',
                'description' => 'Ajoutez votre première photo de profil',
                'icon' => '📸',
                'color' => '#EC4899',
                'criteria' => ['type' => 'photos_count', 'target' => 1],
                'points' => 10,
                'rarity' => 'common',
            ],
            [
                'slug' => 'profil-complet',
                'name' => 'Profil Complet',
                'description' => 'Complétez toutes les informations de votre profil',
                'icon' => '✨',
                'color' => '#8B5CF6',
                'criteria' => ['type' => 'profile_complete'],
                'points' => 50,
                'rarity' => 'common',
            ],
            [
                'slug' => 'premier-like',
                'name' => 'Premier Coup de Cœur',
                'description' => 'Donnez votre premier like',
                'icon' => '💖',
                'color' => '#F472B6',
                'criteria' => ['type' => 'likes_given', 'target' => 1],
                'points' => 10,
                'rarity' => 'common',
            ],
            [
                'slug' => 'bienvenue',
                'name' => 'Bienvenue',
                'description' => 'Inscrivez-vous sur la plateforme',
                'icon' => '👋',
                'color' => '#3B82F6',
                'criteria' => ['type' => 'days_active', 'target' => 0],
                'points' => 5,
                'rarity' => 'common',
            ],

            // Badges intermédiaires - Rare
            [
                'slug' => 'populaire',
                'name' => 'Populaire',
                'description' => 'Recevez 10 likes',
                'icon' => '🌟',
                'color' => '#F59E0B',
                'criteria' => ['type' => 'likes_received', 'target' => 10],
                'points' => 100,
                'rarity' => 'rare',
            ],
            [
                'slug' => '5-matchs',
                'name' => 'Cupidon',
                'description' => 'Obtenez 5 matchs',
                'icon' => '💘',
                'color' => '#EC4899',
                'criteria' => ['type' => 'matches_count', 'target' => 5],
                'points' => 150,
                'rarity' => 'rare',
            ],
            [
                'slug' => 'bavarde',
                'name' => 'Bavarde',
                'description' => 'Envoyez 100 messages',
                'icon' => '💬',
                'color' => '#6366F1',
                'criteria' => ['type' => 'messages_sent', 'target' => 100],
                'points' => 200,
                'rarity' => 'rare',
            ],
            [
                'slug' => 'une-semaine',
                'name' => 'Fidèle',
                'description' => 'Restez active pendant 7 jours',
                'icon' => '🎯',
                'color' => '#10B981',
                'criteria' => ['type' => 'days_active', 'target' => 7],
                'points' => 75,
                'rarity' => 'rare',
            ],
            [
                'slug' => 'photographe',
                'name' => 'Photographe',
                'description' => 'Ajoutez 5 photos à votre profil',
                'icon' => '📷',
                'color' => '#8B5CF6',
                'criteria' => ['type' => 'photos_count', 'target' => 5],
                'points' => 100,
                'rarity' => 'rare',
            ],

            // Badges avancés - Epic
            [
                'slug' => 'tres-populaire',
                'name' => 'Très Populaire',
                'description' => 'Recevez 50 likes',
                'icon' => '⭐',
                'color' => '#F59E0B',
                'criteria' => ['type' => 'likes_received', 'target' => 50],
                'points' => 500,
                'rarity' => 'epic',
            ],
            [
                'slug' => '25-matchs',
                'name' => 'Reine des Cœurs',
                'description' => 'Obtenez 25 matchs',
                'icon' => '👑',
                'color' => '#F59E0B',
                'criteria' => ['type' => 'matches_count', 'target' => 25],
                'points' => 750,
                'rarity' => 'epic',
            ],
            [
                'slug' => 'un-mois',
                'name' => 'Vétérane',
                'description' => 'Restez active pendant 30 jours',
                'icon' => '🏆',
                'color' => '#8B5CF6',
                'criteria' => ['type' => 'days_active', 'target' => 30],
                'points' => 300,
                'rarity' => 'epic',
            ],
            [
                'slug' => 'verifiee',
                'name' => 'Profil Vérifié',
                'description' => 'Faites vérifier votre profil',
                'icon' => '✅',
                'color' => '#3B82F6',
                'criteria' => ['type' => 'verified_profile'],
                'points' => 200,
                'rarity' => 'epic',
            ],
            [
                'slug' => 'sociale',
                'name' => 'Sociale',
                'description' => 'Envoyez 500 messages',
                'icon' => '💭',
                'color' => '#6366F1',
                'criteria' => ['type' => 'messages_sent', 'target' => 500],
                'points' => 1000,
                'rarity' => 'epic',
            ],

            // Badges légendaires - Legendary
            [
                'slug' => 'star',
                'name' => 'Star',
                'description' => 'Recevez 100 likes',
                'icon' => '🌠',
                'color' => '#F59E0B',
                'criteria' => ['type' => 'likes_received', 'target' => 100],
                'points' => 2000,
                'rarity' => 'legendary',
            ],
            [
                'slug' => '50-matchs',
                'name' => 'Cupidon Légendaire',
                'description' => 'Obtenez 50 matchs',
                'icon' => '💝',
                'color' => '#EC4899',
                'criteria' => ['type' => 'matches_count', 'target' => 50],
                'points' => 3000,
                'rarity' => 'legendary',
            ],
            [
                'slug' => 'premium',
                'name' => 'VIP',
                'description' => 'Devenez membre Premium',
                'icon' => '💎',
                'color' => '#F59E0B',
                'criteria' => ['type' => 'premium_user'],
                'points' => 1000,
                'rarity' => 'legendary',
            ],
            [
                'slug' => 'centenaire',
                'name' => 'Centenaire',
                'description' => 'Restez active pendant 100 jours',
                'icon' => '🎊',
                'color' => '#8B5CF6',
                'criteria' => ['type' => 'days_active', 'target' => 100],
                'points' => 5000,
                'rarity' => 'legendary',
            ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['slug' => $badge['slug']],
                $badge
            );
        }
    }
}
