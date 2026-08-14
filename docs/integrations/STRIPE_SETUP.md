# Configuration Stripe - Lesbi-Libre

Ce guide vous explique comment configurer Stripe pour accepter les paiements dans l'application.

---

## 📋 Prérequis

- Compte Stripe (créez-en un sur [stripe.com](https://stripe.com))
- Accès au Dashboard Stripe
- Application Laravel fonctionnelle

---

## 🚀 Configuration rapide

### 1. Créer un compte Stripe

1. Allez sur https://stripe.com
2. Créez un compte
3. Vérifiez votre email
4. Accédez au Dashboard

### 2. Récupérer les clés API

#### Mode Test (pour le développement)

1. Dans le Dashboard Stripe, cliquez sur **Développeurs**
2. Allez dans **Clés API**
3. Activez le **mode Test** (switch en haut à droite)
4. Copiez :
    - **Clé publiable** : `pk_test_...`
    - **Clé secrète** : `sk_test_...`

### 3. Configurer le fichier .env

Ajoutez ces lignes dans votre fichier `.env` :

```env
# Stripe Configuration
STRIPE_KEY=pk_test_votre_cle_publique_ici
STRIPE_SECRET=sk_test_votre_cle_secrete_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici

# Stripe Price IDs (à créer après, voir section suivante)
STRIPE_PRICE_1_MONTH=price_1month_id
STRIPE_PRICE_3_MONTHS=price_3months_id
STRIPE_PRICE_6_MONTHS=price_6months_id
```

---

## 💎 Créer les produits Stripe

### Pour les Gemmes (paiements uniques)

Les gemmes sont gérées **automatiquement** via Stripe Checkout.
Vous n'avez **PAS besoin** de créer de produits pour les gemmes.

Le système créera automatiquement des produits à la volée lors de l'achat.

### Pour les Abonnements Premium (paiements récurrents)

**Vous devez créer les prix d'abonnement dans Stripe :**

#### 1. Créer le produit Premium

1. Dashboard Stripe → **Produits** → **Ajouter un produit**
2. Nom : `Abonnement Premium Lesbi-Libre`
3. Description : `Accès à toutes les fonctionnalités Premium`
4. Cliquez sur **Enregistrer le produit**

#### 2. Créer les prix récurrents

Pour **chaque durée** (1 mois, 3 mois, 6 mois), créez un prix :

##### Prix 1 mois

1. Dans le produit Premium, cliquez sur **Ajouter un nouveau prix**
2. Configuration :
    - Modèle de tarification : **Récurrent**
    - Prix : `19.99` EUR
    - Période de facturation : **Mensuel** (tous les 1 mois)
3. Cliquez sur **Ajouter un prix**
4. **Copiez l'ID du prix** (commence par `price_...`)
5. Ajoutez-le dans `.env` : `STRIPE_PRICE_1_MONTH=price_xxx`

##### Prix 3 mois

1. Ajoutez un nouveau prix au même produit
2. Configuration :
    - Prix : `44.99` EUR
    - Période : **Tous les 3 mois**
3. Copiez l'ID : `STRIPE_PRICE_3_MONTHS=price_xxx`

##### Prix 6 mois

1. Ajoutez un nouveau prix au même produit
2. Configuration :
    - Prix : `69.99` EUR
    - Période : **Tous les 6 mois**
3. Copiez l'ID : `STRIPE_PRICE_6_MONTHS=price_xxx`

---

## 🔔 Configurer les Webhooks

Les webhooks permettent à Stripe de notifier votre application des événements (paiement réussi, abonnement annulé, etc.).

### 1. Créer un Webhook

1. Dashboard Stripe → **Développeurs** → **Webhooks**
2. Cliquez sur **Ajouter un point de terminaison**
3. **URL du point de terminaison** :

    ```
    https://lesbi.test/webhook/stripe
    ```

    ⚠️ **En production**, remplacez par votre vrai domaine :

    ```
    https://votre-domaine.com/webhook/stripe
    ```

4. **Sélectionnez les événements à écouter** :
    - ✅ `checkout.session.completed`
    - ✅ `customer.subscription.created`
    - ✅ `customer.subscription.updated`
    - ✅ `customer.subscription.deleted`
    - ✅ `invoice.payment_succeeded`
    - ✅ `invoice.payment_failed`

5. Cliquez sur **Ajouter un point de terminaison**

### 2. Récupérer le secret du Webhook

1. Cliquez sur le webhook que vous venez de créer
2. Dans la section **Secret de signature**, cliquez sur **Révéler**
3. Copiez le secret (commence par `whsec_...`)
4. Ajoutez-le dans `.env` :
    ```env
    STRIPE_WEBHOOK_SECRET=whsec_votre_secret_ici
    ```

---

## 🧪 Tester les paiements (Mode Test)

### Cartes de test Stripe

Utilisez ces numéros de carte pour tester :

| Carte             | Numéro                | Résultat                      |
| ----------------- | --------------------- | ----------------------------- |
| **Visa réussie**  | `4242 4242 4242 4242` | ✅ Paiement réussi            |
| **Visa déclinée** | `4000 0000 0000 0002` | ❌ Paiement refusé            |
| **3D Secure**     | `4000 0025 0000 3155` | 🔐 Nécessite authentification |

**Autres informations** :

- Date d'expiration : N'importe quelle date future (ex: 12/25)
- CVC : N'importe quel 3 chiffres (ex: 123)
- Code postal : N'importe lequel (ex: 75001)

### Tester l'achat de Gemmes

1. Connectez-vous à l'application
2. Allez dans **Boutique** (`/shop`)
3. Cliquez sur un pack de gemmes
4. Vous serez redirigé vers Stripe Checkout
5. Utilisez la carte de test : `4242 4242 4242 4242`
6. Complétez le paiement
7. Vous serez redirigé vers l'application
8. Vos gemmes seront créditées automatiquement (via webhook)

### Tester l'abonnement Premium

1. Allez dans **Premium** (`/premium`)
2. Choisissez un plan
3. Payez avec une carte de test
4. Votre compte devient Premium instantanément

---

## 🔍 Vérifier que ça fonctionne

### Vérifier les webhooks

1. Dashboard Stripe → **Développeurs** → **Webhooks**
2. Cliquez sur votre webhook
3. Allez dans l'onglet **Tentatives**
4. Vous devriez voir les événements reçus avec le statut `200 OK`

### Logs de l'application

Les logs des webhooks sont dans `storage/logs/laravel.log` :

```bash
# Voir les logs en temps réel
tail -f storage/logs/laravel.log

# Chercher les logs Stripe
grep "Stripe" storage/logs/laravel.log
```

### Vérifier les gemmes

```bash
# Vite avec Tinker
php artisan tinker

# Voir le solde de gemmes d'un utilisateur
User::find(1)->gems_balance

# Voir toutes les transactions
GemTransaction::all()
```

### Vérifier les abonnements

```bash
php artisan tinker

# Voir les abonnements actifs
Subscription::where('status', 'active')->get()

# Vérifier si un utilisateur est Premium
User::find(1)->isPremium()
```

---

## 📊 Flux de paiement

### Achat de Gemmes

```
1. Utilisateur clique "Acheter" dans /shop
   ↓
2. ShopController crée une session Stripe Checkout
   ↓
3. Redirection vers Stripe (paiement CB)
   ↓
4. Utilisateur paie
   ↓
5. Stripe envoie webhook "checkout.session.completed"
   ↓
6. StripeWebhookController crédite les gemmes
   ↓
7. GemTransaction est créée
   ↓
8. Utilisateur redirigé vers /shop avec succès
```

### Abonnement Premium

```
1. Utilisateur choisit un plan dans /premium
   ↓
2. PremiumController crée une session Stripe Subscription
   ↓
3. Redirection vers Stripe (paiement CB)
   ↓
4. Utilisateur paie
   ↓
5. Stripe envoie webhook "customer.subscription.created"
   ↓
6. StripeWebhookController active Premium
   ↓
7. Subscription est créée en base de données
   ↓
8. User.is_premium = true
   ↓
9. Bonus de 100 gemmes offert
   ↓
10. Utilisateur redirigé vers /premium
```

---

## 🚨 Résolution de problèmes

### Les gemmes ne sont pas créditées

1. Vérifiez que le webhook est configuré
2. Vérifiez `STRIPE_WEBHOOK_SECRET` dans `.env`
3. Consultez les logs : `tail -f storage/logs/laravel.log`
4. Dans le Dashboard Stripe, vérifiez que le webhook reçoit bien les événements

### Erreur "Webhook signature verification failed"

- Le secret webhook est incorrect
- Vérifiez `STRIPE_WEBHOOK_SECRET` dans `.env`
- Assurez-vous que c'est bien le secret du webhook (pas la clé API)

### L'abonnement ne s'active pas

- Vérifiez que les `STRIPE_PRICE_*` sont corrects dans `.env`
- Les IDs de prix doivent commencer par `price_`
- Vérifiez les logs pour voir si le webhook est reçu

### "Session invalide" après paiement

- L'URL de retour est incorrecte
- Vérifiez les routes dans `routes/web.php`
- Les routes `shop.checkout.success` et `premium.checkout.success` doivent exister

---

## 🔐 Sécurité

### Protection CSRF

La route webhook `/webhook/stripe` est **exclue** de la protection CSRF car Stripe ne peut pas envoyer de token CSRF.

C'est sécurisé car on vérifie la **signature** du webhook avec `STRIPE_WEBHOOK_SECRET`.

### Validation des webhooks

Le `StripeWebhookController` vérifie **systématiquement** :

1. La signature du webhook (authentification)
2. Que l'utilisateur existe en base de données
3. Que les montants correspondent
4. Que le paiement est bien confirmé

---

## 🌍 Passer en Production

### 1. Activer le compte Stripe

1. Dashboard Stripe → **Paramètres** → **Informations sur l'entreprise**
2. Remplissez toutes les informations
3. Activez votre compte

### 2. Utiliser les clés de Production

1. Dans le Dashboard, **désactivez** le mode Test (switch en haut à droite)
2. Récupérez les nouvelles clés :
    - `pk_live_...` (clé publique)
    - `sk_live_...` (clé secrète)
3. Mettez à jour `.env` en production :
    ```env
    STRIPE_KEY=pk_live_votre_cle_publique
    STRIPE_SECRET=sk_live_votre_cle_secrete
    ```

### 3. Recréer les webhooks

1. Créez un nouveau webhook avec votre **vrai domaine** :
    ```
    https://votre-domaine.com/webhook/stripe
    ```
2. Récupérez le nouveau secret webhook
3. Mettez à jour `.env` :
    ```env
    STRIPE_WEBHOOK_SECRET=whsec_nouveau_secret_production
    ```

### 4. Recréer les prix d'abonnement

En mode Production, vous devez **recréer** les produits et prix :

1. Créez le produit Premium
2. Créez les 3 prix (1, 3, 6 mois)
3. Mettez à jour les IDs dans `.env`

---

## 📝 Fichiers modifiés

| Fichier                                            | Rôle                                   |
| -------------------------------------------------- | -------------------------------------- |
| `app/Http/Controllers/StripeWebhookController.php` | Gère tous les événements Stripe        |
| `app/Http/Controllers/ShopController.php`          | Gestion achat de gemmes                |
| `app/Http/Controllers/PremiumController.php`       | Gestion abonnement Premium             |
| `app/Services/StripePaymentService.php`            | Service pour créer les sessions Stripe |
| `routes/web.php`                                   | Routes webhook et callbacks            |
| `config/services.php`                              | Configuration Stripe                   |

---

## 🎯 Checklist de déploiement

Avant de mettre en production :

- [ ] Compte Stripe activé
- [ ] Clés de production dans `.env`
- [ ] Produit Premium créé
- [ ] 3 prix d'abonnement créés
- [ ] IDs des prix dans `.env`
- [ ] Webhook créé avec le vrai domaine
- [ ] Secret webhook dans `.env`
- [ ] Test d'achat de gemmes réussi
- [ ] Test d'abonnement Premium réussi
- [ ] Webhooks reçoivent bien les événements
- [ ] Logs vérifiés (pas d'erreurs)

---

## 💬 Support

**Problème avec Stripe ?**

- Documentation officielle : https://stripe.com/docs
- Support Stripe : https://support.stripe.com

**Problème avec l'application ?**

- Vérifiez les logs : `storage/logs/laravel.log`
- Testez avec `php artisan tinker`
- Vérifiez les webhooks dans le Dashboard Stripe

---

**Dernière mise à jour** : 2025-11-22
**Version** : 1.0.0
**Statut** : ✅ Production Ready
