# Correctifs PHP du 22 octobre 2026

Cette archive ne contient ni `.env`, ni dépendances, ni migrations, ni données.
Elle corrige les trois erreurs identifiées dans le journal de production :

- `/activity` : les likes sont comptés par une sous-requête Eloquent, sans
  agrégation partielle de `users.*` incompatible avec `ONLY_FULL_GROUP_BY`.
- `/user/confirm-password` : le mot de passe du compte connecté est contrôlé
  directement ; aucune colonne `login` n'est recherchée. Les mots de passe
  incorrects ou absents restent refusés, et la confirmation ne déclenche pas
  une nouvelle notification de connexion.
- `db:seed --force` : en environnement production, seuls les catalogues et
  l'administrateur de production sont initialisés. Aucun Faker ni faux profil.

Transférer `lesbilibre-correctifs.tar` dans `/tmp/lesbilibre`. Depuis le compte
`lesbilibre` dans `/home/lesbilibre/app`, sauvegarder les fichiers actuels puis
extraire le correctif et rafraîchir les caches :

```bash
cd /home/lesbilibre/app &&
mkdir -p "$HOME/backups" &&
(umask 077; tar -cf "$HOME/backups/php-before-$(date -u +%Y%m%dT%H%M%SZ).tar" app/Http/Controllers/ActivityController.php app/Providers/FortifyServiceProvider.php database/seeders) &&
tar -xf /tmp/lesbilibre/lesbilibre-correctifs.tar &&
sha256sum --check deploy/vps/SHA256SUMS-CORRECTIFS &&
/usr/bin/php8.4 artisan optimize:clear &&
/usr/bin/php8.4 artisan config:cache &&
/usr/bin/php8.4 artisan route:cache &&
/usr/bin/php8.4 artisan view:cache
```

L'extraction ne lance pas le seeding et ne modifie pas les comptes. Pour
reprendre l'initialisation de production, lancer explicitement :

```bash
bash deploy/vps/init-production.sh
```

Le script demande un e-mail et un mot de passe masqué de 24 caractères minimum.
Il ne stocke pas ce mot de passe dans `.env` et ne l'affiche pas. Un administrateur
existant est conservé. Les deux comptes connus créés au début de `UserSeeder`
(`admin@lesbi-libre.test`/pseudo `steff`, `sophie@test.com`/pseudo `sophie`) sont
désactivés uniquement s'ils ont encore exactement leurs mots de passe de
démonstration. Leurs lignes ne sont pas supprimées. Un compte dont le mot de
passe a été changé n'est pas modifié. L'initialisation est transactionnelle.

Validation : 25 tests applicatifs ciblés réussis (activité, confirmation,
connexion, réglages 2FA, seeding de production). Les cinq tests d'activité ont
également réussi sur MySQL avec `ONLY_FULL_GROUP_BY` activé, dans une base
temporaire isolée supprimée après l'essai. Le site de production
doit encore recevoir l'archive et être retesté après son installation.
