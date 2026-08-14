#!/bin/bash
# Script de demarrage Podman pour Linux
# Ce script cree et demarre les containers Podman

set -e

echo "Demarrage des containers Podman pour lesbi..."

# Verifier que Podman est installe
if ! command -v podman &> /dev/null; then
    echo "Erreur: Podman n'est pas installe"
    exit 1
fi

# Verifier que podman-compose est installe
if ! command -v podman-compose &> /dev/null; then
    echo "Erreur: podman-compose n'est pas installe"
    exit 1
fi

# Charger les variables Docker (.env2)
if [ -f .env2 ]; then
    export $(cat .env2 | grep -v '^#' | grep -v '^$' | xargs)
else
    echo "Erreur: .env2 introuvable (variables Docker)"
    exit 1
fi

# Copier .env.docker en .env pour Laravel dans les containers
if [ -f .env.docker ]; then
    cp .env.docker .env
    echo "Fichier .env.docker copie en .env"
else
    echo "Attention: .env.docker introuvable, le .env actuel sera utilise"
fi

# Creer le reseau si necessaire
if ! podman network exists app-network &>/dev/null; then
    echo "Creation du reseau app-network..."
    podman network create app-network
fi

# Creer les volumes necessaires
for vol in mysql-data redis-data node-modules; do
    if ! podman volume exists "$vol" &>/dev/null; then
        echo "Creation du volume $vol..."
        podman volume create "$vol"
    fi
done

# Configurer le domaine lesbi.test dans /etc/hosts
if ! grep -q "lesbi.test" /etc/hosts; then
    echo "Ajout de lesbi.test dans /etc/hosts (sudo requis)..."
    echo "127.0.0.1 lesbi.test" | sudo tee -a /etc/hosts > /dev/null
    echo "Domaine lesbi.test configure."
fi

# Demarrer les containers
echo "Construction et demarrage des services..."
podman-compose up -d --build

# Attendre que MySQL soit pret
echo "Attente que MySQL soit pret..."
until podman-compose exec php php -r "try { new PDO('mysql:host=mysql;dbname=${MYSQL_DATABASE}', '${MYSQL_USER}', '${MYSQL_PASSWORD}'); echo 'ok'; } catch(Exception \$e) { exit(1); }" 2>/dev/null; do
    sleep 2
done
echo "MySQL est pret."

# Installer les dependances et lancer les migrations
echo "Installation des dependances Composer..."
podman-compose exec php composer install --no-interaction --optimize-autoloader

echo "Lancement des migrations et seeds..."
podman-compose exec php php artisan migrate --seed --force

echo "Construction des assets frontend..."
podman-compose exec node npm run build

echo ""
echo "Containers demarres avec succes!"
echo ""
echo "Acces:"
echo "  - Application: https://lesbi.test"
echo "  - phpMyAdmin:  http://lesbi.test:${PMA_PORT:-8082}"
echo "  - Mailpit:     http://lesbi.test:${MAILPIT_UI:-8026}"
echo ""
echo "Note: Le certificat SSL est auto-signe, votre navigateur"
echo "affichera un avertissement de securite (c'est normal en dev)."
