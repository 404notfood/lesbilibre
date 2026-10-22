#!/usr/bin/env bash
# Initialize production data without Faker or demonstration passwords.
set -Eeuo pipefail
umask 077
APPLICATION_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
trap 'unset DEPLOY_ADMIN_PASSWORD password_confirmation' EXIT

read -r -p 'Adresse du compte administrateur [contact@lesbi-libre.fr] : ' DEPLOY_ADMIN_EMAIL
DEPLOY_ADMIN_EMAIL=${DEPLOY_ADMIN_EMAIL:-contact@lesbi-libre.fr}
read -r -s -p 'Mot de passe administrateur (24 caractères minimum) : ' DEPLOY_ADMIN_PASSWORD
printf '\n'
if (( ${#DEPLOY_ADMIN_PASSWORD} < 24 )); then
    printf 'Mot de passe trop court. Aucune initialisation effectuée.\n' >&2
    exit 1
fi
read -r -s -p 'Confirmer le mot de passe : ' password_confirmation
printf '\n'
if [[ $DEPLOY_ADMIN_PASSWORD != "$password_confirmation" ]]; then
    printf 'Les mots de passe diffèrent. Aucune initialisation effectuée.\n' >&2
    exit 1
fi
unset password_confirmation
export DEPLOY_ADMIN_EMAIL DEPLOY_ADMIN_PASSWORD
cd -- "$APPLICATION_DIR"
/usr/bin/php8.4 artisan db:seed --class=ProductionSeeder --force --no-interaction
