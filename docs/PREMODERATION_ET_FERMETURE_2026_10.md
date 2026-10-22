# Prémodération et fermeture des comptes — 21 octobre 2026

Ce document décrit le fonctionnement technique retenu après l’audit et les précisions de l’utilisateur. Il remplace les descriptions historiques qui prévoyaient une diffusion immédiate, une lecture administrative seulement après signalement ou un effacement immédiat par une membre. Il ne certifie aucune conformité juridique et ne fixe aucun délai réglementaire de conservation.

## Validation avant diffusion

Chaque message textuel, photo, vidéo et pièce jointe attend une décision humaine d’un administrateur habilité avant diffusion, y compris dans une conversation, une galerie privée et pour un média éphémère. Un contrôle automatique peut aider l’examen d’une photo, sans remplacer cette validation. Les états en attente, rejeté ou en quarantaine ne donnent aucun droit de diffusion à une autre membre.

La messagerie n’est pas chiffrée de bout en bout. Les administrateurs peuvent lire les textes et examiner les médias pour cet examen préalable, même sans signalement. « Privé » décrit la limitation d’accès des autres membres ; ce terme ne promet pas de cacher le contenu à l’administration. Les pages Confidentialité, Conditions, FAQ, À propos, Fonctionnement, Sécurité et le guide de partage des médias l’indiquent.

La file `/admin/messages` présente les textes en attente. Une approbation enregistre la décision et autorise la diffusion différée ; un refus avec motif empêche la transmission. Les files photo et médias éphémères s’occupent des médias correspondants. Les jobs de diffusion et push revérifient les droits et l’approbation au moment de leur exécution. Le push ne contient pas le texte d’un message ; le pseudo de l’expéditrice est facultatif et désactivé par défaut.

Un signalement en cours peut geler les interactions de la paire et conserver les éléments nécessaires à son traitement. Un blocage coupe les contacts sans supprimer les preuves. Une approbation ne lève pas un blocage, une restriction ou un retrait d’accord de partage.

La disponibilité de l’équipe détermine le délai réel de validation. Aucun traitement instantané ou délai garanti n’est annoncé. Le pilote de Laval doit dimensionner son groupe et ses créneaux de modération à cette lecture systématique, distincte du seul examen des signalements.

## Fermeture membre et effacement administratif

La demande de suppression depuis les paramètres ferme immédiatement le compte, retire son accès aux rencontres, invalide ses sessions et souscriptions push, puis notifie les administrateurs dans le site. Elle ne déclenche pas l’effacement physique des données. Les lignes et fichiers attendent une action administrative dans `/admin/account-deletions`.

La fermeture tente l’annulation des souscriptions Stripe pour éviter des prélèvements ultérieurs. Une erreur distante conserve les identifiants et un état de reprise visible. La fermeture du compte reste effective ; une tentative échouée d’annulation ne constitue pas une confirmation d’arrêt de la facturation. Aucun appel Stripe réel n’est effectué pendant les tests isolés.

Seul un administrateur peut déclencher l’effacement définitif. Le service sélectionne les disques selon le type de média, vérifie l’effacement et conserve un état de reprise en cas d’erreur. Les éléments nécessaires à un signalement ouvert suivent un traitement distinct pendant son examen. L’ancien texte annonçant une suppression automatique trente jours après fermeture ne décrit pas ce parcours.

## Contrôles d’exploitation

Avant toute invitation, vérifier avec des comptes et fichiers fictifs :

1. Un texte, une photo publique ou privée et une pièce jointe éphémère restent inaccessibles à la destinataire avant approbation ; le refus ne diffuse rien.
2. Une approbation permet la diffusion seulement si les deux comptes et leurs droits sont toujours admissibles ; blocage, signalement ouvert et retrait d’accord sont revérifiés.
3. Le push reste générique, sans texte privé ni adresse e-mail ou nom réel.
4. Une demande membre ferme le compte, notifie l’administration et conserve les données en attente ; seul le parcours administrateur lance l’effacement.
5. Les échecs simulés de stockage ou d’annulation distante conservent assez d’état pour une reprise sans faux succès.

Ces tests techniques ne remplacent ni le suivi humain des files, ni une restauration de sauvegarde éprouvée, ni les vérifications sur les services de production.
