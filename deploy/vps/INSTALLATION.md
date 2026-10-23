# Installation LesbiLibre — lesbi-libre.fr

Préparation du 22 octobre 2026 à partir de https://404notfood.fr/generateur/project.html,
version déclarée 1.3.0. Le compte Linux et le certificat s'appellent `lesbilibre`.
Le domaine est `lesbi-libre.fr`, l'e-mail Let's Encrypt `contact@lesbi-libre.fr`.
L'état réel du VPS et ses DNS n'ont pas été vérifiés depuis ce poste.

## Contenu

- `lesbilibre-config.json` : configuration complète importable avec le bouton **Importer** du générateur.
- `settings.json` : choix propres à ce projet, sans secrets.
- `install.sh`, `nginx.conf.template`, `manifest.json`, `README.md` : sorties originales du générateur.
- `deploy.sh`, `application.nginx` : compléments Laravel Inertia SSR, Reverb, modération et PWA.
- `lesbilibre-app.tar.gz` : sources suivies par Git, sans `.env` privés, dépendances, base ni médias utilisateurs.
- `SHA256SUMS` : empreintes des fichiers livrés.

Utiliser **`deploy.sh`** pour installer cette application avec ses compléments.
Importer le JSON dans le site ne génère que le socle : les compléments restent dans ce dossier.
Le ZIP contient des sources et doit être conservé dans un emplacement privé.

## 1. Préparer le serveur et les DNS

Un VPS **Debian 13 déjà installé avec le bootstrap de ce générateur** est requis.
Ce bundle n'installe pas le socle serveur. Celui-ci doit fournir Nginx, MariaDB,
Redis, PHP 8.4 FPM, Composer, Certbot, OpenSSH, logrotate et Node 24 via
`/opt/nvm/node-24/node`. Prévoir plusieurs Go de RAM et d'espace disque pour
PyTorch, le modèle d'images et le build React ; les ressources effectives restent à vérifier.

Ajouter les dépendances applicatives sur le VPS :

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg python3-venv python3-pip curl php8.4-gd php8.4-bcmath php8.4-intl php8.4-zip php8.4-redis
```

Faire pointer le DNS **A** de `lesbi-libre.fr` vers l'IPv4 du VPS.
Si un **AAAA** existe, il doit pointer vers une IPv6 réellement présente sur le VPS.
Le générateur refuse les adresses DNS absentes des interfaces locales : un proxy
CDN doit donc être désactivé pendant cette installation. Les ports publics 80 et
443 doivent être accessibles ; conserver l'accès SSH administrateur.
Les ports 13714, 18000 et 18080 restent privés. Aucun alias `www` n'est demandé au certificat.

## 2. Transférer et contrôler le bundle

Décompresser `lesbilibre-installation.zip` dans `/root/lesbilibre-installation` sur le VPS,
puis, dans une console administrateur :

```bash
sudo -i
cd /root/lesbilibre-installation
sha256sum --check SHA256SUMS
bash ./deploy.sh --preflight
bash ./deploy.sh --provision
```

Le provisionnement crée le compte, Nginx, le certificat et une base MariaDB dédiée.
Le script demande de définir le mot de passe SFTP dans la console. Les secrets DB
et Redis sont créés sur le VPS. À ce stade, une réponse HTTP 503 est normale.

## 3. Installer une nouvelle application

Pour une **base neuve**, extraire les sources dans le dossier créé. Le compte
`lesbilibre` ne peut normalement pas lire `/root` : transmettre l'archive via
l'entrée standard depuis la console root :

```bash
cat ./lesbilibre-app.tar.gz | sudo -u lesbilibre tar -xzf - -C /home/lesbilibre/app
bash ./deploy.sh
```

Le script installe Composer/npm, construit React et SSR, installe la modération
Python CPU et précharge son modèle. Il lance les migrations **sur la base dédiée**,
puis active Redis, deux workers avec un timeout de 600 s, le scheduler,
SSR, Reverb et la modération. `retry_after=660` évite une remise en file avant
l'expiration d'un traitement vidéo. Le premier téléchargement du modèle peut être long.

Après le déploiement et les migrations, initialiser les catalogues et le vrai
compte administrateur sous le compte projet :

```bash
sudo -u lesbilibre bash /home/lesbilibre/app/deploy/vps/init-production.sh
```

Le script demande un mot de passe masqué de 24 caractères minimum. En
production, `db:seed` utilise `ProductionSeeder`, sans Faker ni profils fictifs.

Si Hugging Face refuse le téléchargement avec HTTP 429, suivre
[`RECUPERATION_MODELE.md`](RECUPERATION_MODELE.md) pour transférer le modèle
public préchargé, sans créer de compte. Le service utilise ensuite le cache
hors ligne et ne télécharge rien lors du classement des photos.

Pour reprendre une installation interrompue, relancer la même commande. Les
configurations système modifiées manuellement sont refusées par le registre du générateur.
Ne pas retirer ce contrôle ou forcer la réécriture du registre sans examiner les différences.

Si une reprise s'arrête sur une ancienne valeur non sensible de `.env` (par
exemple `SUPPORT_EMAIL`, `MAIL_FROM_ADDRESS` ou `MODERATION_SERVICE_URL`), le
script `align-production-env.py` applique les paramètres de cette installation
en une fois. Il sauvegarde d'abord le fichier en mode privé, conserve les
secrets et copie la clé publique Reverb vers la variable du build navigateur.
L'exécuter explicitement avant de reprendre :

```bash
sudo -u lesbilibre python3 ./align-production-env.py
sudo -u lesbilibre /usr/bin/php8.4 /home/lesbilibre/app/artisan config:clear
sudo bash ./deploy.sh
```

## 4. Migration d'un site existant

Ne pas appliquer la procédure « base neuve » comme une migration de données.
Sauvegarder la base, `storage/app`, les secrets et surtout **APP_KEY** de l'ancien
site, puis prévoir un arrêt des écritures lors du transfert. Ne jamais créer une
nouvelle APP_KEY pour des données déjà chiffrées avec l'ancienne.

Un `.env` de développement copié tel quel sera refusé : APP_ENV, URL, DB, Redis
et queue doivent correspondre à la nouvelle infrastructure. Les secrets externes
SMTP/Stripe/VAPID et l'APP_KEY doivent être transférés séparément sur le VPS,
sans les inclure dans cette archive. Les données et fichiers utilisateurs ne
sont **pas** contenus dans `lesbilibre-app.tar.gz`.

## 5. Compléter avant ouverture publique

Le fichier `/home/lesbilibre/app/.env` est créé par le script et reste privé.

- **SMTP** : `MAIL_MAILER=log` initialement ; aucun mail réel n'est envoyé.
  Renseigner le transport SMTP et ses identifiants. L'adresse de contact fournie
  ne crée pas automatiquement une boîte mail.
- **Stripe** : renseigner les clés, le secret webhook et les Price IDs de production
  selon `docs/integrations/STRIPE_SETUP.md`. Les clés de test d'exemple sont vidées
  sur une installation neuve. Ne pas activer des paiements sans ces réglages.
- **Web Push** : générer les clés avec `vendor/bin/web-push generate-keys` puis
  renseigner `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY`.
- **SEO** : `SEO_INDEXING_ENABLED=false` pendant la validation. Passer à `true`
  lors de l'ouverture du domaine définitif ; renseigner `INDEXNOW_KEY` si utilisé.
  Le déploiement et `align-production-env.py` conservent désormais ce choix
  lorsqu'il existe déjà. Le local et les nouvelles installations restent en `false`.
- **Sauvegardes** : prévoir une sauvegarde MariaDB, `storage/app` et une copie
  privée de l'APP_KEY hors du VPS. L'option automatique du générateur est réservée
  à PostgreSQL et n'est donc pas activée ici.

Après modification des paramètres de production :

```bash
sudo -u lesbilibre /usr/bin/php8.4 /home/lesbilibre/app/artisan config:cache
sudo systemctl restart lesbilibre-queue@1 lesbilibre-queue@2 lesbilibre-reverb lesbilibre-moderation lesbilibre-ssr
```

Si une variable `VITE_*` change, reconstruire les assets sous le compte projet
avec Node 24 et `npm run build:ssr`, puis redémarrer SSR.

## 6. Contrôler l'installation

Pour ouvrir le référencement, modifier le `.env` du VPS (`/home/lesbilibre/app/.env`) :
`APP_URL=https://lesbi-libre.fr` et `SEO_INDEXING_ENABLED=true`, puis exécuter
`config:cache` avec la commande ci-dessus. Ne pas créer de `public/robots.txt` :
`SeoController` génère `/robots.txt` et `/sitemap.xml` à partir de cette configuration.

Après transfert des corrections du code, reconstruire avec `npm run build:ssr`,
vider les vues compilées (`php artisan view:clear`) et redémarrer `lesbilibre-ssr`.
Pour la configuration Nginx, mettre aussi à jour le fichier
`/etc/vps-projects/lesbilibre/application.nginx` depuis `deploy/vps/application.nginx`,
puis valider avec `sudo nginx -t` avant `sudo systemctl reload nginx`.
Le préchargement HTTP est limité à cinq ressources ; le complément Nginx réserve
16 Ko pour les en-têtes FastCGI. En cas de 502, vérifier
`/var/log/nginx/lesbilibre-error.log` pour confirmer ou écarter
`upstream sent too big header` avant toute autre modification.

Les accès directs à `/login` et `/register` doivent répondre 200, même sans
navigation préalable. Sur les pages publiques, attendre `X-Robots-Tag: index, follow`,
une seule balise `title`, une seule URL canonique et un JSON-LD dont la clé
`@context` vaut `https://schema.org`. `/login` et les espaces membres restent `noindex`.
Le robots public doit autoriser l'exploration et référencer le sitemap. Soumettre
ensuite ce sitemap dans Google Search Console et demander l'inspection de l'accueil.

Le domaine `www` est absent de cette configuration. Pour le prendre en charge,
prévoir son DNS, un certificat qui le couvre et une redirection HTTPS 301 vers
`https://lesbi-libre.fr`. Une redirection seule ne corrige pas un certificat invalide.

```bash
systemctl --no-pager status lesbilibre-queue@1 lesbilibre-queue@2 lesbilibre-scheduler.timer lesbilibre-ssr lesbilibre-reverb lesbilibre-moderation
sudo -u lesbilibre /usr/bin/php8.4 /home/lesbilibre/app/artisan migrate:status
sudo -u lesbilibre /usr/bin/php8.4 /home/lesbilibre/app/artisan inertia:check-ssr
curl --fail http://127.0.0.1:18000/health
curl -I https://lesbi-libre.fr/
curl --fail -o /dev/null https://lesbi-libre.fr/login
curl --fail -o /dev/null https://lesbi-libre.fr/register
curl https://lesbi-libre.fr/robots.txt
curl --fail https://lesbi-libre.fr/sitemap.xml
curl -I https://lesbi-libre.fr/manifest.json
curl -I https://lesbi-libre.fr/sw.js
journalctl -u lesbilibre-reverb -u lesbilibre-moderation -n 50 --no-pager
```

Vérifier aussi les envois de mails, une conversation entre deux comptes, une
notification, un upload photo/vidéo et un paiement de test dans l'environnement
Stripe adapté. Le préflight local et les contrôles statiques ne prouvent pas un
déploiement réel : seul le lancement et ces essais sur le VPS le confirment.
