# Stripe Webhook Setup - Lesbi-Libre

**Date:** 29 décembre 2025
**Status:** ✅ Implémenté

---

## 📋 Résumé

Le système de webhooks Stripe permet de traiter automatiquement les événements de paiement (achats de gems, abonnements Premium) de manière fiable et sécurisée.

### Fonctionnalités implémentées

- ✅ Vérification de signature webhook Stripe
- ✅ Enregistrement de tous les événements en base de données
- ✅ Idempotence (gestion des événements dupliqués)
- ✅ Traitement des achats de gems
- ✅ Gestion des abonnements Premium (création, mise à jour, annulation)
- ✅ Gestion des paiements récurrents
- ✅ Gestion des échecs de paiement
- ✅ Logging détaillé des erreurs

---

## 🏗️ Architecture

### Fichiers créés

1. **`app/Http/Controllers/StripeWebhookController.php`**
    - Contrôleur principal pour traiter tous les webhooks Stripe
    - Vérifie les signatures
    - Route les événements vers les handlers appropriés

2. **`app/Models/StripeEvent.php`**
    - Modèle pour enregistrer tous les événements webhook
    - Méthodes utilitaires pour marquer les événements comme traités/échoués

3. **`database/migrations/2025_12_29_201259_create_stripe_events_table.php`**
    - Table pour logger tous les événements webhook reçus
    - Permet de déboguer et rejouer les événements si nécessaire

4. **`database/migrations/2025_12_29_201934_add_stripe_fields_to_subscriptions_table.php`**
    - Ajoute les champs Stripe manquants à la table subscriptions
    - `stripe_subscription_id`, `stripe_customer_id`, `stripe_price_id`, etc.

5. **`tests/Feature/StripeWebhookTest.php`**
    - Tests pour vérifier le bon fonctionnement des webhooks

---

## 📊 Schéma Base de Données

### Table `stripe_events`

```sql
CREATE TABLE stripe_events (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(255) NOT NULL,
    payload JSON NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP NULL,
    error TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX (type),
    INDEX (processed),
    INDEX (created_at)
);
```

**Colonnes:**

- `stripe_event_id`: ID unique de l'événement Stripe (ex: `evt_1234...`)
- `type`: Type d'événement (ex: `checkout.session.completed`)
- `payload`: Contenu complet de l'événement (JSON)
- `processed`: Indique si l'événement a été traité avec succès
- `processed_at`: Date/heure de traitement
- `error`: Message d'erreur si le traitement a échoué

### Champs ajoutés à `subscriptions`

```sql
ALTER TABLE subscriptions ADD COLUMN (
    stripe_subscription_id VARCHAR(255) UNIQUE NULL,
    stripe_customer_id VARCHAR(255) NULL,
    stripe_price_id VARCHAR(255) NULL,
    current_period_start TIMESTAMP NULL,
    current_period_end TIMESTAMP NULL
);
```

---

## 🔐 Configuration

### Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env`:

```env
# Clé publique Stripe (utilisée côté client)
STRIPE_KEY=pk_test_...  # Mode test
# STRIPE_KEY=pk_live_...  # Mode production

# Clé secrète Stripe (utilisée côté serveur)
STRIPE_SECRET=sk_test_...  # Mode test
# STRIPE_SECRET=sk_live_...  # Mode production

# Secret de signature des webhooks
STRIPE_WEBHOOK_SECRET=whsec_...  # Différent pour test et production
```

**🔴 IMPORTANT:**

- Ne JAMAIS exposer `STRIPE_SECRET` et `STRIPE_WEBHOOK_SECRET` publiquement
- Utilisez des clés différentes pour test et production
- Générez un nouveau `STRIPE_WEBHOOK_SECRET` pour chaque environnement

### Configuration dans `config/services.php`

Vérifiez que cette configuration existe:

```php
'stripe' => [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
],
```

---

## 🚀 Déploiement

### 1. Configuration dans Stripe Dashboard

#### Créer un endpoint webhook

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez sur "Add endpoint"
3. Entrez l'URL de votre webhook:
    - **Local (test):** `https://votre-ngrok.ngrok.io/webhook/stripe`
    - **Production:** `https://lesbi-libre.com/webhook/stripe`
4. Sélectionnez les événements à écouter:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
5. Cliquez sur "Add endpoint"
6. **Copiez le "Signing secret" (whsec\_...)** et ajoutez-le dans `.env` comme `STRIPE_WEBHOOK_SECRET`

### 2. Migrations

Exécutez les migrations:

```bash
php artisan migrate
```

Vérifiez que les tables sont créées:

```bash
php artisan db:show
```

### 3. Test en local avec Stripe CLI

#### Installation de Stripe CLI

```bash
# Windows
scoop install stripe

# macOS
brew install stripe/stripe-cli/stripe

# Linux
# Téléchargez depuis https://github.com/stripe/stripe-cli/releases
```

#### Connexion à votre compte Stripe

```bash
stripe login
```

#### Écouter les webhooks en local

```bash
stripe listen --forward-to localhost:8000/webhook/stripe
```

Stripe CLI affichera votre webhook secret temporaire. Copiez-le dans `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Déclencher des événements de test

```bash
# Test checkout completed
stripe trigger checkout.session.completed

# Test subscription created
stripe trigger customer.subscription.created

# Test payment succeeded
stripe trigger invoice.payment_succeeded

# Test payment failed
stripe trigger invoice.payment_failed
```

---

## 🔄 Événements Stripe Gérés

### 1. `checkout.session.completed`

**Déclenché quand:** Un utilisateur termine un achat one-time (gems ou abonnement)

**Actions:**

- Vérifie que l'utilisateur existe
- **Si type = "gems":**
    - Ajoute les gems au solde de l'utilisateur
    - Crée une transaction dans `gem_transactions`
- **Si type = "premium":**
    - Active le statut Premium
    - Crée un enregistrement dans `subscriptions`
    - Donne 100 gems bonus

**Métadonnées requises:**

```json
{
    "type": "gems",
    "gems": 100
}
```

ou

```json
{
    "type": "premium"
}
```

**Code pertinent:** `StripeWebhookController.php:66-114`

---

### 2. `customer.subscription.created`

**Déclenché quand:** Un nouvel abonnement Stripe est créé

**Actions:**

- Crée ou met à jour l'enregistrement dans `subscriptions`
- Active le statut Premium de l'utilisateur
- Définit `premium_until` basé sur `current_period_end`
- Donne 100 gems bonus mensuels

**Métadonnées requises:**

```json
{
    "user_id": 123
}
```

**Code pertinent:** `StripeWebhookController.php:119-163`

---

### 3. `customer.subscription.updated`

**Déclenché quand:** Un abonnement existant est modifié

**Actions:**

- Met à jour le statut de l'abonnement
- Met à jour `current_period_start` et `current_period_end`
- **Si statut = "active":**
    - Active Premium
    - Met à jour `premium_until`
- **Si statut = "canceled", "unpaid", ou "past_due":**
    - Désactive Premium
    - Supprime `premium_until`

**Code pertinent:** `StripeWebhookController.php:168-205`

---

### 4. `customer.subscription.deleted`

**Déclenché quand:** Un abonnement est annulé

**Actions:**

- Met le statut de l'abonnement à "canceled"
- Désactive le statut Premium
- Supprime `premium_until`

**Code pertinent:** `StripeWebhookController.php:210-235`

---

### 5. `invoice.payment_succeeded`

**Déclenché quand:** Un paiement récurrent réussit

**Actions:**

- Ajoute 100 gems bonus pour les utilisateurs Premium
- Enregistre le log du paiement

**Code pertinent:** `StripeWebhookController.php:240-265`

---

### 6. `invoice.payment_failed`

**Déclenché quand:** Un paiement récurrent échoue

**Actions:**

- Envoie une notification à l'utilisateur via `NotificationService`
- Log l'échec du paiement

**Code pertinent:** `StripeWebhookController.php:270-297`

---

## 🔒 Sécurité

### Vérification de signature

Chaque webhook Stripe inclut une signature dans l'en-tête `Stripe-Signature`. Le contrôleur vérifie automatiquement cette signature:

```php
$event = Webhook::constructEvent($payload, $signature, $webhookSecret);
```

**Si la signature est invalide:**

- Retourne HTTP 400
- Log l'erreur
- N'exécute AUCUN traitement

### Idempotence

Le système évite automatiquement de traiter deux fois le même événement:

```php
$stripeEvent = StripeEvent::findOrCreateFromStripeEvent(
    $event->id,
    $event->type,
    json_decode($payload, true)
);

if ($stripeEvent->isProcessed()) {
    return response('Webhook already processed', 200);
}
```

**Avantages:**

- Protection contre les doublons envoyés par Stripe
- Permet de rejouer manuellement les webhooks sans effet de bord

---

## 📝 Logging

### Événements enregistrés

Tous les événements webhook sont enregistrés dans la table `stripe_events`:

```php
// Événement traité avec succès
$stripeEvent->markAsProcessed();

// Événement échoué
$stripeEvent->markAsFailed($errorMessage);
```

### Consulter les événements

```bash
php artisan tinker
```

```php
// Tous les événements
StripeEvent::all();

// Événements non traités
StripeEvent::where('processed', false)->get();

// Événements avec erreurs
StripeEvent::whereNotNull('error')->get();

// Événements d'un certain type
StripeEvent::where('type', 'checkout.session.completed')->get();
```

### Logs Laravel

Les erreurs sont également enregistrées dans les logs Laravel (`storage/logs/laravel.log`):

```php
logger()->error('Stripe webhook processing failed', [
    'event_id' => $event->id,
    'event_type' => $event->type,
    'error' => $errorMessage,
]);
```

---

## 🐛 Déboguer les Webhooks

### 1. Vérifier les événements reçus

```bash
php artisan tinker
```

```php
// Derniers événements
StripeEvent::latest()->take(10)->get();

// Événements avec erreurs
StripeEvent::whereNotNull('error')->latest()->get();
```

### 2. Rejouer un événement manuellement

```bash
stripe events resend evt_1234...
```

Ou via Stripe Dashboard: Webhooks > Event log > Cliquez sur un événement > "Resend event"

### 3. Consulter les logs Stripe

Allez sur https://dashboard.stripe.com/logs pour voir tous les webhooks envoyés et leurs réponses.

### 4. Vérifier la configuration

```bash
php artisan config:show services.stripe
```

### 5. Tester avec Stripe CLI

```bash
# Déclencher un événement spécifique
stripe trigger checkout.session.completed

# Voir les logs en temps réel
stripe listen --forward-to localhost:8000/webhook/stripe --print-json
```

---

## ⚠️ Points d'attention

### 1. Timeouts

Stripe attend une réponse dans les **30 secondes**. Si votre traitement prend plus de temps:

- Retournez HTTP 200 immédiatement
- Enregistrez l'événement
- Traitez l'événement de manière asynchrone avec une queue

**TODO:** Implémenter le traitement asynchrone si nécessaire

### 2. Ordre des événements

Stripe ne garantit PAS l'ordre d'arrivée des événements. Vous pourriez recevoir `subscription.updated` avant `subscription.created`.

**Solution actuelle:** Utilisation de `updateOrCreate()` pour gérer les deux cas

### 3. Événements dupliqués

Stripe peut envoyer le même événement plusieurs fois en cas de timeout réseau.

**Solution:** Le système d'idempotence basé sur `stripe_event_id` empêche le double traitement

### 4. Webhooks en production

En production, assurez-vous que:

- ✅ HTTPS est activé
- ✅ `STRIPE_WEBHOOK_SECRET` est configuré avec la valeur du dashboard production
- ✅ Les événements sont enregistrés dans `stripe_events` pour audit
- ✅ Des alertes sont configurées pour les échecs de webhook

---

## 📈 Monitoring

### Métriques à surveiller

1. **Taux de succès des webhooks**

    ```sql
    SELECT
        COUNT(*) as total,
        SUM(processed) as processed,
        SUM(!processed) as failed
    FROM stripe_events
    WHERE created_at >= NOW() - INTERVAL 24 HOUR;
    ```

2. **Événements échoués récents**

    ```sql
    SELECT type, error, created_at
    FROM stripe_events
    WHERE processed = FALSE
    ORDER BY created_at DESC
    LIMIT 20;
    ```

3. **Types d'événements reçus**
    ```sql
    SELECT type, COUNT(*) as count
    FROM stripe_events
    GROUP BY type
    ORDER BY count DESC;
    ```

### Alertes recommandées

- ⚠️ Webhook avec plus de 5 échecs consécutifs
- ⚠️ Aucun webhook reçu depuis 24h (si abonnements actifs)
- ⚠️ Erreurs de vérification de signature
- ⚠️ Événements non traités depuis plus de 1h

---

## 🔄 Maintenance

### Nettoyer les anciens événements

Les événements webhook peuvent s'accumuler. Nettoyez régulièrement:

```php
// Supprimer les événements traités de plus de 3 mois
StripeEvent::where('processed', true)
    ->where('created_at', '<', now()->subMonths(3))
    ->delete();
```

**Recommandation:** Créez une commande artisan planifiée:

```bash
php artisan make:command CleanupStripeEvents
```

Dans `app/Console/Kernel.php`:

```php
$schedule->command('stripe:cleanup-events')->monthly();
```

---

## 🧪 Tests

### Exécuter les tests

```bash
# Tous les tests webhook
php artisan test --filter=StripeWebhookTest

# Test spécifique
php artisan test --filter=StripeWebhookTest::test_handles_checkout_session_completed_gems_purchase
```

### Tests couverts

- ✅ Rejet des signatures invalides
- ✅ Enregistrement des événements en base
- ✅ Idempotence (gestion des doublons)
- ✅ Achat de gems
- ✅ Création d'abonnement
- ✅ Suppression d'abonnement
- ✅ Paiement récurrent réussi
- ✅ Gestion des erreurs

**Note:** Certains tests nécessitent des ajustements pour les colonnes manquantes dans la table `users` (`gems_balance`, `premium_until`).

---

## 📚 Ressources

### Documentation officielle Stripe

- [Guide Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Événements Stripe](https://stripe.com/docs/api/events/types)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Idempotence](https://stripe.com/docs/webhooks/best-practices#duplicate-events)

### Commandes utiles

```bash
# Lister les événements Stripe
stripe events list

# Voir les détails d'un événement
stripe events retrieve evt_1234...

# Tester localement
stripe listen --forward-to localhost:8000/webhook/stripe

# Déclencher un événement
stripe trigger checkout.session.completed
```

---

## ✅ Checklist de déploiement

Avant de déployer en production:

- [ ] Variables d'environnement Stripe configurées (mode `live`)
- [ ] Webhook endpoint créé dans Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` copié depuis le dashboard
- [ ] Migrations exécutées
- [ ] HTTPS activé sur le domaine
- [ ] Tests manuels avec Stripe CLI effectués
- [ ] Monitoring et alertes configurés
- [ ] Logs accessibles et surveillés
- [ ] Documentation partagée avec l'équipe

---

**Dernière mise à jour:** 29 décembre 2025
**Auteur:** Claude Sonnet 4.5
**Version:** 1.0
