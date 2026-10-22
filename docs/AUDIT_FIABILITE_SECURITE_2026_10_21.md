# Audit complémentaire — fiabilité, sécurité, modération et messagerie

Date : 21 octobre 2026. Projet examiné : `D:/Logiciel/laragon/www/lesbi/site`.

> Ce rapport décrit l’état initial audité. Après autorisation de correction et précisions de l’utilisateur, le contrat de diffusion et d’effacement a évolué : [Prémodération et fermeture des comptes](PREMODERATION_ET_FERMETURE_2026_10.md). Les reproductions et résultats ci-dessous ne constituent pas un constat sur l’état corrigé.

Demande : examiner le site actuel et recommander les améliorations. Aucun correctif applicatif, migration, paramètre ou déploiement n’a été réalisé pendant cet audit. Les changements préexistants sont conservés.

## Résultat et portée

Les contrôles communautaires, les routes protégées des médias, la signature des webhooks, l’atomicité de certains débits et le suivi d’exploitation constituent des bases utiles. Cependant, plusieurs chemins secondaires n’utilisent pas les mêmes règles. Les priorités concernent la confidentialité des réponses, l’application réelle de la quarantaine, la conservation des preuves après blocage et l’unification des suppressions.

Vérifications réalisées :

- Lecture de l’état actuel du code, avec trois examens spécialisés en parallèle : sécurité, modération et messagerie. Recommandations React consultées pour l’interface de discussion.
- Suite existante exécutée : **547 tests, 2 441 assertions, aucun échec ; 7 tests de distance ignorés avec SQLite**. Les tests MySQL de l’intervention précédente ne sont pas présentés comme réexécutés pendant cet audit.
- **13 tests diagnostiques supplémentaires**, conservés hors de la suite applicative, ont été exécutés sur SQLite en mémoire, avec comptes fictifs, disques simulés, appels HTTP simulés et diffusion temps réel simulée. Ils affirment les comportements souhaités et **échouent tous sur le code actuel** : ces échecs confirment les écarts décrits ci-dessous, sans modification des sources.
- L’envoi push vers une destination interne a été vérifié avec un validateur isolé et un client HTTP simulé : aucune destination réelle n’a été contactée.
- Aucune valeur de secret, donnée de membre réel ou base applicative consultée pour établir ces scénarios. Aucun paiement ou message externe envoyé.

Cet examen n’est pas une certification de sécurité. Le serveur de production, les sauvegardes, le réseau sortant, les sessions réelles, la concurrence MySQL, les appareils mobiles physiques et la disponibilité humaine restent à vérifier dans leur environnement.

## Corrections prioritaires avant élargissement du pilote

### 1. Réponses publiques : ne transmettre que les champs nécessaires — P1, reproduit

Le formulaire de signalement reçoit le modèle `User` entier dans `app/Http/Controllers/ReportController.php:24-27`. Le tableau des demandes de galerie reçoit aussi les relations `requester` complètes dans `GalleryAccessController.php:23-47`. L’e-mail n’est pas caché par `User::$hidden` (`app/Models/User.php:45`).

**Reproduction :** une membre admissible ouvre le formulaire de signalement d’une autre membre : `reportedUser.email` est présent dans la réponse Inertia. Une propriétaire de galerie reçoit également `requests.0.requester.email` pour une demande. L’absence d’affichage à l’écran ne retire pas ces données de la réponse.

**À faire :** généraliser des projections publiques explicites, distinctes des données personnelles et administratives : identifiant, pseudo/nom public et avatar autorisé selon le besoin. Examiner les autres sérialisations de modèles et tester l’absence d’e-mail, consentements, informations de facturation et détails de compte dans toutes les réponses destinées à une autre membre.

### 2. Quarantaine : retirer effectivement le média et le montrer à la modération — P1, reproduit

L’upload de galerie est publié immédiatement avec `is_approved=true` (`PhotoController.php:99`). Le job `ModeratePhoto.php:42` peut ensuite définir `moderation_status=quarantined` sans retirer cette approbation. La route média ne refuse aux autres membres que les photos non approuvées ou explicitement rejetées (`PhotoStreamController.php:35-36`).

**Reproduction :** un score de classification élevé met la photo en quarantaine ; une autre membre reçoit encore HTTP 200 sur sa route média. Le rendu a été simulé pour tester l’autorisation, sans diffuser de contenu réel. La file photo administrative ne sélectionne que `pending` (`PhotoController.php:231`) et le tableau de modération cherche des photos non approuvées sans motif : la quarantaine ne bénéficie donc pas de ces files ordinaires.

**À faire :** une règle centrale de visibilité, une transition de quarantaine qui retire immédiatement l’accès membre et une file administrative explicite. Distinguer « en attente », « approuvé », « quarantaine » et « rejeté » sans combinaisons de champs contradictoires. Définir aussi le traitement des médias envoyés avant décision et des vidéos qui ne passent pas par le classificateur photo. Un score automatique doit aider la décision humaine, pas présenter une sécurité garantie.

### 3. Blocage : préserver les preuves tout en coupant les interactions — P1, reproduit

`BlockController.php:86-90` supprime physiquement la conversation. Les migrations des messages et des médias éphémères définissent une suppression en cascade sur sa clé étrangère. Aucune exception ne conserve un éphémère déjà signalé.

**Reproduction :** une conversation contient un média marqué `is_flagged=true` et un fichier fictif. Après blocage de l’expéditrice, la ligne de preuve a disparu mais le fichier existe encore. Ce fichier n’a plus sa ligne de suivi pour la purge, et la file de modération ne peut plus retrouver cette preuve par le média.

**À faire :** rendre le fil inaccessible aux membres bloquées et arrêter les contacts, en conservant séparément les éléments nécessaires au traitement d’un signalement avec une rétention définie. Ne pas assimiler une coupure d’accès à un effacement physique immédiat. Tester systématiquement « signaler puis bloquer » et « bloquer puis demander de l’aide ».

### 4. Effacement : un service commun à tous les parcours — P1/P2, deux défauts reproduits

Il existe deux suppressions différentes :

- `Settings/ProfileController.php:46-61` fait principalement un `User::delete()` ; `User` utilise `SoftDeletes`. Ce chemin ne passe pas par le nettoyage de `DataPrivacyController`.
- `DataPrivacyController.php:99-192` nettoie et anonymise plusieurs données mais ne constitue pas un service commun ; il ignore encore les retours négatifs de suppression de fichiers et ne traite pas explicitement tous les médias éphémères et abonnements push.

**Reproductions :** la suppression depuis les paramètres de profil laisse la photo fictive sur disque. La suppression d’une vidéo par l’administration (`Admin/UserController.php:243-245`) utilise `public` alors que vidéo et poster se trouvent sur `local` : le fichier privé reste présent après réussite affichée. La suppression administrative d’un compte emploie également `public` à la ligne 331.

**À faire :** unifier les parcours membre et administrateur, sélectionner le disque selon le type de média, vérifier les résultats d’effacement, conserver un état de reprise et distinguer les preuves sous rétention du reste des données. Vérifier aussi les sessions des autres appareils, les jetons push et les caches de rendu.

**Facturation, constat statique distinct :** `DataPrivacyController.php:165-166` supprime les souscriptions locales sans arrêter l’abonnement Stripe distant. Une souscription réelle pourrait continuer alors que son lien local a disparu. Aucun prélèvement réel n’a été testé. Prévoir la résiliation ou la fin de période et une réconciliation en cas d’échec distant avant de perdre les identifiants utiles. Ces observations techniques ne constituent pas une conclusion juridique sur l’effacement.

### 5. Messages : rendre l’enregistrement et la diffusion cohérents — P1, reproduit

`MessageController.php:57-72` crée le message, lance la diffusion immédiate, puis actualise la date de conversation. `MessageSent` utilise `ShouldBroadcastNow`.

**Reproduction :** le diffuseur temps réel simulé tombe en panne. Le POST retourne HTTP 500 alors que le message a été enregistré. La date de conversation n’a pas encore été actualisée. Il ne faut pas conclure automatiquement à un doublon sur nouvelle tentative : le filtre anti-abus peut refuser le même texte.

**À faire :** enregistrer message et date de conversation dans une même transaction ; prévoir une diffusion différée fiable après validation et un état de reprise. Associer un identifiant d’envoi unique au message pour qu’un nouvel essai confirme le résultat sans créer un deuxième message. Présenter des états distincts « en cours », « enregistré », « diffusion en attente » et « échec » selon ce que le serveur peut réellement confirmer. Un échec du WebSocket ne doit pas rendre ambigu le résultat de l’envoi.

La documentation [Laravel sur la diffusion](https://laravel.com/docs/12.x/broadcasting) confirme le caractère synchrone de `ShouldBroadcastNow` et les mécanismes de diffusion après transaction. Une file seule n’est pas une garantie de livraison : il faut également suivre ses échecs et permettre les reprises.

### 6. Comptes supprimés et historique du chat — P1/P2, reproduit

**Compte supprimé :** `ConversationController.php:47` passe l’interlocutrice à `conversationUser(User $user)`, alors que la relation peut devenir `null` après suppression logique. La vue d’un fil a le même problème avec `canInteractWith` à la ligne 79.

**Reproduction :** après suppression de B via le parcours confidentialité, A reçoit HTTP 500 en ouvrant sa liste de conversations. Une seule interlocutrice supprimée peut donc casser la liste.

**À faire :** définir un état « compte supprimé », décider quels éléments du fil restent consultables et gérer explicitement les relations absentes.

**Historique :** le contrôleur pagine 50 messages (`ConversationController.php:86`) mais marque tous les messages reçus du fil comme lus (`:95`). Le composant React ne lit que `messages.data` et ne propose pas de pagination.

**Reproduction :** 60 messages non lus existent ; la réponse en expose 50, et les 60 deviennent lus. Il reste 0 non lu au lieu des 10 messages non chargés.

**À faire :** proposer un chargement des messages précédents avec curseur stable et ne confirmer la lecture que des messages réellement affichés. Prévoir les tests de très longues conversations, réponses simultanées et dates identiques.

### 7. Signalements : une décision unique, reliée à la preuve — P2, reproduit

Le signalement d’un éphémère crée un `Report` dont le lien au média est une mention dans un texte (`EphemeralMediaController.php:137-141`). La page générale des signalements et la console des éphémères prennent des décisions séparées.

**Reproduction :** un signalement éphémère est classé `dismissed` depuis la page générale ; le média reste `is_flagged=true`. La purge continue à l’exclure. L’opération inverse, statiquement constatée dans `Admin/EphemeralMediaController.php:95`, enlève le drapeau sans fermer le `Report`.

**À faire :** relation structurée entre signalement, message/média et conversation ; décision centralisée et transactionnelle ; motif, responsable, trace de décision et échéance de rétention cohérents. Gérer les signalements multiples d’une même preuve avant de lever une conservation.

### 8. Uploads : nettoyer les rejets et maîtriser le coût de traitement — P2, reproduit

`PhotoController.php:79-85` stocke ou transcode avant de vérifier le doublon. Les nouveaux chemins UUID ne sont pas supprimés lorsque le doublon est refusé.

**Reproduction :** envoyer deux fois exactement la même photo laisse 4 fichiers au lieu des 2 attendus, malgré une seule ligne `Photo`. La limite de dix lignes ne borne donc pas les fichiers sans référence. Le throttle de dix envois par minute existe et réduit le débit ; il ne corrige pas cet écart.

**À faire :** vérifier le hash avant les traitements coûteux lorsque c’est possible ; nettoyer les fichiers créés lors de tout échec ; suivre les fichiers sans référence. Ajouter un plafond de dimensions/pixels avant décodage et des budgets de durée/mémoire. Le risque d’épuisement de mémoire lié aux grandes images n’a pas été reproduit et doit être mesuré sur un environnement isolé.

### 9. Premium et webhooks : tester les parcours complets et les reprises — P1 avant monétisation, reproduit

**Droits :** `StripeWebhookController.php:171` écrit le prix Stripe dans `Subscription.plan`. `EntitlementService.php:52-54` cherche cette valeur dans `PremiumPlan.slug`.

**Reproduction :** un abonnement synthétique actif donne le statut Premium mais pas l’avantage `see_who_liked` du plan correspondant. L’activation du statut n’atteste donc pas de l’attribution des droits.

**À faire :** relation explicite vers le plan du catalogue et correspondance des prix Stripe ; tests intégrant webhook, abonnement, droits et expiration.

**Reprise :** l’application vérifie `processed`, effectue les effets métier, puis marque l’événement traité sans transaction commune (`StripeWebhookController.php:49-71`).

**Reproduction sans paiement :** une interruption simulée survient après crédit de 100 gemmes mais avant le marqueur `processed`. La reprise du même webhook signé synthétique aboutit à 200 gemmes, au lieu de 100. Le test existant du doublon après réussite ne couvre pas ce cas.

**À faire :** traitement transactionnel avec verrouillage et unicité des effets métier par opération Stripe ; séparer les notifications ; prévoir la réconciliation et les événements reçus dans un autre ordre. [Stripe documente les doublons et l’absence de garantie d’ordre](https://docs.stripe.com/webhooks#handle-duplicate-events). Aucune transaction ou communication avec Stripe n’a été effectuée pendant ce diagnostic.

### 10. Notifications push : limiter les destinations réseau — P1 conditionnel, simulation sans réseau

`PushSubscriptionController.php:13-17` accepte une URL générale. `WebPushService.php:43-54` transmet l’endpoint tel quel à la bibliothèque.

**Vérifications simulées :** les règles de validation acceptent des adresses locales et une adresse de métadonnées. Avec des clés synthétiques générées en mémoire et un client Guzzle simulé, la bibliothèque prépare un POST vers une URL HTTP locale. Aucun service interne ou externe n’a été contacté.

**Risque :** le serveur pourrait servir de relais vers une destination interne (SSRF). L’exploitation effective dépend des clés push configurées et des sorties réseau autorisées ; elle n’est pas démontrée sur le serveur de production.

**À faire :** exiger HTTPS, définir les services push autorisés, contrôler les adresses obtenues après résolution ainsi que les redirections et limiter les sorties réseau. Valider les clés et borner les abonnements par compte. Éviter aussi de journaliser l’endpoint complet. La protection doit tenir compte du DNS et du client réellement utilisé, comme le précise le [guide SSRF d’OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

## Améliorations fonctionnelles et d’exploitation à prévoir ensuite

Ces points sont distincts des défauts reproduits.

- **Reconnexion du chat :** récupérer les messages manqués après le dernier identifiant confirmé lors du retour réseau, d’un retour au premier plan ou d’une reconnexion WebSocket, puis dédupliquer. Le code actuel écoute les nouveaux événements sans rattrapage.
- **Droit de réponse actualisé :** après une introduction sans match, la première réponse reçue en WebSocket actualise les messages mais pas la prop `canSendMessage`. Resynchroniser ce droit pour éviter un formulaire fermé jusqu’au rechargement, sans remplacer la validation serveur.
- **Notifications discrètes :** masquer le contenu et éventuellement le nom sur l’écran verrouillé par défaut ; proposer des réglages push par catégorie. Les préférences actuelles concernent explicitement les e-mails : leur absence de consultation par les push ne prouve pas un contournement d’un réglage push existant.
- **Révocation des accès différés :** revérifier les droits lors de l’exécution des notifications mises en file et définir ce qui arrive aux connexions déjà abonnées après suspension ou retrait de consentement. Une autorisation donnée à la souscription ne démontre pas une révocation immédiate. Les effets du chemin exact de blocage sur les jobs existants restent à tester ; la suppression des modèles peut aussi faire échouer leur restauration.
- **Modération utilisable :** responsable assignée, priorité urgente explicite (danger, soupçon de minorité, menace), accusé de réception, statut compréhensible pour la personne qui signale et voie de recours. Le code ne démontre pas la disponibilité humaine. Choisir les délais d’alerte selon les moyens réellement disponibles à Laval.
- **Sécurité administrative :** imposer la double authentification aux administratrices, exiger une confirmation récente pour les opérations les plus sensibles, séparer modération et facturation et revoir les accès. Le seul contrôle `is_admin` actuel n’est pas présenté comme une élévation de privilèges démontrée.
- **Alertes exploitables :** raccorder les indicateurs déjà réalisés à un canal suivi par une personne désignée ; alerter sur les échecs nouveaux, tâches absentes, traitements bloqués et délais urgents. Le tableau et la commande seuls ne notifient personne. Ne pas transmettre de contenu intime dans ces alertes.
- **Sauvegardes et restauration :** définir la fréquence, le chiffrement, les accès et la rétention puis tester une restauration isolée, base et médias compris. Aucun dispositif de sauvegarde/restauration éprouvé n’a été trouvé dans les fichiers examinés ; cela ne prouve pas qu’il n’en existe pas hors du dépôt. Éviter qu’une restauration ne rende accessibles des contenus déjà effacés ou des accès révoqués.
- **Infrastructure :** vérifier HTTPS, cookies, debug désactivé, droits des disques, réseau sortant et accès aux outils techniques sur le serveur réel. Le compose de développement publie plusieurs services : il faut contrôler leur exposition effective avant tout usage public, sans conclure depuis le fichier qu’ils sont accessibles sur Internet.
- **Tests continus :** intégrer les scénarios diagnostiques comme régressions lors de leurs corrections, tester les autorisations dans les deux sens, les traitements interrompus, les doubles requêtes et les parcours navigateur à deux sessions. Ajouter des audits de dépendances et des essais MySQL de concurrence sur base isolée. Il n’est pas nécessaire de réécrire l’application.

## Ordre de travail conseillé

1. Corriger fuite de données, quarantaine, blocage/preuves et effacement commun ; ajouter leurs tests de régression.
2. Fiabiliser message/date/diffusion, états de comptes supprimés, historique et rattrapage du chat ; tester à deux sessions.
3. Unifier les décisions de modération, la conservation et les alertes ; désigner les personnes de relais avant le pilote.
4. Sécuriser les push et les uploads avant de les proposer à une cohorte publique ; vérifier l’environnement réseau.
5. Corriger les droits et reprises Stripe avant toute vente Premium ; vérifier sauvegarde et restauration avant d’élargir les inscriptions.

Les développements commerciaux supplémentaires et l’application native ne sont pas prioritaires face à ces problèmes.

## Reproductions conservées

Depuis `site`, sans configuration Laravel en cache :

```sh
php vendor/phpunit/phpunit/phpunit ../llm-concil/2026-10-21-lesbillibre/audit-probes/AuditProbeTest.php --colors=never
```

Le fichier `phpunit.xml` du site sélectionne SQLite en mémoire, les disques sont simulés pour les tests concernés et les appels réseau applicatifs non simulés sont refusés. Ces tests sont volontairement hors de `tests/` afin de ne pas modifier la suite pendant une demande d’audit. Ils doivent échouer sur l’état audité et être adaptés/intégrés lorsque les corrections sont autorisées.

Preuves : `llm-concil/2026-10-21-lesbillibre/audit-complementaire-suite.log`, `audit-probes-resultats.log` et `audit-probes-resultats.xml`. La simulation push autonome est archivée dans `audit-probes/push-endpoint-mock.php`, avec recette et sortie dans le même dossier. Elle n’utilise ni bootstrap applicatif ni véritable transport réseau. Les scénarios supplémentaires expliquent pourquoi une suite verte ne suffit pas à conclure que tous les parcours sont fiables.
