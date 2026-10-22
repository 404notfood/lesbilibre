# Reprendre après une erreur Hugging Face HTTP 429, sans compte

Le modèle public `Falconsai/nsfw_image_detection` peut être téléchargé sans
compte. Une erreur 429 signifie que l'adresse du VPS a atteint une limite de
requêtes. L'archive séparée `lesbilibre-moderation-model.tar.gz` fournit les
fichiers du modèle déjà téléchargés, dans le cache attendu par l'application.

L'archive de reprise `lesbilibre-reprise.tar` contient ce modèle, le `deploy.sh`
corrigé et leurs empreintes. La transférer dans `/tmp/lesbilibre` sur le VPS,
puis exécuter :

```bash
cd /tmp/lesbilibre
tar -xf ./lesbilibre-reprise.tar
sha256sum --check SHA256SUMS-REPRISE
sudo -u lesbilibre mkdir -p /home/lesbilibre/shared/moderation-models
cat ./lesbilibre-moderation-model.tar.gz | sudo -u lesbilibre tar -xzf - -C /home/lesbilibre/shared/moderation-models
sudo -u lesbilibre sh -c 'cd /home/lesbilibre/shared/moderation-models && sha256sum --check MODEL-SHA256SUMS'
sudo bash ./deploy.sh
```

Le script corrigé charge d'abord le cache hors ligne. Si le modèle manque ou
est inutilisable, il tente un téléchargement public puis s'arrête en cas
d'échec. Le service de modération utilise ensuite `HF_HUB_OFFLINE=1` : le
classement des photos ne dépend donc pas d'un accès à Hugging Face.

Ne pas réextraire les sources de l'application, supprimer le `.env`, recréer
les comptes ou vider le cache pour cette reprise. Les dépendances déjà
installées et les données conservées après le rollback restent en place.

L'archive inclut les configurations, les poids **Safetensors** et la fiche
du modèle de la révision `96cb0d0342c7afb80cab76ecc58b265fa44da256`.
Les poids ont été comparés au SHA-256 publié par le dépôt :
`97b2ce64ec146884b37f98ee7944ca4891aa72f6827dc0cb10684a1cbecd5830`.
Le fichier `MODEL-ORIGIN.json` dans l'archive précise sa provenance.

Validation locale effectuée sur le modèle extrait de l'archive, avec
Transformers 4.55.4, PyTorch CPU 2.7.1 et Safetensors 0.6.2 : chargement et
classement d'une image synthétique réussis, connexions réseau bloquées.
Ce test a été exécuté sous Windows/Python 3.12 ; la reprise sur le VPS
Debian/Python 3.13 reste à exécuter.
