<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General
            [
                'key' => 'site_name',
                'value' => 'LesbiLibre',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Nom du site',
            ],
            [
                'key' => 'site_description',
                'value' => 'Plateforme de rencontre pour la communauté lesbienne',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Description du site',
            ],
            [
                'key' => 'maintenance_mode',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'general',
                'description' => 'Mode maintenance',
            ],
            [
                'key' => 'registration_enabled',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'general',
                'description' => 'Autoriser les inscriptions',
            ],

            // Email
            [
                'key' => 'contact_email',
                'value' => 'admin@locatys.com',
                'type' => 'string',
                'group' => 'email',
                'description' => 'Email de contact',
            ],
            [
                'key' => 'support_email',
                'value' => 'admin@locatys.com',
                'type' => 'string',
                'group' => 'email',
                'description' => 'Email de support',
            ],

            // Pricing - Premium Subscriptions
            [
                'key' => 'premium_price_monthly',
                'value' => '9.99',
                'type' => 'string',
                'group' => 'pricing',
                'description' => 'Prix abonnement Premium mensuel (€)',
            ],
            [
                'key' => 'premium_price_quarterly',
                'value' => '24.99',
                'type' => 'string',
                'group' => 'pricing',
                'description' => 'Prix abonnement Premium trimestriel (€)',
            ],
            [
                'key' => 'premium_price_yearly',
                'value' => '79.99',
                'type' => 'string',
                'group' => 'pricing',
                'description' => 'Prix abonnement Premium annuel (€)',
            ],

            // Gems Pricing
            [
                'key' => 'gems_pack_small',
                'value' => '100',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Nombre de gemmes pack petit',
            ],
            [
                'key' => 'gems_pack_small_price',
                'value' => '4.99',
                'type' => 'string',
                'group' => 'gems',
                'description' => 'Prix pack petit de gemmes (€)',
            ],
            [
                'key' => 'gems_pack_medium',
                'value' => '250',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Nombre de gemmes pack moyen',
            ],
            [
                'key' => 'gems_pack_medium_price',
                'value' => '9.99',
                'type' => 'string',
                'group' => 'gems',
                'description' => 'Prix pack moyen de gemmes (€)',
            ],
            [
                'key' => 'gems_pack_large',
                'value' => '500',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Nombre de gemmes pack grand',
            ],
            [
                'key' => 'gems_pack_large_price',
                'value' => '19.99',
                'type' => 'string',
                'group' => 'gems',
                'description' => 'Prix pack grand de gemmes (€)',
            ],

            // Gems Costs (actions payantes)
            [
                'key' => 'gems_cost_message',
                'value' => '1',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Coût en gemmes pour envoyer un message (utilisateurs non-Premium)',
            ],
            [
                'key' => 'gems_cost_boost',
                'value' => '20',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Coût en gemmes pour un boost de profil (30min)',
            ],
            [
                'key' => 'gems_cost_super_like',
                'value' => '5',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Coût en gemmes pour un super like',
            ],
            [
                'key' => 'gems_cost_reveal_like',
                'value' => '2',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Coût en gemmes pour révéler un like (utilisateurs non-Premium)',
            ],

            // Gems Rewards (gains)
            [
                'key' => 'gems_reward_daily_login',
                'value' => '5',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Gemmes gagnées pour connexion quotidienne',
            ],
            [
                'key' => 'gems_reward_profile_completion',
                'value' => '50',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Gemmes gagnées pour profil complété à 100%',
            ],
            [
                'key' => 'gems_reward_first_match',
                'value' => '10',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Gemmes gagnées pour le premier match',
            ],
            [
                'key' => 'gems_reward_photo_upload',
                'value' => '10',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Gemmes gagnées pour chaque photo uploadée (max 5)',
            ],
            [
                'key' => 'gems_premium_monthly_bonus',
                'value' => '100',
                'type' => 'integer',
                'group' => 'gems',
                'description' => 'Gemmes bonus mensuelles pour membres Premium',
            ],

            // Features
            [
                'key' => 'enable_chat',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'features',
                'description' => 'Activer la messagerie',
            ],
            [
                'key' => 'enable_verification',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'features',
                'description' => 'Activer la vérification de profil',
            ],
            [
                'key' => 'enable_premium',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'features',
                'description' => 'Activer les abonnements Premium',
            ],
            [
                'key' => 'enable_gems',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'features',
                'description' => 'Activer les Gems',
            ],
            [
                'key' => 'require_gems_for_messages',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'features',
                'description' => 'Requérir des gemmes pour les messages (utilisateurs non-Premium)',
            ],

            // Social
            [
                'key' => 'facebook_url',
                'value' => '',
                'type' => 'string',
                'group' => 'social',
                'description' => 'URL Facebook',
            ],
            [
                'key' => 'instagram_url',
                'value' => '',
                'type' => 'string',
                'group' => 'social',
                'description' => 'URL Instagram',
            ],
            [
                'key' => 'twitter_url',
                'value' => '',
                'type' => 'string',
                'group' => 'social',
                'description' => 'URL Twitter',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
