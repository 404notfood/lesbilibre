# 🔐 Guide de Connexion

## ✅ Compte de Démonstration

Un compte de test a été créé pour vous :

### Identifiants

```
📧 Email OU Pseudo: demo@demo.com OU demo
🔑 Mot de passe: password
```

## 🚀 Comment se connecter

### Méthode 1: Via l'email

1. Allez sur http://127.0.0.1:8000/login
2. Dans le champ "Pseudo ou adresse email", entrez: **demo@demo.com**
3. Dans le champ "Mot de passe", entrez: **password**
4. Cliquez sur "Se connecter"

### Méthode 2: Via le pseudo

1. Allez sur http://127.0.0.1:8000/login
2. Dans le champ "Pseudo ou adresse email", entrez: **demo**
3. Dans le champ "Mot de passe", entrez: **password**
4. Cliquez sur "Se connecter"

## 📱 Après connexion

Vous serez redirigé vers le **Dashboard** où vous pourrez :

- 👥 **Découvrir des profils** - Voir les personnes disponibles
- 💬 **Accéder aux messages** - Via le menu "Mes Chats"
- 📊 **Voir l'activité** - Likes, visites, matches
- 🎁 **Boutique** - Acheter des gemmes et cadeaux
- 🔍 **Recherche avancée** - Filtrer par critères
- 👑 **Premium** - Découvrir les avantages

## 🆕 Créer un nouveau compte

Si vous voulez créer votre propre compte :

1. Allez sur http://127.0.0.1:8000/register
2. Remplissez le formulaire d'inscription
3. Validez votre email (si la vérification est activée)
4. Connectez-vous avec vos identifiants

## ⚙️ Créer d'autres utilisateurs de test

Si vous voulez créer plus d'utilisateurs pour tester les fonctionnalités de chat/matching :

```bash
cd "D:\Logiciel\laragon\www\lesbi\site"
php artisan db:seed --class=DemoUserSeeder
```

Ou créez-les manuellement via l'interface d'inscription.

## 🔧 Résolution de problèmes

### "Identifiants incorrects"

- Vérifiez que vous utilisez bien `demo` ou `demo@demo.com`
- Vérifiez que le mot de passe est bien `password` (en minuscules)

### "Page blanche"

- Vérifiez que le serveur est lancé : `composer run dev`
- Vérifiez que vous accédez à http://127.0.0.1:8000 (pas https)

### "Erreur 404"

- La route `/login` existe bien
- Vérifiez que Laravel Fortify est correctement installé

### Réinitialiser le mot de passe

Si vous avez oublié le mot de passe d'un compte, vous pouvez le réinitialiser via :

```bash
php artisan tinker
$user = User::where('email', 'demo@demo.com')->first();
$user->password = Hash::make('nouveau_mot_de_passe');
$user->save();
```

## 🌐 URLs Importantes

- **Page d'accueil** : http://127.0.0.1:8000/
- **Connexion** : http://127.0.0.1:8000/login
- **Inscription** : http://127.0.0.1:8000/register
- **Dashboard** : http://127.0.0.1:8000/dashboard (après connexion)
- **Messages** : http://127.0.0.1:8000/conversations (après connexion)
- **Activité** : http://127.0.0.1:8000/activity (après connexion)
- **Boutique** : http://127.0.0.1:8000/shop (après connexion)
- **Premium** : http://127.0.0.1:8000/premium (après connexion)

## 💡 Astuce

Pour une meilleure expérience de test :

1. Créez plusieurs comptes utilisateurs
2. Utilisez un navigateur en mode incognito pour tester avec plusieurs comptes simultanément
3. Testez les fonctionnalités de like, match et chat entre différents utilisateurs

---

**Note** : Ces identifiants sont pour le développement/test uniquement. En production, utilisez des mots de passe sécurisés !
