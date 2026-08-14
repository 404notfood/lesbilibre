# Police du filigrane

Déposez ici un fichier `watermark.ttf` pour obtenir un filigrane en diagonale
répétée sur les photos (le rendu « protégé » classique).

Sans ce fichier, le filigrane reste actif mais utilise la police bitmap
intégrée à GD : lisible, plus rustique. Aucun code à modifier dans un sens
comme dans l'autre — `PhotoProcessingService` détecte la présence du fichier.

## Choisir une police

Prenez une police à licence libre (SIL OFL ou Apache 2.0), par exemple
DejaVu Sans Bold, Inter ou Roboto. Renommez le fichier `watermark.ttf`.

Une graisse **bold** donne un meilleur résultat : le filigrane est
semi-transparent, un trait fin devient illisible sur les zones claires.

## Déploiement

Le dossier `resources/` est versionné, donc la police suit le dépôt. Vérifiez
que la licence autorise la redistribution avant de l'y committer.
