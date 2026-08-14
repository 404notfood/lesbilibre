# Configuration WebSocket (Soketi/Pusher)

## Problème actuel

Le site affiche une erreur dans la console :
```
WebSocket connection to 'wss://127.0.0.1:6001/app/lesbi-key?...' failed:
Error in connection establishment: net::ERR_CONNECTION_REFUSED
```

**Cause** : Le serveur WebSocket Soketi n'est pas démarré.

**Impact** :
- ❌ Chat en temps réel non fonctionnel
- ❌ Notifications push désactivées
- ❌ Mise à jour en direct des matches/messages impossible

**Note** : Les fonctionnalités du site continuent de fonctionner, mais sans les mises à jour en temps réel.

---

## Solution : Démarrer Soketi

### Option 1 : Installation et démarrage de Soketi

1. **Installer Soketi globalement** :
```bash
npm install -g @soketi/soketi
```

2. **Démarrer le serveur** :
```bash
soketi start
```

3. **Ou avec Docker** :
```bash
docker run -p 6001:6001 -p 9601:9601 quay.io/soketi/soketi:latest-16-alpine
```

4. **Configuration personnalisée** (optionnel - créer un fichier `soketi.json`) :
```json
{
  "debug": true,
  "port": 6001,
  "appManager.array.apps": [
    {
      "id": "lesbi-app",
      "key": "lesbi-key",
      "secret": "lesbi-secret",
      "enableClientMessages": true,
      "enabled": true
    }
  ]
}
```

Puis démarrer avec : `soketi start --config=soketi.json`

### Option 2 : Utiliser Pusher Cloud

Si vous préférez utiliser Pusher Cloud au lieu de Soketi local :

1. Créer un compte sur [pusher.com](https://pusher.com)
2. Créer une nouvelle app Channels
3. Mettre à jour le `.env` :
```env
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=eu

# Commenter ou supprimer ces lignes :
# PUSHER_HOST=127.0.0.1
# PUSHER_PORT=6001
# PUSHER_SCHEME=http
```

4. Mettre à jour `vite.config.js` :
```js
VITE_PUSHER_APP_KEY: env.PUSHER_APP_KEY,
VITE_PUSHER_APP_CLUSTER: env.PUSHER_APP_CLUSTER,
// Commenter ces lignes :
// VITE_PUSHER_HOST: env.PUSHER_HOST,
// VITE_PUSHER_PORT: env.PUSHER_PORT,
// VITE_PUSHER_SCHEME: env.PUSHER_SCHEME,
```

5. Rebuild les assets :
```bash
npm run build
```

### Option 3 : Désactiver temporairement WebSocket

Si vous n'avez pas besoin du temps réel pour le moment, vous pouvez désactiver Pusher :

Dans `config/broadcasting.php`, changer :
```php
'default' => env('BROADCAST_CONNECTION', 'log'),
```

Mettre à jour `.env` :
```env
BROADCAST_CONNECTION=log
```

---

## Vérification

Une fois Soketi démarré, vous ne devriez plus voir l'erreur dans la console du navigateur.

Pour tester :
1. Ouvrir la console du navigateur (F12)
2. Recharger la page
3. Vérifier qu'il n'y a plus d'erreur WebSocket

---

## Liens utiles

- Documentation Soketi : https://docs.soketi.app/
- Documentation Pusher : https://pusher.com/docs/channels/
- Laravel Broadcasting : https://laravel.com/docs/12.x/broadcasting
