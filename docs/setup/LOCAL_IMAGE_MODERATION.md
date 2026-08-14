# Modération d’images auto-hébergée (Windows / Laragon)

Le service fonctionne nativement avec Python, sans Docker ni Podman. Il écoute uniquement sur `127.0.0.1:8000` : il n’est donc pas accessible depuis Internet.

## Pré-requis

- Python 3.12 ou plus récent dans le `PATH`.
- Une valeur aléatoire longue pour `MODERATION_API_TOKEN`.
- PHP/Laravel avec le worker de queue actif.

## Installation et démarrage

Dans `site`, ajoutez dans `.env` :

```env
MODERATION_SERVICE_URL=http://127.0.0.1:8000
MODERATION_API_TOKEN=remplace-par-un-secret-long-et-aleatoire
MODERATION_NSFW_QUARANTINE_THRESHOLD=0.85
```

Puis, dans un autre terminal PowerShell :

```powershell
cd D:\Logiciel\laragon\www\lesbi\site\moderation
.\start-moderation.ps1 -Token "la-meme-valeur-que-MODERATION_API_TOKEN"
```

Au premier lancement, Python télécharge le modèle une seule fois dans `moderation\.models`. Le modèle est chargé en mémoire ; sur CPU, prévoyez plusieurs Go de RAM et un premier démarrage plus lent.

Dans un second terminal, démarrez le worker Laravel :

```powershell
php artisan queue:work
```

Chaque nouvelle photo est alors classée localement. Une probabilité NSFW au-dessus du seuil place la photo en quarantaine : elle reste à vérifier manuellement et n’est jamais rejetée automatiquement.

## Vérification

Ouvrez `http://127.0.0.1:8000/health` : la réponse doit contenir `"status":"ok"`.
