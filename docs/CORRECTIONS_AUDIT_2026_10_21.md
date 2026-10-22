# Corrections de l’audit du 21 octobre 2026

État appliqué au site local le 21 octobre 2026. Les règles fonctionnelles détaillées sont dans [Prémodération et fermeture](PREMODERATION_ET_FERMETURE_2026_10.md). L’audit initial décrit les défauts avant correction.

## Modération et confidentialité

- Chaque texte, photo, vidéo et pièce jointe attend une approbation administrative. Les expéditrices voient leur propre attente ; les destinataires ne reçoivent ni contenu ni notification de message avant approbation.
- Les messages historiques sont en attente. Les photos historiques sans trace d’approbation humaine repassent en attente ; les principales concernées nécessitent une nouvelle vérification. Le classificateur ne peut jamais approuver un média.
- Un signalement `pending` ou `reviewed` suspend les interactions des deux comptes concernés jusqu’à clôture du dernier signalement. Le blocage conserve la conversation et les preuves.
- Les signalements éphémères sont liés par clé étrangère, leurs décisions synchronisées et leurs fichiers protégés pendant l’examen. L’effacement et le signalement utilisent le même verrou pour éviter de perdre une preuve concurrente.
- Identités affichées par pseudo. Les projections de profils, galeries, signalements et pages administratives ne transmettent plus les emails et noms civils des autres comptes. Les textes de messages contenant une adresse sont refusés ; les anciennes adresses sont masquées à l’affichage. Les paramètres personnels de connexion conservent l’adresse de leur propriétaire.
- Le texte libre des cadeaux passe par la messagerie ; l’ancien champ ne peut plus contourner la validation. Les anciennes métadonnées ne sont plus diffusées dans l’historique des gemmes.
- Les fichiers photo restent servis par les routes autorisées. L’accès direct au dossier photo via le serveur local a été vérifié : HTTP 403.

## Fermeture et effacement

- Les deux parcours membre ferment le compte, révoquent les sessions et les souscriptions push, préservent les données et notifient les administrateurs dans le site.
- La file `/admin/account-deletions` permet seule la confirmation explicite `EFFACER`. Le service administratif existant utilise le même effacement contrôlé. Une demande non approuvée n’est jamais effacée par la commande de reprise.
- L’annulation Stripe est tentée à la fermeture. En cas d’échec, le compte reste fermé, les identifiants nécessaires sont conservés et la reprise ne déclare pas un faux succès.
- Les fichiers utilisent le disque adapté, les échecs restent visibles et les preuves signalées suivent leur propre rétention. L’effacement retire aussi le pseudo des notifications de fermeture.
- Les comptes fermés ne font plus tomber les files de validation photo/selfie ; leurs médias restent conservés en attente de décision d’effacement.

## Fiabilité et administration

- Les messages et leur diffusion sont enregistrés ensemble ; UUID pour les reprises sans doublon, outbox durable, envoi uniquement après approbation et nouvelle vérification des droits dans les jobs.
- Historique chargeable, rattrapage après reconnexion, curseur de changements pour les approbations tardives, lecture confirmée uniquement pour les messages affichés. Une interlocutrice supprimée devient un compte fermé.
- Stripe : effets et marqueur d’événement dans la même transaction, déduplication, catalogue de plans correct et événements obsolètes ignorés.
- Push : HTTPS et fournisseurs autorisés, DNS public épinglé contre le rebinding, aucun proxy ou redirection, clés et quotas vérifiés. Aucun contenu de message dans le push. Le transport nécessite l’extension PHP cURL.
- Double authentification administrative et confirmation récente du mot de passe pour les actions sensibles en production. Files texte/photo/pièce jointe, notifications de fermeture et suivi des reprises disponibles dans l’administration.
- Images bornées en dimensions, doublons traités avant stockage et fichiers issus d’une course nettoyés.
- Cartes partagées recherche/tableau de bord/recommandations et en-tête du profil public refaits. Contrôle visuel avec profils et illustrations fictifs à 1200, 390 et 320 px ; aucun débordement détecté dans ces cas.

## Validation et application locale

- Suite complète : **608 tests réussis**, 7 tests de distance ignorés uniquement sur SQLite, 3247 assertions lors de la passe complète.
- Base MySQL temporaire créée pour l’essai puis supprimée : **39 tests, 334 assertions réussis**, dont les 7 tests de distance, la modération, la facturation et l’effacement.
- Dernier ajustement de suppression du pseudo dans les notifications : les 6 tests d’effacement et leurs 63 assertions réussissent.
- TypeScript, ESLint, Pint ciblé et build Vite réussis. Accueil local HTTP 200 après application.
- Les migrations `100001` à `100004` ont été appliquées localement en lot 14. Caches configuration/routes/vues purgés et signal de redémarrage des workers envoyé.
- Aucun paiement, push, mail ou effacement de compte réel n’a été déclenché pour les essais. Les écritures de test utilisent SQLite en mémoire ou une base MySQL temporaire et des stockages fictifs.

Les journaux et l’aperçu reproductible sont dans `llm-concil/2026-10-21-lesbillibre/audit-probes/`. Le serveur d’aperçu a été arrêté après les captures.

## Exploitation restant à vérifier sur l’hébergement

Le déploiement doit exécuter le worker et le planificateur : reprises des messages chaque minute, reprises des effacements déjà autorisés et annulations à reprendre toutes les cinq minutes. Une sauvegarde et sa restauration isolée, les services Stripe/push de production et la disponibilité humaine de modération ne sont pas validés par ces tests locaux. Le pilote de Laval doit rester dimensionné à la capacité de validation manuelle.
