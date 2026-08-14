# Modération d’images auto-hébergée sur un VPS Hestia

Le service de classification tourne sur le même VPS que Laravel, en écoute locale sur `127.0.0.1:8000`. Il n’a aucun port public, aucun proxy Nginx et aucune exposition Hestia à configurer.

## 1. Prérequis serveur

Connectez-vous en SSH puis installez Python et l’environnement virtuel :

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip
```

Python 3.11 ou 3.12 est recommandé. Vérifiez avec `python3 --version`.

## 2. Installer le service dans le dossier du site

Adaptez `USER` et `DOMAIN` à votre compte Hestia et votre domaine. Le chemin réel dépend de votre installation ; le chemin classique est :

```bash
cd /home/USER/web/DOMAIN/public_html/moderation
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt
```

Le premier démarrage télécharge le modèle dans `.models`. Prévoir environ 1 Go d’espace libre et plusieurs Go de RAM ; sans GPU le premier chargement est plus lent.

## 3. Configurer les secrets

Créez un fichier accessible à root seulement :

```bash
sudo install -d -m 700 /etc/lesbilibre
sudo nano /etc/lesbilibre/moderation.env
sudo chmod 600 /etc/lesbilibre/moderation.env
```

Contenu :

```env
MODERATION_API_TOKEN=genere-un-secret-long-aleatoire
NSFW_MODEL_ID=Falconsai/nsfw_image_detection
IMAGES_ROOT=/home/USER/web/DOMAIN/public_html/storage/app/public
HF_HOME=/home/USER/web/DOMAIN/public_html/moderation/.models
```

Dans le `.env` Laravel, utilisez exactement le même token :

```env
MODERATION_SERVICE_URL=http://127.0.0.1:8000
MODERATION_API_TOKEN=genere-un-secret-long-aleatoire
MODERATION_NSFW_QUARANTINE_THRESHOLD=0.85
QUEUE_CONNECTION=database
```

## 4. Installer systemd

Copiez `moderation/lesbilibre-moderation.service` :

```bash
sudo cp lesbilibre-moderation.service /etc/systemd/system/lesbilibre-moderation.service
sudo nano /etc/systemd/system/lesbilibre-moderation.service
```

Remplacez toutes les occurrences de `CHANGE_ME_HESTIA_USER` et `CHANGE_ME_DOMAIN`, puis démarrez :

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now lesbilibre-moderation
sudo systemctl status lesbilibre-moderation
curl http://127.0.0.1:8000/health
```

## 5. Worker Laravel permanent

La modération est ajoutée à la queue. Il faut donc un worker permanent, idéalement une seconde unité systemd qui exécute, avec le même utilisateur Hestia :

```ini
ExecStart=/usr/bin/php /home/USER/web/DOMAIN/public_html/artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

Redémarrez le worker après chaque déploiement : `sudo systemctl restart lesbilibre-queue`.

## Sécurité et supervision

- N’ouvrez pas le port 8000 dans le firewall Hestia/UFW.
- Le token ne doit jamais être placé dans Git ni dans le fichier du service.
- Suivez les journaux : `sudo journalctl -u lesbilibre-moderation -f`.
- Un score suspect place seulement une photo en quarantaine : une décision humaine reste obligatoire.
