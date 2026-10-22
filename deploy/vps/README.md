# Déploiement — lesbilibre

VPS Project Generator 1.3.0 ; schéma 1. Installation native Debian 13, sans panel ni conteneur.
Le formulaire décrit ce qui est **prévu** ; install.sh ce qui est **généré**. Ni le manifest
ni l'audit du navigateur ne prouvent ce qui est **installé** ou **vérifié** sur le VPS.
Les sources applicatives et les secrets ne sont pas inclus dans ce bundle.

## Paramètres et prérequis

- Compte : lesbilibre ; application : /home/lesbilibre/app ; stack : Laravel + React.
- PHP : 8.4 ; Node : 24 dans /opt/nvm.
- Gestionnaire : npm ; installation/build à la racine du dépôt.
- Configuration : .env ; modèle : .env.example.
- Domaines : lesbi-libre.fr (application).
- Interfaces DB : désactivées.
- Mail : désactivé.

Le bootstrap fournit Nginx, systemd, logrotate, OpenSSL et les runtimes sélectionnés,
les clients/serveurs DB/Redis et Certbot/dig pour HTTPS. Composer est requis pour Laravel.


Le script vérifie Node exact dans le NVM partagé root, sans charger .bashrc ni réinstaller Node.
PHP 8.6 / Node 20 ne sont disponibles que si explicitement confirmés et présents.



Les sources/lockfiles et hooks npm/Composer doivent être fiables : ils s'exécutent
sous le compte projet et peuvent accéder à ses secrets. Le générateur reste entièrement local.

## Préparation et déploiement

Relire install.sh, nginx.conf.template et manifest.json ; préparer DNS A/AAAA, sources, intégrations et sauvegardes.
nginx.conf.template montre le vhost final destiné à /etc/nginx/sites-available/lesbilibre.conf.
install.sh prépare l'hébergement avant de toucher aux sources : compte et espace projet,
SSH/SFTP, pool PHP-FPM, ports réservés et vhost Nginx, certificat HTTPS, puis base et utilisateur DB.
Le certificat est demandé avant le clone et le build. Un échec DNS/Certbot conserve le vhost HTTP et arrête le script ; corriger les DNS et relancer.
Le vhost d'attente conserve les protections, les interfaces sélectionnées et les routes proxy.
La racine applicative répond 503 avant le déploiement ; une route proxy peut répondre 502
tant que son backend n'est pas lancé. Le site est activé après un build réussi.
Le lien /etc/nginx/sites-enabled/lesbilibre.conf est contrôlé dans la configuration chargée par nginx -T.
Ne pas activer manuellement ce modèle avant l'installation : les certificats HTTPS doivent exister
et, en mode port automatique, @APP_PORT@ doit être remplacé par le port attribué dans
/var/lib/vps-projects/lesbilibre/app-port. Le fichier exporté sert à la lecture ; install.sh reste autonome.
Les vhosts mail/webmail sont créés séparément par vps-mail-domain si la messagerie est activée.
Si /home/lesbilibre/app est vide en mode « Déjà présentes », le premier passage termine avec succès
après le provisionnement de l'hébergement et de la base, sans installation ni build.
Copier le contenu du dépôt (fichiers cachés compris, sans dépendances Windows) dans /home/lesbilibre/app,
sous le compte lesbilibre, puis relancer sans option. Conserver groupe www-data / mode 750 sur la racine
et mode 711 sur le home pour la traversée Nginx.

```bash
chmod +x install.sh
sudo ./install.sh --preflight
sudo ./install.sh --provision
# Transférer les sources par SFTP si nécessaire, puis déployer :
sudo ./install.sh
```

--preflight contrôle le socle sans installation/écriture persistante. --provision prépare
l'hébergement jusqu'à la base et son utilisateur, puis termine avec succès pour toute source
(Git, archive ou déjà présentes). Aucun clone, extraction, dépendance, build, worker ou PM2
n'est lancé dans ce mode. Une application déjà en ligne reste servie pendant cette préparation.
Sans option, le même provisionnement précède les sources, .env, la configuration DB/Redis,
l'installation Laravel/Next/PHP et le build ; les workers et PM2 démarrent à la fin.
Redis est préparé après .env : le mode existant lit ses paramètres dans ce fichier.
À la création, .env.example est copié vers .env,
chmod 600. Les variables existantes sont préservées ; une incompatibilité DB/bind arrête
le script. Remplir manuellement les clés fournisseurs et les valeurs signalées, puis relancer.
Ne jamais importer les secrets dans le formulaire/JSON ni les mettre dans argv des hooks.
Accès SFTP : utiliser lesbilibre et le port SSH configuré sur le VPS dans votre client.
Le mot de passe est défini par passwd sur la console du VPS.
Dossier à ouvrir : /home/lesbilibre/app. Le compte dispose aussi d'un shell SSH, sans sudo.
Pour définir le mot de passe séparément : sudo passwd lesbilibre, puis relancer install.sh.
Variables contrôlées : REVERB_APP_KEY, REVERB_APP_SECRET, MODERATION_API_TOKEN, VITE_REVERB_APP_KEY.


Node/npm sont invoqués par chemin exact et PATH explicite sous lesbilibre.
Le shell SSH a son propre PATH. Pour la session courante :
```bash
. /etc/profile.d/vps-nvm.sh
nvm use 24
command -v node npm
node --version && npm --version
```
Le bootstrap corrigé sélectionne aussi sa version par défaut au login ;
--repair-node-path corrige uniquement ce profil sur un socle existant.
npm ci inclut dev et optional ; le lockfile v2/v3 est contrôlé avant installation.
Toutes les variantes natives Lightning CSS/Next/Tailwind déclarées restent dans le lockfile.
Lightning CSS est chargé et transforme du CSS sous le compte applicatif après npm ci.
Une entrée manquante doit être corrigée dans les sources, puis relue et redéployée :
le script ne remplace pas npm ci par une installation non figée et ne désactive aucun test.

Secrets générés sur le VPS : REVERB_APP_KEY, REVERB_APP_SECRET, MODERATION_API_TOKEN.
Les variables NEXT_PUBLIC_* sont chargées **avant npm install/postinstall et le build** ;
elles sont publiques et intégrées aux assets. Une modification nécessite un rebuild.

## Build, données et processus


Laravel : Composer --no-dev, APP_KEY uniquement s'il est vide, storage:link,
config/route/view:cache. Pool PHP-FPM dédié ; Nginx ne sert que public/.
Migrations Laravel : artisan migrate --force sélectionné ; sauvegarder avant exécution.
Queue : 2 worker(s), redis, timeout 600s ; configurer retry_after >= 630s.
Scheduler : artisan schedule:run chaque minute par timer.
Les workers Node supplémentaires ci-dessous sont indépendants de ces options Laravel.



PostgreSQL/MariaDB : mariadb. Ressources limitées à la base lesbilibre.
Mot de passe créé et conservé sur le VPS ; aucune adoption d'une ressource inconnue.
La base et son compte sont créés avant le clone ou l'extraction, sans fichier env requis.
Les variables DB_* sont vérifiées et renseignées ensuite dans .env ; un secret
incompatible est refusé avant toute écriture et n'est jamais remplacé.
Connexion DB_* ; DATABASE_URL automatique désactivée.

Contrôles avant build : aucun script supplémentaire.
Hooks : aucun.

Supervision : systemd ; redémarrage en cas de crash, sortie dans journald.
Processus déclarés : aucun supplémentaire.
Les scripts des processus supplémentaires sont relatifs au dépôt, même si cwd diffère.
TypeScript requiert tsx installé localement à la racine.

Redis : instance dédiée lesbilibre-redis, port 16379–17379 automatique,
AOF everysec, noeviction, limite 256 Mio, secret propre et données shared/redis.

## Nginx, HTTPS et navigateurs

Nginx natif, aucun template de panel : public/ et socket PHP dédié.

Une route prefix-priority (^~) ne doit pas masquer une route SSE regex.
Les routes d'authentification spécifiques précèdent les autres routes API.
Nginx -t avant activation, aucun port applicatif ouvert dans le firewall.
Certbot webroot ; chaque A/AAAA doit pointer vers une interface du VPS. CDN/NAT nécessite une adaptation. Renouvellement via certbot.timer.




Navigateurs : Playwright désactivé, Puppeteer désactivé.
Caches sous ~/.cache du compte applicatif ; chemins dans .env.
Installation et smoke checks sous ce compte, sandbox activé, aucun --no-sandbox.
Si le test échoue, inspecter bibliothèques (ldd), caches/permissions et user namespaces/AppArmor
avant d'assouplir la configuration. Ne jamais valider les navigateurs uniquement sous root.
Pour la génération PDF et les audits réels, tester aussi via l'application après déploiement.

## Sauvegardes, logs et surveillance

Sauvegardes DB automatiques désactivées ; établir un plan adapté aux données du projet.
La sauvegarde ne couvre pas les uploads/données externes à PostgreSQL/env ni un instantané
exact des files Redis. Ajouter leur sauvegarde selon le code et les chemins du projet.
Rotation quotidienne logrotate : 14 rotations, compression, journal de déploiement
et logs applicatifs. Nginx/journald gardent leur politique du bootstrap.
Readiness : désactivée.


Les échecs sont visibles dans journald/systemctl ; aucune notification extérieure n'est
configurée. Brancher la supervision serveur sur ces erreurs et tester les alertes.

## Vérification sur le VPS (lecture et smoke checks, sans installation)

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo systemctl status php8.4-fpm --no-pager
sudo systemctl status lesbilibre-redis --no-pager
sudo systemctl status lesbilibre-queue@1 --no-pager
sudo systemctl status lesbilibre-queue@2 --no-pager
sudo systemctl status lesbilibre-scheduler.timer --no-pager
sudo ss -lntp
sudo logrotate --debug /etc/logrotate.d/vps-project-lesbilibre
curl -I https://lesbi-libre.fr
# Définir un endpoint readiness si nécessaire.



sudo systemctl list-timers --all --no-pager
sudo journalctl -u lesbilibre-monitor.service -n 50 --no-pager
```


Adapter le chemin CLI Prisma si ses dépendances ne sont pas hoistées. Ne pas afficher
pm2 jlist, dump.pm2, env ou les fichiers de mots de passe dans des sorties partagées.
Vérifier auth/session, autres API, progression SSE en direct, audit avec rendu JavaScript,
PDF et workers/scheduler. Les smoke checks du script ne prouvent pas ces parcours métier.
Pour le SaaS SEO actuel, utiliser seo.404notfood.fr : des contrôles du code imposent cette
origine ; le preset ne remplace pas ces exigences ni les clés Stripe/Resend/Google/IA.

## Réexécution et limites

L'hébergement et la base sont préparés avant les sources et le build. --provision permet
de valider cette préparation séparément ; une relance sans option poursuit le déploiement.
Un échec de build conserve les phases validées. Sur un nouveau projet, la racine répond
503 tant que le projet n'est pas déployé ; les routes proxy attendent leurs backends (502 possible).
Une relance conserve le vhost d'un déploiement existant pendant ces préparatifs.
Un échec ultérieur restaure les configurations au dernier état validé ; les sauvegardes sont séparées par phase.
Le journal contient « Étape » et « Étape terminée », puis la dernière étape du rollback ;
/var/lib/vps-projects/lesbilibre/last-stage est conservé après échec. Vhost attendu :
/etc/nginx/sites-enabled/lesbilibre.conf (nom du projet, pas nom du domaine).

Les configurations inconnues/modifiées sont refusées par registre/hash root. .env
et ses secrets existants sont préservés ; sauvegarde privée avant ajout. L'identité lie
stack/runtime/layout/DB/env/supervision : changement structurel = migration manuelle.
Une erreur restaure les configurations gérées et tente de restaurer les services ; elle
n'annule pas comptes, installation PM2/libs, sources/builds, certificats ou migrations.
La rétention ne supprime que des archives valides identifiées dans BACKUP_DIR ; aucun reset DB.
Builds dans app : prévoir une fenêtre de maintenance pour les mises à jour.
Accès SSH/SFTP : configuration limitée à ce compte dans sshd_config.d, validation de la politique effective avant rechargement. Tester une connexion SFTP avec ce compte ; les règles administrateur restent conservées.
Tester le déploiement et sa relance sur Debian 13 avant la production. Le générateur ne
contacte jamais le VPS ; les contrôles locaux ne certifient ni les paquets Linux ni le sandbox.

## Instructions pour Codex

Comparer ce manifest aux sources actuelles : package.json/lockfile, Next config, ecosystem,
Prisma/schema/migrations, scripts deployment/, workers et configuration PHP/Laravel.
Respecter les chemins/env/ports et les besoins du code actuel. Tester Bash/ShellCheck,
Nginx et le déploiement sur Debian 13. Le manifest est une intention, jamais une preuve
d'installation. Garder secrets et commandes applicatives hors de root ; aucun panel requis.
