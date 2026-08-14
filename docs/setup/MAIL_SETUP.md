# Configuration Email pour le Développement

## 🎯 Option 1 : MailHog (Recommandé)

MailHog capture tous les emails en local avec interface web.

### Installation avec Laragon

1. Télécharge MailHog : https://github.com/mailhog/MailHog/releases
2. Place `MailHog.exe` dans `D:\Logiciel\laragon\bin\mailhog\`
3. Lance MailHog (double-clic sur l'exe)
4. Interface disponible sur : http://localhost:8025

### Configuration .env

```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@lesbi.fr"
MAIL_FROM_NAME="LesbiLibre"
```

---

## 🎯 Option 2 : Mailtrap (Service Cloud)

Mailtrap est un service gratuit pour tester les emails.

### Étapes

1. Créer un compte sur https://mailtrap.io (gratuit)
2. Créer une inbox
3. Copier les credentials SMTP

### Configuration .env

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username_here
MAIL_PASSWORD=your_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@lesbi.fr"
MAIL_FROM_NAME="LesbiLibre"
```

---

## 🎯 Option 3 : Désactiver la vérification (Pour tests uniquement)

Si tu veux tester sans vérification email :

### Modifier config/fortify.php

Commenter la ligne :

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    // Features::emailVerification(), // ← Commenter cette ligne
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]),
],
```

### Ou vérifier manuellement en BDD

```bash
php artisan tinker
```

```php
$user = User::where('email', 'ton@email.com')->first();
$user->email_verified_at = now();
$user->save();
```

---

## 🎯 Option 4 : Voir les emails dans les logs

Les emails sont visibles dans `storage/logs/laravel.log`

### Commande pour extraire le dernier lien de vérification

```bash
cd D:\Logiciel\laragon\www\lesbi\site
tail -500 storage/logs/laravel.log | grep -o "http[s]*://[^\"]*verify/[0-9]*/[^\"]*" | tail -1
```

Puis ouvre ce lien dans ton navigateur (remplace `&amp;` par `&` si nécessaire).

---

## 📧 Production : Configuration Gmail/SMTP

Pour la production, utilise un vrai service SMTP :

### Gmail (si volume faible)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@lesbi.fr"
MAIL_FROM_NAME="LesbiLibre"
```

⚠️ **Important** : Utilise un "App Password" Gmail, pas ton mot de passe normal.

### Recommandations Production

- **SendGrid** (gratuit jusqu'à 100 emails/jour)
- **Mailgun** (gratuit jusqu'à 5000 emails/mois)
- **Amazon SES** (très bon rapport qualité/prix)
- **Postmark** (excellente délivrabilité)

---

## ✅ Test après configuration

```bash
# Teste l'envoi d'email
php artisan tinker
```

```php
Mail::raw('Test email', function ($message) {
    $message->to('test@example.com')->subject('Test');
});
```

Vérifie MailHog ou Mailtrap pour voir l'email reçu !
