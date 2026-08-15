# Police du filigrane

`watermark.ttf` sert à écrire la signature incrustée en bas à droite des médias
servis aux membres : logo, « Lesbi-Libre », puis le pseudo de la personne qui
regarde.

Sans ce fichier, la signature reste active mais utilise la police bitmap
intégrée à GD : même emplacement, rendu plus rustique. Aucun code à modifier
dans un sens comme dans l'autre — `PhotoProcessingService` détecte la présence
du fichier.

## Choisir une police

Prenez une police à licence libre (SIL OFL ou Apache 2.0), par exemple
DejaVu Sans Bold, Inter ou Roboto. Renommez le fichier `watermark.ttf`.

Une graisse **bold** donne un meilleur résultat : la signature est
semi-transparente, un trait fin devient illisible sur les zones claires.

## Déploiement

Le dossier `resources/` est versionné, donc la police suit le dépôt. Vérifiez
que la licence autorise la redistribution avant de l'y committer.

La police actuellement en place est DejaVu Sans Bold (licence libre,
redistribution autorisée).
