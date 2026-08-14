<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Like;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    private array $frenchFirstNames = [
        'Sophie', 'Marie', 'Claire', 'Julie', 'Emma', 'Léa', 'Chloé', 'Camille',
        'Sarah', 'Laura', 'Manon', 'Lisa', 'Alice', 'Lucie', 'Océane', 'Inès',
        'Charlotte', 'Jade', 'Léna', 'Anaïs', 'Eva', 'Zoé', 'Lou', 'Nina',
        'Pauline', 'Margaux', 'Caroline', 'Émilie', 'Audrey', 'Jessica', 'Mélanie',
        'Stéphanie', 'Céline', 'Nathalie', 'Isabelle', 'Valérie', 'Sylvie', 'Anne',
        'Laurence', 'Florence', 'Sandrine', 'Karine', 'Corinne', 'Martine', 'Patricia',
        'Alexandra', 'Élodie', 'Virginie', 'Laetitia', 'Delphine',
    ];

    private array $frenchCities = [
        'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
        'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne',
        'Toulon', 'Le Havre', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
        'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence', 'Brest', 'Tours', 'Amiens',
        'Limoges', 'Annecy', 'Perpignan', 'Boulogne-Billancourt', 'Orléans', 'Metz',
        'Besançon', 'Rouen', 'Mulhouse', 'Caen', 'Nancy', 'Argenteuil', 'Saint-Denis',
    ];

    private array $interests = [
        'Voyages', 'Cuisine', 'Lecture', 'Cinéma', 'Musique', 'Sport', 'Yoga',
        'Photographie', 'Art', 'Randonnée', 'Danse', 'Théâtre', 'Mode', 'Gaming',
        'Vélo', 'Natation', 'Méditation', 'Vin', 'Café', 'Animaux', 'Nature',
        'Fitness', 'Couture', 'Peinture', 'Jardinage', 'Concerts', 'Festivals',
    ];

    private array $jobs = [
        'Développeuse web', 'Designer graphique', 'Infirmière', 'Enseignante',
        'Marketing manager', 'Chef de projet', 'Comptable', 'Avocate',
        'Architecte', 'Médecin', 'Journaliste', 'Photographe', 'Artiste',
        'Coiffeuse', 'Esthéticienne', 'Coach sportive', 'Étudiante',
        'Entrepreneure', 'Consultante', 'RH', 'Community manager',
        'Chef cuisinière', 'Ingénieure', 'Pharmacienne', 'Psychologue',
    ];

    private array $bioTemplates = [
        "🌈 Vie simple, rires garantis ! J'adore {interest1}, {interest2} et partager de bons moments. Cherche quelqu'un avec qui construire quelque chose de vrai.",
        'Passionnée de {interest1} et {interest2}. À la recherche de connexions authentiques. 💕',
        "{job} de {age} ans qui aime profiter de la vie. Fan de {interest1}, {interest2} et {interest3}. Let's grab a coffee? ☕",
        "Amoureuse de {interest1} et {interest2}. Je cherche quelqu'un de sincère et drôle. La vie est trop courte pour ne pas être soi-même ! ✨",
        '🎨 Créative, spontanée et toujours partante pour une aventure. {interest1} et {interest2} sont mes passions. Et toi ?',
        '{job} passionnée. Grande fan de {interest1}, {interest2} et {interest3}. Recherche ma complice de vie. 💫',
        "Douce et déterminée. J'aime {interest1}, {interest2} et les discussions qui durent jusqu'au petit matin. ☕",
        "Aventurière dans l'âme ! {interest1} et {interest2} sont mon oxygène. Cherche quelqu'un pour partager des moments uniques. 🌍",
    ];

    public function run(): void
    {
        $this->command->info('🌈 Création de données de démo pour LesbiLibre...');

        // Create main demo user
        $mainUser = User::firstOrCreate(
            ['email' => 'demo@lesbi.fr'],
            [
                'name' => 'Emma Martin',
                'pseudo' => 'emma_demo',
                'password' => 'password',
                'email_verified_at' => now(),
                'is_verified' => true,
                'gems' => 500,
                'is_premium' => true,
                'premium_expires_at' => now()->addMonths(3),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $mainUser->id],
            [
                'bio' => '🎨 Designer graphique passionnée. J\'adore voyager, la photographie et découvrir de nouveaux endroits. À la recherche de connexions authentiques et de belles rencontres.',
                'date_of_birth' => now()->subYears(28)->format('Y-m-d'),
                'age' => 28,
                'city' => 'Paris',
                'postal_code' => '75001',
                'country' => 'France',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'sexual_orientation' => 'lesbian',
                'relationship_status' => 'single',
                'occupation' => 'Designer graphique',
                'education' => 'Master',
                'interests' => ['Voyages', 'Photographie', 'Art', 'Cinéma', 'Cuisine'],
                'languages' => ['Français', 'Anglais'],
                'height' => '168 cm',
                'smokes' => false,
                'drinks' => true,
                'has_children' => false,
                'wants_children' => false,
            ]
        );

        $this->command->info("✅ Utilisateur principal créé: {$mainUser->email} (mot de passe: password)");

        // Create 60 demo users with profiles
        $this->command->info('👥 Création de 60 profils de démo...');

        $users = collect();

        for ($i = 0; $i < 60; $i++) {
            $firstName = $this->frenchFirstNames[array_rand($this->frenchFirstNames)];
            $age = rand(19, 45);
            $city = $this->frenchCities[array_rand($this->frenchCities)];
            $job = $this->jobs[array_rand($this->jobs)];

            // Random interests
            $userInterests = array_rand(array_flip($this->interests), rand(3, 6));
            if (! is_array($userInterests)) {
                $userInterests = [$userInterests];
            }

            // Generate bio
            $bioTemplate = $this->bioTemplates[array_rand($this->bioTemplates)];
            $bio = str_replace(
                ['{age}', '{interest1}', '{interest2}', '{interest3}', '{job}'],
                [
                    $age,
                    $userInterests[0] ?? 'voyages',
                    $userInterests[1] ?? 'lecture',
                    $userInterests[2] ?? 'sport',
                    strtolower($job),
                ],
                $bioTemplate
            );

            $uniqueId = strtolower($firstName).$i;
            $user = User::create([
                'name' => $firstName,
                'pseudo' => $uniqueId,
                'email' => $uniqueId.'@demo.fr',
                'password' => 'password',
                'email_verified_at' => now(),
                'is_verified' => rand(0, 100) > 30, // 70% verified
                'gems' => rand(0, 200),
                'is_premium' => rand(0, 100) > 70, // 30% premium
                'premium_expires_at' => rand(0, 100) > 70 ? now()->addMonths(rand(1, 6)) : null,
                'last_login_at' => rand(0, 100) > 40 ? now()->subMinutes(rand(1, 1440)) : now()->subDays(rand(1, 30)),
            ]);

            Profile::create([
                'user_id' => $user->id,
                'bio' => $bio,
                'date_of_birth' => now()->subYears($age)->format('Y-m-d'),
                'age' => $age,
                'city' => $city,
                'postal_code' => rand(10000, 99999),
                'country' => 'France',
                'latitude' => 48.8566 + (rand(-500, 500) / 100),
                'longitude' => 2.3522 + (rand(-500, 500) / 100),
                'sexual_orientation' => collect(['lesbian', 'bisexual', 'pansexual', 'queer'])->random(),
                'relationship_status' => collect(['single', 'in_relationship', 'complicated', 'open'])->random(),
                'occupation' => $job,
                'education' => collect(['Bac', 'Licence', 'Master', 'Doctorat'])->random(),
                'interests' => $userInterests,
                'languages' => collect(['Français', 'Anglais', 'Espagnol', 'Italien', 'Allemand'])->random(rand(1, 3))->values()->toArray(),
                'height' => rand(155, 185).' cm',
                'smokes' => rand(0, 100) > 70,
                'drinks' => rand(0, 100) > 30,
                'has_children' => rand(0, 100) > 80,
                'wants_children' => rand(0, 100) > 50,
            ]);

            $users->push($user);

            if (($i + 1) % 10 === 0) {
                $count = $i + 1;
                $this->command->info("  ✓ {$count} profils créés...");
            }
        }

        $this->command->info('✅ 60 profils créés avec succès !');

        // Create likes (80 likes)
        $this->command->info('❤️ Création de likes...');
        for ($i = 0; $i < 80; $i++) {
            $liker = $users->random();
            $liked = $users->random();

            if ($liker->id !== $liked->id) {
                Like::firstOrCreate([
                    'user_id' => $liker->id,
                    'liked_user_id' => $liked->id,
                ]);
            }
        }

        // Create matches (20 matches)
        $this->command->info('💕 Création de matches...');
        $matches = collect();
        for ($i = 0; $i < 20; $i++) {
            $user1 = $users->random();
            $user2 = $users->random();

            if ($user1->id !== $user2->id) {
                // Create mutual likes
                Like::firstOrCreate(['user_id' => $user1->id, 'liked_user_id' => $user2->id]);
                Like::firstOrCreate(['user_id' => $user2->id, 'liked_user_id' => $user1->id]);

                // Create match
                $match = UserMatch::firstOrCreate([
                    'user1_id' => min($user1->id, $user2->id),
                    'user2_id' => max($user1->id, $user2->id),
                ], [
                    'matched_at' => now()->subDays(rand(1, 30)),
                ]);

                $matches->push($match);
            }
        }

        // Create conversations with messages for matches
        $this->command->info('💬 Création de conversations et messages...');
        foreach ($matches as $match) {
            $conversation = Conversation::create([
                'user1_id' => $match->user1_id,
                'user2_id' => $match->user2_id,
                'last_message_at' => now()->subHours(rand(1, 72)),
            ]);

            // Create 3-10 messages per conversation
            $messageCount = rand(3, 10);
            $user1 = User::find($match->user1_id);
            $user2 = User::find($match->user2_id);

            $messages = [
                'Salut ! Comment ça va ? 😊',
                'Ça va super bien et toi ?',
                'Ton profil m\'a beaucoup plu !',
                'Merci c\'est gentil ! Le tien aussi 💕',
                'Tu fais quoi dans la vie ?',
                'Je suis {job}. Et toi ?',
                'C\'est intéressant ! Tu es de {city} ?',
                'Oui exactement ! Et toi ?',
                'On pourrait se voir pour prendre un café ? ☕',
                'Avec plaisir ! Quand es-tu disponible ?',
                'Ce weekend ça te va ?',
                'Parfait ! J\'ai hâte 😊',
            ];

            for ($j = 0; $j < $messageCount; $j++) {
                $sender = $j % 2 === 0 ? $user1 : $user2;
                $message = $messages[array_rand($messages)];

                Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $sender->id,
                    'content' => $message,
                    'read_at' => rand(0, 100) > 30 ? now() : null,
                    'created_at' => now()->subHours(rand(1, 72)),
                ]);
            }
        }

        // Create some likes for main user
        $this->command->info('💖 Ajout de likes pour l\'utilisateur principal...');
        for ($i = 0; $i < 15; $i++) {
            $user = $users->random();
            Like::firstOrCreate([
                'user_id' => $user->id,
                'liked_user_id' => $mainUser->id,
            ]);

            // Create notification
            Notification::createNotification(
                $mainUser->id,
                'like',
                'Nouveau like ! 💕',
                "{$user->name} a liké votre profil",
                ['from_user_id' => $user->id]
            );
        }

        // Create a match for main user
        $matchUser = $users->random();
        Like::firstOrCreate(['user_id' => $mainUser->id, 'liked_user_id' => $matchUser->id]);
        Like::firstOrCreate(['user_id' => $matchUser->id, 'liked_user_id' => $mainUser->id]);

        $mainMatch = UserMatch::firstOrCreate([
            'user1_id' => min($mainUser->id, $matchUser->id),
            'user2_id' => max($mainUser->id, $matchUser->id),
        ], [
            'matched_at' => now()->subHours(2),
        ]);

        // Create conversation for main user
        $mainConversation = Conversation::create([
            'user1_id' => $mainUser->id,
            'user2_id' => $matchUser->id,
            'last_message_at' => now()->subMinutes(30),
        ]);

        Message::create([
            'conversation_id' => $mainConversation->id,
            'sender_id' => $matchUser->id,
            'content' => "Salut Emma ! Ton profil m'a beaucoup plu 😊",
            'read_at' => null,
            'created_at' => now()->subMinutes(30),
        ]);

        Notification::createNotification(
            $mainUser->id,
            'match',
            'C\'est un match ! 🎉',
            "Vous avez matché avec {$matchUser->name}",
            ['match_user_id' => $matchUser->id]
        );

        $this->command->newLine();
        $this->command->info('🎉 Données de démo créées avec succès !');
        $this->command->info('');
        $this->command->info('📧 Compte de démo : demo@lesbi.fr');
        $this->command->info('🔑 Mot de passe : password');
        $this->command->info('');
        $this->command->info('📊 Statistiques :');
        $this->command->info('  • 61 utilisateurs (dont 1 compte démo)');
        $this->command->info('  • 80+ likes');
        $this->command->info('  • 20+ matches');
        $this->command->info('  • 20+ conversations avec messages');
        $this->command->info('  • 15 likes pour le compte démo');
    }
}
