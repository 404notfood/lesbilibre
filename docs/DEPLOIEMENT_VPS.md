# Déploiement VPS LesbiLibre

Le VPS de préproduction est l'environnement de référence. Il utilise PHP 8.4 et le projet attend Node.js 24 pour le build et le rendu Inertia SSR.

## Variables de préproduction

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://steff.404notfood.fr
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr
SEO_INDEXING_ENABLED=false
INERTIA_SSR_ENABLED=true
SUPPORT_EMAIL=adresse-support-reelle@example.com
```

`SEO_INDEXING_ENABLED` doit rester à `false` tant que le domaine est une préproduction. Sur le domaine définitif seulement, passer la valeur à `true`, renseigner `INDEXNOW_KEY`, puis relancer les caches.

## Mise à jour de l'application

Depuis `~/web/steff.404notfood.fr/public_html/site` :

```bash
php artisan down --retry=30
composer install --no-dev --optimize-autoloader
npm ci
npm run build:ssr
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan up
```

Le build SSR produit le bundle sous `bootstrap/ssr/` (actuellement `ssr.js`). Sans processus SSR actif, Inertia revient au rendu navigateur, mais les contenus publics sont moins immédiatement accessibles aux robots et le premier affichage est moins rapide.

## Services utilisateur systemd

Les exemples se trouvent dans `deploy/systemd`. Ils utilisent `%h`, donc aucun chemin `/home/notfood` n'est écrit en dur.

```bash
mkdir -p ~/.config/systemd/user
cp deploy/systemd/lesbilibre-ssr.service ~/.config/systemd/user/
cp deploy/systemd/lesbilibre-queue.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now lesbilibre-ssr lesbilibre-queue
systemctl --user status lesbilibre-ssr lesbilibre-queue
```

Si les services utilisateur ne persistent pas après déconnexion, l'administrateur du VPS doit activer le *linger* pour l'utilisateur :

```bash
sudo loginctl enable-linger notfood
```

Après chaque déploiement :

```bash
systemctl --user restart lesbilibre-ssr lesbilibre-queue
php artisan inertia:check-ssr
```

## Contrôles préproduction

```bash
curl -I https://steff.404notfood.fr/
curl -s https://steff.404notfood.fr/robots.txt
curl -s https://steff.404notfood.fr/sitemap.xml | head
php artisan queue:monitor default
```

La préproduction doit renvoyer `X-Robots-Tag: noindex, nofollow, noarchive` et son `robots.txt` doit contenir `Disallow: /`.

## Passage au domaine définitif

1. Mettre à jour `APP_URL` et `SUPPORT_EMAIL`.
2. Configurer une redirection HTTP 301 de l'ancien domaine vers le nouveau.
3. Passer `SEO_INDEXING_ENABLED=true`.
4. Exécuter `php artisan optimize:clear && php artisan config:cache && php artisan route:cache`.
5. Vérifier les canonicales, `robots.txt`, `sitemap.xml` et les données structurées.
6. Soumettre le sitemap à Google Search Console et Bing Webmaster Tools.
7. Si `INDEXNOW_KEY` est configurée, exécuter `php artisan seo:indexnow`.
