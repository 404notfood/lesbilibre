#!/bin/bash
# Script d'arret Podman pour Linux
# Arrete et supprime les containers

echo "Arret des containers Podman pour lesbi..."

# Charger les variables Docker (.env2) pour les noms de containers
if [ -f .env2 ]; then
    export $(cat .env2 | grep -v '^#' | grep -v '^$' | xargs)
fi

podman-compose down

# Restaurer le .env Laragon
if [ -f .env.laragon ]; then
    cp .env.laragon .env
    echo "Fichier .env Laragon restaure."
fi

# Option: supprimer les volumes (donnees MySQL, Redis, node_modules)
if [ "$1" = "--clean" ]; then
    echo "Suppression des volumes..."
    podman volume rm -f site_mysql-data site_redis-data site_node-modules 2>/dev/null
    echo "Volumes supprimes."
fi

echo "Containers arretes!"
