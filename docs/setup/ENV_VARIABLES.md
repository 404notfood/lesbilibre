# Variables d'environnement - Lesbi-Libre

Ce document liste toutes les variables d'environnement utilisées dans l'application avec leurs descriptions.

## Application

### APP_NAME

- **Description:** Nom de l'application affiché dans les emails, titres de pages, etc.
- **Valeur par défaut:** `Lesbi-Libre`
- **Requis:** Oui

### APP_ENV

- **Description:** Environnement d'exécution de l'application
- **Valeurs possibles:** `local`, `staging`, `production`
- **Valeur par défaut:** `local`
- **Requis:** Oui

### APP_KEY

- **Description:** Clé de chiffrement de l'application (générez avec `php artisan key:generate`)
- **Format:** `base64:...`
- **Requis:** Oui
- **Sécurité:** 🔴 CRITIQUE - Ne jamais exposer publiquement

### APP_DEBUG

- **Description:** Active le mode debug (affiche les erreurs détaillées)
- **Valeurs:** `true` ou `false`
- **Valeur par défaut:** `true` (local), `false` (production)
- **Requis:** Oui
- **⚠️ ATTENTION:** TOUJOURS à `false` en production

### APP_URL

- **Description:** URL de base de l'application
- **Exemples:**
    - Local: `http://localhost:8000`
    - Staging: `https://staging.lesbi-libre.com`
    - Production: `https://lesbi-libre.com`
- **Requis:** Oui

---

## Base de données

### DB_CONNECTION

- **Description:** Type de base de données
- **Valeurs possibles:** `mysql`, `pgsql`, `sqlite`
- **Valeur par défaut:** `mysql`
- **Requis:** Oui

### DB_HOST

- **Description:** Hôte de la base de données
- **Exemples:** `127.0.0.1`, `localhost`, `db.example.com`
- **Requis:** Oui

### DB_PORT

- **Description:** Port de la base de données
- **Valeur par défaut:** `3306` (MySQL), `5432` (PostgreSQL)
- **Requis:** Oui

### DB_DATABASE

- **Description:** Nom de la base de données
- **Exemple:** `lesbi`
- **Requis:** Oui

### DB_USERNAME

- **Description:** Utilisateur de la base de données
- **Exemple:** `root`, `lesbi_user`
- **Requis:** Oui

### DB_PASSWORD

- **Description:** Mot de passe de la base de données
- **Requis:** Oui (peut être vide en local)
- **Sécurité:** 🔴 CRITIQUE

---

## Cache & Sessions

### CACHE_STORE

- **Description:** Driver de cache
- **Valeurs possibles:** `file`, `redis`, `memcached`, `database`
- **Valeur par défaut:** `database`
- **Recommandé production:** `redis`

### SESSION_DRIVER

- **Description:** Driver de sessions
- **Valeurs possibles:** `file`, `cookie`, `database`, `redis`
- **Valeur par défaut:** `file`
- **Recommandé production:** `redis` ou `database`

### SESSION_LIFETIME

- **Description:** Durée de vie des sessions en minutes
- **Valeur par défaut:** `120` (2 heures)

### REDIS_HOST

- **Description:** Hôte Redis (si utilisé)
- **Valeur par défaut:** `127.0.0.1`

### REDIS_PORT

- **Description:** Port Redis
- **Valeur par défaut:** `6379`

---

## Email

### MAIL_MAILER

- **Description:** Service d'envoi d'emails
- **Valeurs possibles:** `smtp`, `sendmail`, `mailgun`, `ses`, `log`
- **Valeur par défaut:** `log` (enregistre les emails au lieu de les envoyer)
- **Production:** `smtp` ou service tiers

### MAIL_HOST

- **Description:** Serveur SMTP
- **Exemples:**
    - Gmail: `smtp.gmail.com`
    - Mailgun: `smtp.mailgun.org`
    - SendGrid: `smtp.sendgrid.net`

### MAIL_PORT

- **Description:** Port SMTP
- **Valeurs courantes:**
    - `587` (TLS)
    - `465` (SSL)
    - `25` (non sécurisé)

### MAIL_USERNAME

- **Description:** Identifiant SMTP
- **Exemple:** `votre-email@gmail.com`

### MAIL_PASSWORD

- **Description:** Mot de passe SMTP ou API key
- **Sécurité:** 🔴 CRITIQUE
- **Note Gmail:** Utilisez un "App Password", pas votre mot de passe principal

### MAIL_ENCRYPTION

- **Description:** Type de chiffrement
- **Valeurs:** `tls`, `ssl`, `null`
- **Recommandé:** `tls`

### MAIL_FROM_ADDRESS

- **Description:** Adresse email d'envoi
- **Exemple:** `noreply@lesbi-libre.com`
- **Requis:** Oui

### MAIL_FROM_NAME

- **Description:** Nom de l'expéditeur
- **Valeur par défaut:** `${APP_NAME}`

---

## Paiements Stripe

### STRIPE_KEY

- **Description:** Clé publique Stripe (utilisée côté client)
- **Format:** `pk_test_...` (test) ou `pk_live_...` (production)
- **Obtenir:** https://dashboard.stripe.com/apikeys
- **Requis:** Oui pour les paiements
- **Sécurité:** 🟡 Publique (peut être exposée côté client)

### STRIPE_SECRET

- **Description:** Clé secrète Stripe (utilisée côté serveur)
- **Format:** `sk_test_...` (test) ou `sk_live_...` (production)
- **Obtenir:** https://dashboard.stripe.com/apikeys
- **Requis:** Oui pour les paiements
- **Sécurité:** 🔴 CRITIQUE - Ne JAMAIS exposer côté client

### STRIPE_WEBHOOK_SECRET

- **Description:** Secret de signature des webhooks Stripe
- **Format:** `whsec_...`
- **Obtenir:** https://dashboard.stripe.com/webhooks
- **Requis:** Oui pour traiter les webhooks
- **Sécurité:** 🔴 CRITIQUE
- **Note:** Utilisez des secrets différents pour test et production

---

## WebSockets / Broadcasting (Laravel Reverb)

### BROADCAST_CONNECTION

- **Description:** Driver de broadcasting
- **Valeurs:** `log`, `reverb`, `pusher`, `redis`
- **Valeur par défaut:** `log`
- **Production:** `reverb` (recommandé Laravel 12)

### REVERB_APP_ID

- **Description:** ID de l'application Reverb
- **Requis:** Si `BROADCAST_CONNECTION=reverb`

### REVERB_APP_KEY

- **Description:** Clé publique Reverb
- **Requis:** Si `BROADCAST_CONNECTION=reverb`

### REVERB_APP_SECRET

- **Description:** Clé secrète Reverb
- **Requis:** Si `BROADCAST_CONNECTION=reverb`
- **Sécurité:** 🔴 CRITIQUE

### REVERB_HOST

- **Description:** Hôte du serveur Reverb
- **Exemples:** `localhost`, `reverb.lesbi-libre.com`
- **Valeur par défaut:** `localhost`

### REVERB_PORT

- **Description:** Port du serveur Reverb
- **Valeur par défaut:** `8080`

### REVERB_SCHEME

- **Description:** Protocole de connexion
- **Valeurs:** `http`, `https`
- **Valeur par défaut:** `http`
- **Production:** `https`

---

## Queue (Files d'attente)

### QUEUE_CONNECTION

- **Description:** Driver de queue pour les tâches asynchrones
- **Valeurs possibles:** `sync`, `database`, `redis`, `sqs`
- **Valeur par défaut:** `database`
- **Recommandé production:** `redis` ou `database`
- **Note:** `sync` = exécution immédiate (pas de queue)

---

## Vite (Frontend)

### VITE_APP_NAME

- **Description:** Nom de l'app accessible côté frontend
- **Valeur:** `${APP_NAME}`

### VITE*REVERB*\*

- **Description:** Variables Reverb exposées au frontend
- **Note:** Préfixez toutes les variables frontend avec `VITE_`
- **Sécurité:** 🟡 Publiques (seront dans le bundle JS)

---

## Sécurité & Best Practices

### 🔴 Variables CRITIQUES - Ne JAMAIS exposer

- `APP_KEY`
- `DB_PASSWORD`
- `STRIPE_SECRET`
- `STRIPE_WEBHOOK_SECRET`
- `REVERB_APP_SECRET`
- `MAIL_PASSWORD`
- Toutes les clés API secrètes

### 🟡 Variables PUBLIQUES - Peuvent être exposées

- `VITE_*` (toutes les variables Vite)
- `STRIPE_KEY` (clé publique Stripe)
- `APP_NAME`
- `APP_URL` (si public)

### ✅ Checklist sécurité production

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] Clés Stripe en mode `live`
- [ ] `MAIL_MAILER` configuré (pas `log`)
- [ ] `CACHE_STORE=redis` ou équivalent performant
- [ ] `SESSION_DRIVER=redis` ou `database`
- [ ] `QUEUE_CONNECTION=redis` ou `database`
- [ ] HTTPS activé (`APP_URL=https://...`)
- [ ] Backups réguliers de la base de données
- [ ] Secrets complexes et uniques pour chaque environnement

---

## Commandes utiles

### Générer une nouvelle clé d'application

```bash
php artisan key:generate
```

### Vérifier les variables d'environnement chargées

```bash
php artisan tinker
>>> config('app.name')
>>> config('database.connections.mysql')
```

### Clear les caches de configuration

```bash
php artisan config:clear
php artisan cache:clear
```

### Cache la configuration (production)

```bash
php artisan config:cache
```

---

## Environnements

### Local (.env)

- Debug activé
- Logs détaillés
- Mail en mode `log`
- Cache/Queue en mode `sync` ou `database`

### Staging (.env.staging)

- Debug désactivé
- Même config que production mais avec données de test
- Stripe en mode test
- Domaine staging

### Production (.env.production)

- `APP_DEBUG=false`
- `APP_ENV=production`
- Cache/Queue optimisés (Redis)
- Stripe en mode live
- HTTPS obligatoire
- Monitoring et alertes activés

---

**Dernière mise à jour:** 29 décembre 2025
