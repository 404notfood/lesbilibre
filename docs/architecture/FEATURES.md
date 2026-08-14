# 🌈 Application de Rencontre - Fonctionnalités Complètes

## ✨ Vue d'ensemble

Application de rencontre moderne inspirée de **Once**, **2Meet** et **ExtremeChat**, avec un design élégant en rose/violet et toutes les fonctionnalités d'une plateforme de rencontre professionnelle.

---

## 🎨 Design & Interface

### Menu Latéral Principal

- **Logo et branding** : "Once Dating" avec icône cœur gradienté
- **Compteur de gemmes** : Affichage du solde avec bouton d'achat rapide
- **Navigation principale** :
    - 👥 Personnes (découverte)
    - 💬 Mes Chats (avec compteur de messages non lus)
    - 📊 Activité (notifications, likes, visites)
    - ❤️ Profil (avec progression de complétion)
- **Boutique** : Accès aux cadeaux virtuels
- **Premium** : Upgrade vers l'abonnement Premium
- **Footer** : Liens vers CGU, Confidentialité, FAQ
- **Profil preview** : Avatar + barre de progression du profil

### Thème Visuel

- **Couleurs** : Gradient rose/violet/orange
- **Dark mode** : Support complet
- **Animations** : Transitions fluides, hover effects
- **Responsive** : Adapté mobile, tablette, desktop

---

## 💬 Chat / Messagerie

### Page Chat (Messenger.tsx)

- **Liste des conversations** :
    - Avatar avec indicateur en ligne
    - Aperçu du dernier message
    - Heure du dernier message
    - Badge de messages non lus
    - Recherche dans les conversations

- **Fenêtre de conversation** :
    - Header avec profil de l'autre personne
    - Statut (en ligne / vu il y a X heures)
    - Boutons : appel, vidéo, options
    - Messages avec timestamps
    - Bulles différenciées (envoyé/reçu)
    - Indicateur de lecture (double check)
    - **Alerte d'expiration** : Chronomètre de conversation

- **Zone de saisie** :
    - Cadeaux rapides avec coût en gemmes
    - Boutons : images, GIF, emojis, stickers
    - Champ de texte avec autoFocus
    - Bouton d'envoi

### Système de Cadeaux Virtuels

- 4 cadeaux rapides : ❤️ Cœur, 🌹 Rose, 🎁 Cadeau, 💎 Diamant
- Affichage du coût en gemmes
- Envoi en 1 clic

---

## 📊 Page Activité (Activity/Index.tsx)

### Statistiques en temps réel

- **Cards de stats** :
    - ❤️ Likes reçus (avec tendance +12%)
    - 👁️ Visites de profil (avec tendance +8%)
    - ⭐ Matches (nombre total)
    - 💬 Messages échangés

### Timeline d'activité

- **Onglets de filtre** : Tout, Likes, Visites, Matches
- **Fil d'activité** :
    - Avatar de l'utilisateur
    - Type d'interaction (icône colorée)
    - Message descriptif
    - Temps écoulé (formaté en français)
    - Bouton "Discuter" pour les matches

### Temple de la Renommée

- **Classement** des membres les plus populaires
- **Badges spéciaux** :
    - 👑 Couronne pour le 1er
    - 🏆 Trophée pour le 2ème
    - ⭐ Étoile pour le 3ème
- Nombre de likes affichés
- Lien vers les profils

---

## 🎁 Boutique (Shop/Index.tsx)

### Onglet Cadeaux Virtuels

**Solde de gemmes** affiché en haut avec bouton de recharge

**4 catégories de cadeaux** :

1. **💕 Romantique**
    - ❤️ Cœur (10 gemmes) - Populaire
    - 💕 Deux Cœurs (15 gemmes)
    - 🌹 Rose (20 gemmes) - Populaire
    - 💐 Bouquet (50 gemmes)

2. **💎 Luxe**
    - 💍 Bague (100 gemmes)
    - 💎 Diamant (150 gemmes) - Populaire
    - 👑 Couronne (200 gemmes)

3. **🎉 Fun**
    - 🎁 Cadeau (30 gemmes)
    - 🍰 Gâteau (25 gemmes)
    - 🍷 Champagne (40 gemmes)
    - 🎈 Ballon (15 gemmes)

4. **✨ Spécial**
    - ⭐ Étoile (35 gemmes)
    - 🔥 Flamme (45 gemmes)
    - 💫 Étoile Filante (75 gemmes) - Populaire

**Chaque carte de cadeau** :

- Emoji géant
- Nom du cadeau
- Prix en gemmes
- Badge "Populaire" si applicable
- Bouton "Envoyer" (désactivé si pas assez de gemmes)

### Onglet Acheter des Gemmes

**5 packs de gemmes** :

1. 100 gemmes → 4.99€
2. 250 gemmes + 50 bonus → 9.99€
3. 500 gemmes + 100 bonus → 19.99€ **MEILLEURE OFFRE**
4. 1000 gemmes + 250 bonus → 34.99€
5. 2500 gemmes + 750 bonus → 79.99€

**Avantages Premium** affichés :

- ✅ Envoie des cadeaux virtuels
- ✅ Booste ta visibilité
- ✅ Accès prioritaire
- ✅ Démarque-toi des autres

**Paiement** : 🔒 100% sécurisé (Stripe, PayPal, CB)

---

## 🔍 Recherche Avancée (Search/Index.tsx)

### Filtres de recherche

- **Ville** : Champ texte libre
- **Âge** : Min et Max (18+)
- **Distance** : Rayon en km
- **Orientation sexuelle** : Lesbienne, Bi, Pan, Queer, En questionnement
- **Statut relationnel** : Célibataire, En couple, Mariée, Divorcée, Veuve
- **Options** : Avec photo, En ligne/Hors ligne

### Résultats de recherche

- **Cartes de profil** :
    - Photo principale ou initiales
    - Badge "Vérifiée" si applicable
    - Nom, âge
    - Ville + icône
    - Bio (3 lignes max)
    - Bouton "J'aime"

### Filtres rapides

- Près de moi
- En ligne
- Nouveaux profils
- Avec photos

---

## 👤 Profil Utilisateur (Profile/View.tsx)

### Section Principale

- **Photo de profil** grande taille
- **Badge "Vérifiée"** si applicable
- **Nom, âge, ville**

### Match Score 🎵

- **Carte spéciale** avec icône Musique
- **Bouton** "Vérifier le Match Score"
- Une fois cliqué :
    - Barre de progression animée
    - Score de 70-100% affiché
    - Explication : "Compatibilité musicale et centres d'intérêt"

### Actions

- **❤️ J'aime** (ou "Ne plus aimer")
- **💬 Envoyer un message** (si match)
- **🎁 Envoyer un cadeau**

### Détails du Profil

- **À propos** : Bio complète
- **Informations personnelles** :
    - ❤️ Orientation sexuelle
    - 👥 Statut relationnel
    - 💼 Profession
    - 🎓 Éducation

- **Centres d'intérêt** : Tags colorés
- **Langues parlées** : Liste avec badges

### Galerie Photos

- Grille 3 colonnes
- Photos carrées
- Cliquable

### Actions de sécurité

- 🛡️ Bloquer
- 🚩 Signaler

---

## 👑 Premium (Premium/Index.tsx)

### Hero Section

- Icône couronne dorée géante
- Titre gradient "Passe Premium"
- Garantie 30 jours satisfait ou remboursé

### 8 Fonctionnalités Premium

1. 👁️ **Voir qui te like** - Découvre tous tes admirateurs
2. ♾️ **Likes illimités** - Like sans restriction
3. ⚡ **Boost de visibilité** - Profil vu 10x plus
4. 💬 **Messages prioritaires** - En tête de file
5. ⭐ **Badge Premium** - Distinction visible
6. 📈 **Stats avancées** - Analytics complets
7. 🎁 **Bonus gemmes** - +100 gemmes/mois
8. 🛡️ **Navigation privée** - Mode incognito

### 3 Plans d'abonnement

1. **1 mois** → 19.99€/mois
2. **3 mois** → 44.99€ (14.99€/mois) **LE PLUS POPULAIRE** -25%
3. **6 mois** → 69.99€ (11.66€/mois) -42%

### Social Proof

- ⭐⭐⭐⭐⭐ 5 étoiles
- 10,000+ membres Premium
- Témoignage client
- +300% de matches
- 72% des couples via Premium

### Garanties

- ✅ 100% sécurisé
- ✅ Sans engagement
- ✅ Annulation en 1 clic

---

## 🎯 Découverte / Dashboard (dashboard.tsx)

### Barre de recherche

- Champ de recherche par nom/ville
- Bouton filtres avancés

### Filtres rapides (badges)

- Près de moi
- En ligne
- Nouveaux profils
- Avec photos

### Grille de profils

- **Cartes de profil** :
    - Photo ou avatar gradient
    - Badge "En ligne" animé
    - Nombre de photos
    - Nom, âge
    - Ville + distance
    - Bio (2 lignes)
    - Actions : ❌ Passer / ❤️ Liker

### Bouton "Voir plus de profils"

---

## 📱 Sidebar Droite (Personnes Près de Toi)

- Liste de 5 utilisateurs en ligne/proches
- Avatar + indicateur en ligne
- Nom, âge
- Distance
- Icône cœur au survol
- Bouton "Voir tous les profils"

---

## 🛠️ Fonctionnalités Techniques

### Architecture

- **Framework** : Laravel 12 + Inertia.js v2 + React 19
- **Styling** : Tailwind CSS v4 + shadcn/ui
- **Icons** : Lucide React
- **Dates** : date-fns avec locale française
- **Build** : Vite + HMR (Hot Module Replacement)

### Composants UI Utilisés

- Avatar
- Badge
- Button
- Card
- Checkbox
- Dialog
- Input
- Label
- Select
- Separator
- Skeleton
- Tabs
- Tooltip

### Gradients & Couleurs

- **Primary** : Rose/Violet (oklch)
- **Accent** : Violet vif
- **Amber** : Orange pour gemmes
- **Success** : Vert pour matches
- **Dark mode** : Tons violets profonds

### Animations

- Transitions fluides
- Hover effects (scale, shadow)
- Skeleton loading
- Heartbeat animation
- Progress bar animée
- Shimmer effect

---

## 🚀 Démarrage

```bash
# Démarrer le serveur de développement
composer run dev

# Accès
- Laravel: http://127.0.0.1:8000
- Vite HMR: http://localhost:5173
```

### URLs Disponibles

- `/` - Page d'accueil
- `/dashboard` - Découverte de profils
- `/conversations` - Liste des chats
- `/conversations/{id}` - Chat avec une personne
- `/activity` - Page d'activité
- `/shop` - Boutique de cadeaux et gemmes
- `/search` - Recherche avancée
- `/profile/{id}` - Voir un profil
- `/profile/edit` - Éditer son profil
- `/premium` - Page d'abonnement Premium

---

## 📦 Images Disponibles

Les images suivantes ont été copiées dans `/public/images/` :

- `logo.png`
- `logo2.png`
- `messagerie.webp`
- `private_gallery.webp`
- `splash.png`
- `splash2.png`
- `splash3.png`
- `video_chat.webp`

---

## 🎨 Styles Personnalisés

### Classes Utilitaires

- `.btn-gradient` - Bouton avec gradient animé
- `.glass-card` - Effet de verre avec blur
- `.status-online` - Badge en ligne
- `.animate-heartbeat` - Animation de cœur
- `.match-glow` - Effet de glow pour matches
- `.profile-card` - Carte de profil avec overlay
- `.message-sent` / `.message-received` - Bulles de chat
- `.shimmer` - Effet de chargement
- `.hero-gradient` - Gradient de fond

### Variables CSS

- Couleurs personnalisées pour thème de rencontre
- Support dark mode complet
- Radius personnalisés
- Sidebar avec teintes rose/violet

---

## 📋 TODO Backend (à implémenter côté Laravel)

### Modèles

- `User` - Utilisateurs
- `Profile` - Profils détaillés
- `Photo` - Photos des utilisateurs
- `Message` - Messages de chat
- `Conversation` - Conversations
- `Like` - Likes entre utilisateurs
- `Match` - Matches confirmés
- `Gift` - Cadeaux virtuels
- `GemTransaction` - Transactions de gemmes
- `Subscription` - Abonnements Premium
- `Activity` - Historique d'activité
- `Block` - Utilisateurs bloqués
- `Report` - Signalements

### Routes à créer

- Likes : POST `/likes/{userId}`, DELETE `/likes/{userId}`
- Conversations : GET/POST `/conversations`, POST `/conversations/{id}/messages`
- Cadeaux : POST `/gifts/send`
- Gemmes : POST `/gems/purchase`
- Premium : POST `/premium/subscribe`
- Blocage : POST `/block/{userId}`
- Signalement : POST `/report/{userId}`

### Fonctionnalités Backend

- Système de matching bidirectionnel
- Notifications en temps réel (Pusher/WebSockets)
- Géolocalisation pour distance
- Système de gemmes et paiements (Stripe)
- Abonnements Premium
- Modération de contenu
- Système de blocage/signalement
- Expiration de conversations
- Match Score (algorithme de compatibilité)

---

## ✅ Résumé des Pages Créées

1. ✅ **Layout Principal** (`dating-layout.tsx`) - Menu complet avec gemmes
2. ✅ **Dashboard** (`dashboard.tsx`) - Découverte de profils
3. ✅ **Messenger** (`Chat/Messenger.tsx`) - Chat complet avec liste + conversation
4. ✅ **Activité** (`Activity/Index.tsx`) - Stats, timeline, Temple de la Renommée
5. ✅ **Boutique** (`Shop/Index.tsx`) - Cadeaux virtuels + Achats de gemmes
6. ✅ **Recherche** (`Search/Index.tsx`) - Filtres avancés + Résultats
7. ✅ **Profil** (`Profile/View.tsx`) - Profil complet avec Match Score
8. ✅ **Premium** (`Premium/Index.tsx`) - Page d'abonnement avec 3 plans

---

## 🎉 Conclusion

L'application est **100% fonctionnelle côté frontend** avec :

- ✨ Design moderne et attractif
- 💬 Chat complet avec cadeaux
- 📊 Système d'activité et notifications
- 🎁 Boutique de gemmes et cadeaux
- 🔍 Recherche avancée
- 👤 Profils détaillés avec Match Score
- 👑 Système Premium complet
- 🎨 Dark mode et responsive
- ⚡ Performance optimale avec Vite HMR

**Prochaines étapes** : Implémenter le backend Laravel avec les modèles, routes et contrôleurs correspondants.
