# Système de Design - LesbiLibre

## Vue d'ensemble

Ce document décrit le système de design créé pour la plateforme de rencontre LesbiLibre. Le design met l'accent sur l'authenticité, la chaleur et la modernité avec une palette de couleurs roses/violets élégante.

---

## 🎨 Palette de Couleurs

### Mode Clair

#### Couleurs Principales

- **Primary** : `oklch(0.55 0.22 320)` - Rose/violet signature
- **Secondary** : `oklch(0.95 0.04 320)` - Rose pâle doux
- **Accent** : `oklch(0.65 0.25 290)` - Violet vif pour actions importantes
- **Success** : `oklch(0.65 0.18 145)` - Vert pour matches et confirmations
- **Destructive** : `oklch(0.55 0.22 15)` - Rouge-rose pour suppressions

#### Couleurs de Fond

- **Background** : `oklch(0.99 0.005 280)` - Fond légèrement teinté
- **Card** : `oklch(1 0 0)` - Blanc pur pour les cartes
- **Muted** : `oklch(0.96 0.01 280)` - Gris teinté

#### Couleurs de Bordure

- **Border** : `oklch(0.92 0.01 280)`
- **Input** : `oklch(0.95 0.01 280)`
- **Ring** : `oklch(0.55 0.22 320)` - Focus avec couleur primaire

### Mode Sombre

#### Couleurs Principales

- **Primary** : `oklch(0.7 0.25 320)` - Rose/violet plus clair
- **Secondary** : `oklch(0.22 0.04 300)` - Violet foncé
- **Accent** : `oklch(0.75 0.28 290)` - Violet lumineux
- **Success** : `oklch(0.6 0.2 145)` - Vert adapté
- **Destructive** : `oklch(0.5 0.25 15)` - Rouge-rose foncé

#### Couleurs de Fond

- **Background** : `oklch(0.12 0.02 280)` - Fond sombre avec teinte violette
- **Card** : `oklch(0.16 0.02 280)` - Cards légèrement plus claires
- **Muted** : `oklch(0.2 0.02 280)` - Gris foncé teinté

---

## 📐 Espacements et Tailles

### Border Radius

- **Standard** : `0.75rem` (12px)
- **Large (lg)** : `var(--radius)` = 0.75rem
- **Medium (md)** : `calc(var(--radius) - 2px)` = 0.625rem
- **Small (sm)** : `calc(var(--radius) - 4px)` = 0.5rem

---

## 🎯 Composants Personnalisés

### Classes Utilitaires

#### `.btn-gradient`

Bouton avec gradient animé pour les CTA principaux

```css
- Gradient : from-primary via-accent to-primary
- Hover : shadow-lg + scale-105
- Transition : 300ms
```

#### `.glass-card`

Carte avec effet de verre (glassmorphism)

```css
- Background : bg-card/80
- Backdrop blur : backdrop-blur-lg
- Border : border-border/50
- Shadow : shadow-lg shadow-primary/5
```

#### `.profile-card`

Carte de profil avec hover élégant et overlay gradient

```css
- Hover : scale-[1.02] + shadow-xl
- Overlay gradient : from-black/60 via-black/20 to-transparent
```

#### `.match-glow`

Effet de brillance pour les matches

```css
- Box-shadow : 0 0 20px oklch(0.7 0.25 320 / 0.5)
```

### Messages

#### `.message-sent`

Bulle de message envoyé

```css
- Background : bg-primary
- Text : text-primary-foreground
- Border-radius : rounded-2xl rounded-br-sm (coin coupé)
- Width : max-w-[70%]
- Align : ml-auto (à droite)
```

#### `.message-received`

Bulle de message reçu

```css
- Background : bg-muted
- Text : text-foreground
- Border-radius : rounded-2xl rounded-bl-sm (coin coupé)
- Width : max-w-[70%]
- Align : mr-auto (à gauche)
```

### Animations

#### `@keyframes heartbeat`

Animation de battement de cœur pour les likes

```css
0%, 100% : scale(1)
10%, 30% : scale(0.9)
20%, 40%, 60%, 80% : scale(1.1)
50%, 70% : scale(1.05)
Duration : 1.3s ease-in-out infinite
```

#### `@keyframes shimmer`

Effet de chargement shimmer

```css
0% : background-position -1000px 0
100% : background-position 1000px 0
Duration : 2s linear infinite
```

#### `.status-online::after`

Indicateur de statut en ligne

```css
- Position : absolute bottom-0 right-0
- Size : w-3 h-3
- Background : bg-success
- Border : 2px border-background
- Shape : rounded-full
```

### Layouts

#### `.container-responsive`

Container responsive avec padding adaptatif

```css
- Width : w-full
- Max-width : 1400px
- Padding : px-4 sm:px-6 lg:px-8
- Margin : mx-auto
```

#### `.hero-gradient`

Fond gradient pour sections hero

```css
- Gradient : from-primary/10 via-accent/5 to-secondary/10
```

---

## 🧩 Composants React Créés

### ProfileCard

Carte de profil utilisateur avec toutes les fonctionnalités

**Props :**

- `user` : Données utilisateur (id, name, age, city, bio, photos, etc.)
- `onLike` : Callback pour liker
- `onMessage` : Callback pour message
- `compact` : Mode compact (boolean)

**Fonctionnalités :**

- Badge de vérification
- Indicateur "En ligne" animé
- Affichage distance et localisation
- Centres d'intérêt (badges)
- Boutons Like et Message
- Shimmer loading pour images
- Hover élégant avec overlay gradient

### MatchModal

Modal de célébration de match

**Props :**

- `show` : Afficher/masquer
- `matchedUser` : Utilisateur matché
- `currentUser` : Utilisateur courant
- `onClose` : Callback fermeture

**Fonctionnalités :**

- Confetti animé (500 particules)
- Photos des deux utilisateurs avec cœur central
- Animation heartbeat sur le cœur
- Glow effect sur les photos
- Boutons "Envoyer un message" et "Continuer à swiper"

### ChatBubble

Bulle de message pour le chat

**Props :**

- `message` : Données du message (id, content, created_at, is_read)
- `isSent` : Message envoyé ou reçu
- `showAvatar` : Afficher l'avatar
- `avatarUrl` : URL de l'avatar

**Fonctionnalités :**

- Formatage intelligent de la date (Aujourd'hui, Hier, Date)
- Indicateurs de lecture (Check simple / Double check)
- Styles différents selon envoyé/reçu
- Support texte multilignes
- Timestamps

---

## 📄 Pages Créées

### Home Page (`/pages/home.tsx`)

**Sections :**

1. **Header/Navbar**
    - Logo avec gradient
    - Navigation (Fonctionnalités, Comment ça marche)
    - Boutons Connexion/S'inscrire

2. **Hero Section**
    - Badge "Plateforme 100% féminine"
    - Titre avec gradient animé
    - Description
    - CTA "Commencer gratuitement"
    - Stats en temps réel (Membres, Actifs, Matches)
    - Illustration placeholder

3. **Features Section**
    - 4 cartes de fonctionnalités :
        - Sécurisé et Vérifié (Shield)
        - Matching Intelligent (Heart)
        - Chat en Temps Réel (MessageCircle)
        - Communauté Active (Users)

4. **How It Works Section**
    - 3 étapes avec numérotation :
        1. Créez votre profil
        2. Découvrez des profils
        3. Connectez-vous
    - Timeline avec flèches entre les étapes

5. **CTA Section**
    - Glass card avec gradient
    - Appel à l'action final

6. **Footer**
    - Logo et copyright
    - Liens : À propos, Confidentialité, Conditions, Contact

---

## 🎨 Scrollbar Personnalisée

```css
::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

::-webkit-scrollbar-track {
    @apply bg-muted;
}

::-webkit-scrollbar-thumb {
    @apply rounded-lg bg-muted-foreground/30 hover:bg-muted-foreground/50;
}
```

---

## 📱 Responsive Design

### Breakpoints Tailwind

- **sm** : 640px
- **md** : 768px
- **lg** : 1024px
- **xl** : 1280px
- **2xl** : 1536px

### Approche Mobile-First

Tous les composants sont conçus mobile-first avec des adaptations progressives pour tablettes et desktop.

### Exemples

```tsx
// Stack vertical sur mobile, horizontal sur desktop
<div className="flex flex-col md:flex-row gap-4">

// Grid 1 colonne sur mobile, 2 sur tablette, 4 sur desktop
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

// Padding adaptatif
<div className="px-4 sm:px-6 lg:px-8">

// Texte responsive
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
```

---

## 🔤 Typographie

### Police

- **Font-family** : 'Instrument Sans' (variable font)
- **Font-features** : 'cv11', 'ss01'
- **Font-variation** : 'opsz' 32
- **Antialiasing** : Activé

### Hiérarchie

- **Titre Hero** : text-4xl md:text-5xl lg:text-6xl font-bold
- **Titre Section** : text-3xl md:text-4xl font-bold
- **Titre Card** : text-xl font-semibold
- **Body** : text-base
- **Small** : text-sm
- **Tiny** : text-xs

---

## 🌈 Gradients Utilisés

### Gradients de Texte

```tsx
className =
    'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent';
```

### Gradients de Fond

```tsx
// Hero
className = 'bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10';

// Boutons
className = 'bg-gradient-to-r from-primary via-accent to-primary';

// Icons containers
className = 'bg-gradient-to-br from-primary to-accent';
```

### Overlay Gradient (Profile Cards)

```tsx
className = 'bg-gradient-to-t from-black/60 via-black/20 to-transparent';
```

---

## ✅ Prochaines Étapes

Pour compléter le design, voici ce qui pourrait être ajouté :

1. **Pages supplémentaires**
    - Dashboard utilisateur
    - Page profil détaillée
    - Page de recherche/découverte
    - Page chat complète
    - Paramètres utilisateur

2. **Composants additionnels**
    - Swipe cards (Tinder-like)
    - Notifications toast
    - Skeleton loaders
    - Empty states
    - Error states

3. **Fonctionnalités avancées**
    - Filtres de recherche
    - Upload de photos
    - Vérification d'identité UI
    - Système de badges/achievements

4. **Animations**
    - Page transitions (Inertia)
    - Micro-interactions
    - Loading states

---

## 📦 Dépendances Ajoutées

```json
{
    "react-confetti": "^6.x", // Pour modal de match
    "date-fns": "^4.x", // Pour formatage dates
    "lucide-react": "^0.475" // Icons (déjà présent)
}
```

---

## 🚀 Commandes de Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Compiler pour production
npm run build

# Build avec SSR
npm run build:ssr

# Formater le code
npm run format

# Vérifier le formatage
npm run format:check

# Linter
npm run lint

# Vérification TypeScript
npm run types
```

---

## 🎯 Principes de Design Appliqués

1. **Cohérence** : Utilisation systématique des couleurs et espacements définis
2. **Accessibilité** : Contraste suffisant, focus states, support clavier
3. **Performance** : Lazy loading images, optimisation animations
4. **Responsive** : Mobile-first, testable sur tous devices
5. **Moderne** : Glassmorphism, gradients, animations subtiles
6. **Bienveillant** : Couleurs chaleureuses, langage inclusif
7. **Feedback** : États de chargement, success/error states, animations

---

**Document créé le** : 1er novembre 2025
**Version** : 1.0
**Auteur** : Claude Code
