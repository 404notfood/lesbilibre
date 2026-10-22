# Sécurité de la communauté — septembre 2026

Mise à jour du 21 octobre 2026 : le fonctionnement courant est détaillé dans [Prémodération et fermeture des comptes](PREMODERATION_ET_FERMETURE_2026_10.md). Chaque message et média est examiné par un administrateur avant diffusion, y compris les contenus privés et éphémères. Les conversations ne sont pas chiffrées de bout en bout. Une demande membre ferme le compte et notifie l’administration ; seul un administrateur peut déclencher l’effacement définitif.

## Modèle retenu

Pas de prestataire externe ni de collecte de pièce d’identité. L’âge est **déclaré**, jamais présenté comme une preuve de majorité. Le badge « Photos vérifiées » indique une comparaison humaine du selfie avec la photo principale et du code manuscrit. Il ne certifie ni âge, ni genre, ni orientation.

L’accès aux rencontres exige un email confirmé, une date déclarée de 18 ans minimum, la charte courante, le consentement au traitement des choix et des photos vérifiées. Les comptes bannis ou sous restriction de sécurité ne peuvent pas interagir. La préparation du profil, les photos personnelles, le support et les paramètres de confidentialité restent accessibles pendant l’accueil.

Les dates historiques étaient approximatives : aucune n’est automatiquement déclarée exacte. Les membres existantes doivent confirmer leur date et la nouvelle charte. Une date confirmée après vérification des photos se corrige via le support puis le formulaire dédié dans l’administration du compte. Cette correction ne lève pas une restriction de modération.

Un compte représente une personne, même en couple. Les femmes cis et trans ainsi que les personnes non binaires se reconnaissant dans la communauté sont accueillies. La charte interdit les comptes partagés et la recherche de partenaire pour un homme. Aucun classement du genre par apparence.

## Modération

- Lire chaque message et examiner chaque photo, vidéo et pièce jointe avant approbation. L’absence de signalement ne dispense pas de cet examen ; un score automatique ne remplace pas la décision humaine. Aucune diffusion membre pendant l’attente, le rejet ou la quarantaine.
- Défi selfie valable 30 minutes avant envoi. Le temps de traitement humain est distinct de cette durée.
- Vérifier le code et comparer la photo principale avant approbation. Changer ou retirer la photo principale invalide le badge ; les demandes en attente sont rejetées pour nouvelle prise de vue.
- Les signalements de minorité passent en tête de la file. Un signalement seul ne suspend pas automatiquement une membre.
- Après examen, « Suspendre les rencontres » applique une restriction temporaire avec note obligatoire. « Lever la restriction » exige également une note. Les actions sont journalisées.
- Les recours passent par Contact. Prévoir une équipe et un délai opérationnel réaliste ; aucune promesse automatique de réponse dans l’heure.
- La purge existante des selfies décidés après 30 jours reste planifiée. Surveiller les demandes en attente pour qu’aucune ne reste sans décision.

## Rencontres et consentement

Les intentions sont multiples ; l’ancien champ `looking_for` conserve un premier choix compatible pour les anciens affichages. Les suggestions exigent une intention commune dans les deux sens et respectent « amitié uniquement » et « pas de sollicitations sexuelles ». « Pas de couples » est une limite affichée, pas une déduction à partir de l’orientation ou du statut amoureux. Le site accepte uniquement les comptes individuels.

Les médias intimes éphémères nécessitent l’accord de la destinataire pour cette conversation, révocable gratuitement. Le contrôle s’applique à l’envoi et à l’ouverture, y compris après retrait. Cela concerne les médias classés intimes : la modération reste nécessaire pour les contenus mal déclarés et les messages textuels inappropriés. Une sélection d’intention ne vaut jamais consentement.

## Déploiement

1. Sauvegarder la base et prévoir une courte maintenance.
2. Appliquer `php artisan migrate --force` avec la configuration de production vérifiée.
3. Compiler le front avec `npm run build`, actualiser les caches Laravel selon la procédure habituelle et redémarrer les processus persistants.
4. Apache : conserver les nouvelles règles de `public/.htaccess`. Nginx : installer les règles `/storage/photos/` et `/storage/verification-photos/` des configurations du dépôt et recharger le serveur après validation de sa configuration. Une modification du modèle Hestia n’actualise pas seule les domaines existants.
5. Invalider les anciennes copies de médias éventuellement mises en cache par un CDN ; une copie déjà téléchargée ne peut pas être rappelée.
6. Vérifier avec deux comptes adultes et un compte en attente : accueil, photo personnelle, validation admin, accès direct, signalement, suspension et retrait d’accord intime.

La migration et la configuration du serveur réel ne sont pas appliquées par l’édition du dépôt. La solution réduit les risques mais une date déclarée n’empêche pas un mensonge sur l’âge.
