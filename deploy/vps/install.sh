#!/usr/bin/env bash
# VPS Project Generator 1.2.0 — review before running. Optional browser OS dependencies and user-local PM2; review capabilities.
# shellcheck disable=SC1112
# French diagnostic strings intentionally contain typographic apostrophes.
set -Eeuo pipefail
umask 027

PROJECT='lesbilibre'
TYPE='laravel-react'
MAIN_DOMAIN='lesbi-libre.fr'
PHP_VERSION='8.4'
NODE_MAJOR='24'
PM_REQUEST='npm'
DATABASE='mariadb'
DB_NAME='lesbilibre'
SOURCE='present'
REPOSITORY=''
BRANCH='main'
ARCHIVE=''
LAYOUT='simple'
APP='/home/lesbilibre/app'
PROJECT_HOME='/home/lesbilibre'
SHARED='/home/lesbilibre/shared'
HTTPS='1'
EMAIL='contact@lesbi-libre.fr'
SSH_ENABLED='1'
SSH_AUTH='password'
PUBLIC_KEY=''
REDIS_ENABLED='1'
ENV_NAME='.env'
ENV_EXAMPLE='.env.example'
SUPERVISOR='systemd'
IDENTITY='lesbilibre:laravel-react:simple:mariadb:8.4:24:build:.env:.:standard:systemd:dedicated'
DOMAINS=('lesbi-libre.fr')
DECLARED_PORTS=()

STATE="/var/lib/vps-projects/$PROJECT"
LOG="/var/log/vps-projects/$PROJECT.log"
BACKUP="/var/backups/vps-projects/$PROJECT/$(date -u +%Y%m%dT%H%M%SZ)-$$"
BACKUP_ROOT=$BACKUP
CONFIG_PHASE=0
TMP=''
NODE_BIN=''

PORT=''
REDIS_PORT=''
CHANGED=()
ENABLED_UNITS=()
RESTARTED_UNITS=()
STARTED_UNITS=()
REMOVED_ENABLED_UNITS=()
COMMITTED=0
SSH_RELOAD_REQUIRED=0
CURRENT_STAGE=preflight

log() { printf '[INFO] %s\n' "$*"; }
warn() { printf '[WARN] %s\n' "$*" >&2; }
error() { printf '[ERROR] %s\n' "$*" >&2; }
die() { error "$*"; exit 1; }
command_exists() { command -v "$1" >/dev/null 2>&1; }
file_hash() { sha256sum -- "$1" | awk '{print $1}'; }
record_for() { printf '%s/files/%s' "$STATE" "$(printf '%s' "$1" | sha256sum | awk '{print $1}')"; }
safe_file() { [[ ! -L $1 && ( ! -e $1 || -f $1 ) ]] || die "Fichier non régulier ou lien interdit : $1"; }
backup_file() {
    local path=$1
    safe_file "$path"
    if [[ -e $path ]]; then
        install -d -m 0700 "$BACKUP$(dirname "$path")"
        cp -a -- "$path" "$BACKUP$path"
    fi
}
assert_managed() {
    local path=$1 record
    safe_file "$path"
    record=$(record_for "$path")
    if [[ -e $path ]]; then
        [[ -f $record && ! -L $record && $(stat -c %u "$path") == 0 ]] || die "Configuration inconnue, refus d'écraser : $path"
        [[ $(file_hash "$path") == "$(cat "$record")" ]] || die "Configuration modifiée manuellement : $path. Sauvegarder puis réconcilier le registre root avant relance."
    elif [[ -e $record ]]; then
        die "Configuration gérée manquante : $path"
    fi
}
managed_write() {
    local path=$1 mode=0644 group=root candidate record
    if (( $# > 1 )); then mode=$2; fi
    if (( $# > 2 )); then group=$3; fi
    assert_managed "$path"
    candidate=$(mktemp "$TMP/config.XXXXXX")
    cat > "$candidate"
    if [[ -e $path ]] && cmp -s -- "$path" "$candidate"; then return 0; fi
    record=$(record_for "$path")
    if [[ " ${CHANGED[*]} " != *" $path "* ]]; then
        backup_file "$path"
        if [[ -f $record ]]; then
            install -d -m 0700 "$BACKUP/records"
            cp -a -- "$record" "$BACKUP/records/$(basename "$record")"
        fi
        CHANGED+=("$path")
    fi
    install -d -m 0755 "$(dirname "$path")"
    install -o root -g "$group" -m "$mode" "$candidate" "$path.vps-new"
    mv -Tf -- "$path.vps-new" "$path"
    file_hash "$path" > "$record"
}
rollback() {
    local path record i
    set +e
    warn "Rollback après étape $CURRENT_STAGE ; fichiers modifiés : ${#CHANGED[@]} ; nouveau lien Nginx : $(if [[ -f $TMP/new-nginx-link ]]; then printf oui; else printf non; fi)."
    for ((i=${#CHANGED[@]}-1; i>=0; i--)); do
        path=${CHANGED[i]}; record=$(record_for "$path")
        if [[ -f $BACKUP$path ]]; then cp -a -- "$BACKUP$path" "$path"; else rm -f -- "$path"; fi
        if [[ -f $BACKUP/records/$(basename "$record") ]]; then
            cp -a -- "$BACKUP/records/$(basename "$record")" "$record"
        else rm -f -- "$record"; fi
    done
    if [[ -f $TMP/new-nginx-link ]]; then rm -f -- "/etc/nginx/sites-enabled/$PROJECT.conf"; fi
    for path in "${ENABLED_UNITS[@]}"; do systemctl disable --now "$path" >/dev/null 2>&1; done
    for path in "${STARTED_UNITS[@]}"; do systemctl stop "$path" >/dev/null 2>&1; done
    systemctl daemon-reload
    for path in "${REMOVED_ENABLED_UNITS[@]}"; do systemctl enable "$path" >/dev/null 2>&1; done
    for path in "${RESTARTED_UNITS[@]}"; do systemctl restart "$path" || warn "Restauration du service échouée : $path"; done
    nginx -t && systemctl reload nginx
    if [[ -n $PHP_VERSION ]]; then systemctl reload "php$PHP_VERSION-fpm"; fi
    if [[ $SSH_RELOAD_REQUIRED == 1 ]]; then sshd -t && systemctl reload ssh || warn 'Restauration SSH échouée ; vérifier sshd -t.'; fi
    warn "Configurations restaurées. Les données DB, secrets, fichiers applicatifs et comptes sont conservés. Sauvegardes : $BACKUP"
}
on_exit() {
    local code=$?
    trap - EXIT ERR
    if (( code != 0 && COMMITTED == 0 )) && [[ -n $TMP ]]; then rollback; fi
    if [[ -n $TMP && -d $TMP && $TMP == /var/lib/vps-projects/.tmp-* ]]; then rm -r -- "$TMP"; fi
    exit "$code"
}
trap 'error "Échec ligne $LINENO (code $?). Aucun secret ni commande complète affiché. Journal : $LOG ; sauvegardes : $BACKUP"' ERR
trap on_exit EXIT

checkpoint_configuration() {
    # Provisioning survives missing sources or a later build failure. Subsequent
    # writes have a fresh backup scope so rollback restores the provisioned state.
    CHANGED=()
    ENABLED_UNITS=()
    RESTARTED_UNITS=()
    STARTED_UNITS=()
    REMOVED_ENABLED_UNITS=()
    SSH_RELOAD_REQUIRED=0
    rm -f -- "$TMP/new-nginx-link"
    ((CONFIG_PHASE+=1))
    BACKUP="$BACKUP_ROOT/phase-$CONFIG_PHASE"
    install -d -m 0700 "$BACKUP"
}

as_project() {
    runuser -u "$PROJECT" -- env -i "HOME=$PROJECT_HOME" "USER=$PROJECT" "LOGNAME=$PROJECT" "PM2_HOME=$PROJECT_HOME/.pm2" "LANG=C.UTF-8" "PATH=$PROJECT_HOME/.local/bin:${NODE_BIN:+$NODE_BIN:}/usr/local/bin:/usr/bin:/bin" "$@"
}
run_stage() {
    CURRENT_STAGE=$1
    printf '%s\n' "$CURRENT_STAGE" > "$STATE/last-stage"
    log "Étape : $CURRENT_STAGE"
    "$@"
    log "Étape terminée : $CURRENT_STAGE"
}
app_command() { as_project /bin/bash -c 'cd -- "$1"; shift; exec "$@"' -- "$APP" "$@"; }

node_command() { app_command "$NODE_BIN/node" "--env-file=$APP/$ENV_NAME" "$@"; }
project_exec() {
    local directory=$1 executable=$2; shift 2
    case $executable in
        node) executable="$NODE_BIN/node" ;;
        npm) set -- "$NODE_BIN/npm" "$@"; executable="$NODE_BIN/node" ;;
        php) executable="/usr/bin/php$PHP_VERSION" ;;
        *) die 'Exécutable de hook non autorisé.' ;;
    esac
    if [[ $executable == "$NODE_BIN/node" ]]; then set -- "--env-file=$APP/$ENV_NAME" "$@"; fi
    as_project /bin/bash -c 'cd -- "$1"; shift; exec "$@"' -- "$APP/$directory" "$executable" "$@"
}

preflight() {
    [[ $EUID == 0 ]] || die 'Exécuter avec sudo ou root.'
    [[ -r /etc/os-release ]] || die '/etc/os-release manquant.'
    # This is a trusted, root-owned OS file, never an application .env.
    . /etc/os-release
    [[ $ID == debian && $VERSION_ID == 13 ]] || die 'Debian 13 requis.'
    local cmd
    for cmd in nginx systemctl systemd-analyze runuser useradd usermod id cut head getent install flock openssl sha256sum stat awk grep sed find readlink ss ip tar mktemp tee cp mv cmp; do
        command_exists "$cmd" || die "Commande bootstrap manquante : $cmd"
    done
    systemctl is-active --quiet nginx || die 'Nginx inactif.'
    nginx -t || die 'Nginx est déjà invalide avant déploiement.'
    if [[ -n $PHP_VERSION ]]; then
        command_exists "php$PHP_VERSION" && command_exists "php-fpm$PHP_VERSION" || die "PHP $PHP_VERSION indisponible. Exécuter le bootstrap séparément."
        [[ $("php$PHP_VERSION" -r 'echo PHP_MAJOR_VERSION,".",PHP_MINOR_VERSION;') == "$PHP_VERSION" ]] || die 'Version PHP incorrecte.'
        systemctl is-active --quiet "php$PHP_VERSION-fpm" || die 'PHP-FPM inactif.'
        "php-fpm$PHP_VERSION" -t || die 'PHP-FPM déjà invalide.'
    fi
    if [[ -n $NODE_MAJOR ]]; then
        [[ -r /opt/nvm/nvm.sh && -x /opt/nvm/node-$NODE_MAJOR/node ]] || die "Node $NODE_MAJOR absent de /opt/nvm. Aucune installation automatique."
        NODE_BIN=$(readlink -f "/opt/nvm/node-$NODE_MAJOR")
        [[ $NODE_BIN == /opt/nvm/versions/node/v*/bin && $(stat -c %u "$NODE_BIN") == 0 ]] || die 'Chemin NVM partagé non conforme.'
        [[ $("$NODE_BIN/node" --version) == v$NODE_MAJOR.* ]] || die 'Version Node incorrecte.'
        [[ -x $NODE_BIN/npm ]] || die 'npm manquant.'
        env "PATH=$NODE_BIN:/usr/local/bin:/usr/bin:/bin" "$NODE_BIN/npm" --version || die 'npm installé mais inexécutable.'
    fi
    if [[ $TYPE == laravel* ]]; then command_exists composer || die 'Composer manquant.'; fi
    if [[ $DATABASE == mariadb ]]; then
        command_exists mariadb || die 'MariaDB manquant.'
        mariadb --protocol=socket --batch --skip-column-names -e 'SELECT 1' >/dev/null || die 'MariaDB root via socket requis.'
    elif [[ $DATABASE == postgresql ]]; then
        command_exists psql || die 'PostgreSQL manquant.'
        runuser -u postgres -- psql -XAt -v ON_ERROR_STOP=1 -c 'SELECT 1' >/dev/null || die 'PostgreSQL peer requis.'
    fi
    if [[ $REDIS_ENABLED == 1 ]]; then command_exists redis-server && command_exists redis-cli || die 'Binaires Redis manquants.'; fi
    if [[ $HTTPS == 1 ]]; then command_exists certbot && command_exists dig || die 'Certbot ou dig manquant.'; fi
    if [[ $SOURCE == git ]]; then command_exists git || die 'Git manquant.'; fi
    if [[ $SSH_ENABLED == 1 || -e /etc/ssh/sshd_config.d/10-vps-project-$PROJECT.conf || -L /etc/ssh/sshd_config.d/10-vps-project-$PROJECT.conf || -e $STATE/password-set || -e $PROJECT_HOME/.ssh/authorized_keys || -L $PROJECT_HOME/.ssh/authorized_keys ]]; then command_exists sshd && command_exists ssh-keygen || die 'OpenSSH manquant.'; fi
    command_exists logrotate || die 'logrotate absent du socle serveur.'






    log 'Préflight système OK ; disponibilité effective des runtimes vérifiée.'
}

setup_state() {
    install -d -m 0700 /var/lib/vps-projects
    exec 9>/var/lib/vps-projects/deploy.lock
    flock -n 9 || die 'Un autre déploiement est en cours.'
    [[ ! -L $STATE ]] || die 'État root lié interdit.'
    install -d -m 0700 "$STATE" "$STATE/files" "$BACKUP"
    if [[ -f $STATE/identity ]]; then
        [[ $(cat "$STATE/identity") == "$IDENTITY" ]] || die 'Type/runtime/layout/DB modifié : utiliser un nouveau nom ou effectuer une migration manuelle.'
    else
        ! getent passwd "$PROJECT" >/dev/null || die 'Utilisateur préexistant non géré ; refus de l’adopter.'
        [[ ! -e $PROJECT_HOME ]] || die 'Home préexistant non géré.'
        printf '%s\n' "$IDENTITY" > "$STATE/identity"
    fi
    TMP=$(mktemp -d /var/lib/vps-projects/.tmp-XXXXXXXX)
    install -d -m 0750 /var/log/vps-projects
    safe_file "$LOG"
    touch "$LOG"; chmod 0600 "$LOG"
    exec > >(tee -a "$LOG") 2>&1
}
setup_user() {
    local shell=/usr/sbin/nologin entry
    [[ $SSH_ENABLED != 1 ]] || shell=/bin/bash
    if ! getent passwd "$PROJECT" >/dev/null; then
        useradd --system --user-group --create-home --home-dir "$PROJECT_HOME" --shell "$shell" "$PROJECT"
    fi
    entry=$(getent passwd "$PROJECT")
    [[ $(cut -d: -f6 <<< "$entry") == "$PROJECT_HOME" && $(id -u "$PROJECT") != 0 ]] || die 'Compte projet non conforme.'
    [[ $(id -Gn "$PROJECT") == "$PROJECT" ]] || die 'Groupes supplémentaires du projet : audit manuel requis.'
    [[ -d $PROJECT_HOME && ! -L $PROJECT_HOME && $(stat -c %u "$PROJECT_HOME") == "$(id -u "$PROJECT")" ]] || die 'Home projet absent, lié ou de propriétaire incorrect.'
    # Repair traversal on reruns too, using the project UID inside its own home.
    as_project chmod 0711 "$PROJECT_HOME"
    usermod -s "$shell" "$PROJECT"
    for entry in "$PROJECT_HOME" "$SHARED" "$PROJECT_HOME/logs" "$PROJECT_HOME/backups"; do
        [[ ! -L $entry ]] || die "Lien de dossier interdit : $entry"
    done
    # All operations inside the user's writable home run with its UID, including group changes.
    as_project mkdir -p "$SHARED" "$PROJECT_HOME/logs" "$PROJECT_HOME/backups"
    as_project chmod 0750 "$SHARED" "$PROJECT_HOME/logs" "$PROJECT_HOME/backups"
    as_project "$NODE_BIN/node" --version || die 'Node inaccessible au compte applicatif.'
    as_project "$NODE_BIN/npm" --version || die 'npm inaccessible au compte applicatif.'
    log "Node/npm exécutables sous $PROJECT ; PATH applicatif : $NODE_BIN. Le PATH du shell SSH est indépendant."
    if [[ $LAYOUT == releases ]]; then
        [[ ! -L $PROJECT_HOME/releases ]] || die 'Lien releases interdit.'
        nginx_directory "$PROJECT_HOME/releases"
        if [[ ! -e $APP && ! -L $APP ]]; then
            nginx_directory "$PROJECT_HOME/releases/initial"
            as_project ln -s "$PROJECT_HOME/releases/initial" "$APP"
        fi
        [[ -L $APP && $(readlink -f "$APP") == "$PROJECT_HOME/releases/"* ]] || die 'current doit pointer dans les releases du projet.'
    else
        [[ ! -L $APP ]] || die 'Lien app interdit.'
        nginx_directory "$APP"
    fi
}
nginx_directory() {
    # A fixed command with the project UID and temporary www-data group; no project code or root chown.
    runuser -u "$PROJECT" -g www-data -- /usr/bin/mkdir -p -- "$1"
    runuser -u "$PROJECT" -g www-data -- /usr/bin/chgrp www-data -- "$1"
    as_project chmod 0750 "$1"
}

prepare_source() {
    if [[ $SOURCE == git ]]; then
        if [[ -z $(as_project find "$APP" -mindepth 1 -maxdepth 1 -print -quit) ]]; then
            as_project git clone --branch "$BRANCH" --single-branch -- "$REPOSITORY" "$APP"
        else
            as_project test -d "$APP/.git" || die 'Dossier non vide sans dépôt Git ; aucune écriture.'
            [[ $(app_command git remote get-url origin) == "$REPOSITORY" ]] || die 'Remote Git différent.'
            [[ $(app_command git branch --show-current) == "$BRANCH" ]] || die 'Branche Git différente.'
            log 'Dépôt existant conservé. Les mises à jour Git sont manuelles.'
        fi
    elif [[ $SOURCE == archive ]]; then
        [[ -f $ARCHIVE && ! -L $ARCHIVE ]] || die 'Archive VPS absente ou liée.'
        if [[ ! -f $STATE/archive-imported ]]; then
            [[ -z $(as_project find "$APP" -mindepth 1 -maxdepth 1 -print -quit) ]] || die 'Import archive refusé dans un dossier non vide.'
            install -m 0644 "$ARCHIVE" "$TMP/source.tar.gz"
            tar -tzf "$TMP/source.tar.gz" > "$TMP/archive-list"
            if grep -Ev '^(\./)?[A-Za-z0-9_.@+/-]+/?$' "$TMP/archive-list" || grep -E '(^/|(^|/)\.\.(/|$))' "$TMP/archive-list"; then die 'Chemin dangereux dans l’archive.'; fi
            tar -tvzf "$TMP/source.tar.gz" > "$TMP/archive-types"
            if grep -Ev '^[-d]' "$TMP/archive-types"; then die 'Liens et fichiers spéciaux interdits dans l’archive.'; fi
            chmod 0755 "$TMP"
            as_project tar --extract --gzip --file "$TMP/source.tar.gz" --directory "$APP" --no-same-owner --no-same-permissions
            chmod 0700 "$TMP"
            touch "$STATE/archive-imported"
        else log 'Archive déjà importée ; sources conservées.'; fi
    fi
    [[ -n $(as_project find "$APP" -mindepth 1 -maxdepth 1 -print -quit) ]] || die "Sources absentes : placer le projet réel dans $APP, puis relancer."
}

setup_env() {
    app_command mkdir -p "$(dirname "$ENV_NAME")"
    as_project test ! -L "$APP/$ENV_NAME" || die '.env lié interdit.'
    as_project test ! -L "$APP/$ENV_EXAMPLE" || die '.env.example lié interdit.'
    if as_project test -e "$APP/$ENV_NAME"; then
        as_project test -f "$APP/$ENV_NAME" || die '.env non régulier.'
        local env_backup
        env_backup="$PROJECT_HOME/backups/env-$(date -u +%Y%m%dT%H%M%SZ)-$$"
        app_command cp -p -- "$ENV_NAME" "$env_backup"
        as_project chmod 0600 "$env_backup"
        ENV_NEW=0
    else
        if as_project test -f "$APP/$ENV_EXAMPLE"; then app_command cp -- "$ENV_EXAMPLE" "$ENV_NAME"; else app_command touch "$ENV_NAME"; fi
        ENV_NEW=1
    fi
    app_command chmod 0600 "$ENV_NAME"
}
env_value() {
    as_project awk -v key="$1" 'index($0,key"=")==1 {v=substr($0,length(key)+2); if(v ~ /^".*"$/ || v ~ /^\047.*\047$/) v=substr(v,2,length(v)-2); print v; exit}' "$APP/$ENV_NAME"
}
env_require() {
    local key=$1 expected=$2
    if [[ $ENV_NEW == 0 ]] && app_command grep -q "^$key=" "$ENV_NAME"; then
        [[ $(env_value "$key") == "$expected" ]] || die "Variable $key existante incompatible. Adapter explicitement .env ou retirer cette clé pour permettre son initialisation. Aucune valeur remplacée."
    fi
}
env_set() {
    # Never source .env. Values travel via stdin to an unprivileged writer.
    local key=$1 value=$2
    if [[ $ENV_NEW == 0 ]] && app_command grep -q "^$key=" "$ENV_NAME"; then return 0; fi
    printf '%s\n' "$value" | as_project /bin/bash -c '
        set -euo pipefail; cd -- "$1"; key=$2; env_name=$3; IFS= read -r value
        tmp=$(mktemp "$env_name.vps.XXXXXX"); chmod 600 "$tmp"
        awk -v k="$key" "index(\$0,k\"=\")!=1" "$env_name" > "$tmp"
        printf "%s=%s\n" "$key" "$value" >> "$tmp"
        mv -f -- "$tmp" "$env_name"
    ' -- "$APP" "$key" "$ENV_NAME"
}

port_free() { ! ss -H -ltn "sport = :$1" | grep -q .; }
port_reserved_elsewhere() {
    local port=$1 own_file=$2 record reserved
    PORT_RESERVATION_FILE=''
    # Provisioned projects reserve their ports even before a service starts listening.
    for record in "${STATE%/*}"/*/*-port; do
        [[ -e $record || -L $record ]] || continue
        [[ $record != "$own_file" ]] || continue
        safe_file "$record"
        [[ $(stat -c %u "$record") == 0 ]] || die "Registre de port non root : $record"
        reserved=$(cat "$record")
        [[ $reserved =~ ^[1-9][0-9]{3,4}$ && $reserved -ge 1024 && $reserved -le 65535 ]] || die "Port réservé invalide : $record"
        if [[ $reserved == "$port" ]]; then
            PORT_RESERVATION_FILE=$record
            return 0
        fi
    done
    return 1
}
select_port() {
    local file=$1 base=$2 end=$3 requested=$4 mode=$5 saved p
    safe_file "$file"
    if [[ -f $file ]]; then
        saved=$(cat "$file")
        [[ $saved =~ ^[1-9][0-9]{3,4}$ && $saved -ge 1024 && $saved -le 65535 ]] || die 'Port enregistré invalide.'
        [[ $mode != manual || $requested == "$saved" ]] || die 'Port modifié : migration manuelle nécessaire.'
        if port_reserved_elsewhere "$saved" "$file"; then
            die "Port enregistré $saved déjà réservé par $PORT_RESERVATION_FILE ; migration manuelle nécessaire."
        fi
        if [[ $file == "$STATE/app-port" && $mode == auto && " ${DECLARED_PORTS[*]} " == *" $saved "* ]]; then
            die "Port automatique enregistré $saved utilisé par un autre processus déclaré ; migration manuelle nécessaire."
        fi
        if ! port_free "$saved"; then
            # The main checks that an occupied saved port actually belongs to our unit.
            local unit=$PROJECT
            [[ $SUPERVISOR != pm2 || $base == 16379 ]] || unit="$PROJECT-pm2"
            [[ $base != 16379 ]] || unit="$PROJECT-redis"
            [[ $TYPE != laravel-react || $base == 16379 || $SUPERVISOR == pm2 ]] || unit="$PROJECT-frontend"
            [[ -z ${6:-} ]] || unit=$6
            systemctl is-active --quiet "$unit" || die "Port enregistré $saved utilisé hors du service projet."
            local pid cgroup
            pid=$(ss -H -ltnp "sport = :$saved" | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -n1)
            [[ -n $pid && -r /proc/$pid/cgroup ]] || die 'Propriétaire du port indéterminé.'
            cgroup=$(cat "/proc/$pid/cgroup")
            [[ $cgroup == *"/$unit.service"* ]] || die "Collision de port $saved."
        fi
        SELECTED_PORT=$saved; return
    fi
    if [[ $mode == manual ]]; then
        if port_reserved_elsewhere "$requested" "$file"; then die "Port $requested déjà réservé par $PORT_RESERVATION_FILE."; fi
        port_free "$requested" || die "Port $requested occupé."
        p=$requested
    else
        p=$base
        while ! port_free "$p" || port_reserved_elsewhere "$p" "$file" || [[ " ${DECLARED_PORTS[*]} " == *" $p "* ]]; do ((p+=1)); [[ $p -le $end ]] || die 'Aucun port libre.'; done
    fi
    printf '%s\n' "$p" > "$file"
    SELECTED_PORT=$p
    log "Port local réservé : $SELECTED_PORT"
}

node_build() {
    as_project test -f "$APP/package.json" || die 'package.json absent.'
    local pm=$PM_REQUEST locks=0
    if [[ $pm == auto ]]; then
        pm=npm
        if as_project test -f "$APP/package-lock.json"; then ((locks+=1)); pm=npm; fi
        if as_project test -f "$APP/pnpm-lock.yaml"; then ((locks+=1)); pm=pnpm; fi
        if as_project test -f "$APP/yarn.lock"; then ((locks+=1)); pm=yarn; fi
        [[ $locks -le 1 ]] || die 'Plusieurs lockfiles : sélectionner explicitement un gestionnaire et nettoyer le projet.'
    fi
    if [[ $pm == npm ]]; then
        if as_project test -f "$APP/package-lock.json"; then
            check_native_dependencies lock
            node_command "$NODE_BIN/npm" ci --include=dev --include=optional
            check_native_dependencies load
        else node_command "$NODE_BIN/npm" install --include=dev --include=optional; fi
        prepare_node_build
        install_browsers
        if [[ $TYPE == nextjs || $TYPE == laravel-react ]] || node_command -e 'process.exit(require("./package.json").scripts?.build ? 0 : 1)'; then node_command "$NODE_BIN/npm" run build; fi
    else
        [[ -x $NODE_BIN/corepack ]] || die 'Corepack absent du bootstrap ; utiliser npm ou préparer le gestionnaire séparément.'
        # No global corepack enable/write into the shared, root-owned NVM tree.
        if [[ $pm == pnpm ]]; then
            if as_project test -f "$APP/pnpm-lock.yaml"; then node_command "$NODE_BIN/corepack" pnpm install --frozen-lockfile --prod=false; else node_command "$NODE_BIN/corepack" pnpm install --prod=false; fi
        else
            local yarn_major
            yarn_major=$(node_command "$NODE_BIN/corepack" yarn --version); yarn_major=${yarn_major%%.*}
            if as_project test -f "$APP/yarn.lock"; then
                if [[ $yarn_major == 1 ]]; then node_command "$NODE_BIN/corepack" yarn install --frozen-lockfile --production=false; else node_command "$NODE_BIN/corepack" yarn install --immutable; fi
            else node_command "$NODE_BIN/corepack" yarn install; fi
        fi
        prepare_node_build
        install_browsers
        if [[ $TYPE == nextjs || $TYPE == laravel-react ]] || node_command -e 'process.exit(require("./package.json").scripts?.build ? 0 : 1)'; then node_command "$NODE_BIN/corepack" "$pm" run build; fi
    fi
    log "Build terminé avec $pm et $NODE_BIN/node."
}
check_native_dependencies() {
    # stdin script, cwd root of the monorepo; project code always runs as its UID.
    node_command - "$1" <<'NATIVE_DEPENDENCIES'

const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
if (![2, 3].includes(lock.lockfileVersion) || !lock.packages) {
  throw new Error('package-lock.json v2/v3 requis pour vérifier les dépendances natives. Régénérer et relire le lockfile dans les sources.');
}
const packages = lock.packages;
const findDependency = (parent, name) => {
  let directory = parent;
  while (true) {
    const key = (directory ? directory + '/' : '') + 'node_modules/' + name;
    if (packages[key]) return packages[key];
    if (!directory) return undefined;
    directory = path.posix.dirname(directory);
    if (directory === '.') directory = '';
  }
};
let checked = 0;
for (const [location, entry] of Object.entries(packages)) {
  if (!/(^|\/)node_modules\/(lightningcss|next|@tailwindcss\/oxide)$/.test(location)) continue;
  if (/(^|\/)node_modules\/lightningcss$/.test(location) && !entry.optionalDependencies?.['lightningcss-linux-x64-gnu']) {
    throw new Error('Lockfile natif incomplet : métadonnées lightningcss-linux-x64-gnu absentes dans ' + location);
  }
  for (const [name, version] of Object.entries(entry.optionalDependencies || {})) {
    if (!/^(lightningcss-|@next\/swc-|@tailwindcss\/oxide-)/.test(name)) continue;
    // Keep all platforms in the source lockfile, not just this VPS's platform.
    const binary = findDependency(location, name);
    if (!binary || ( /^\d+\.\d+\.\d+$/.test(version) && binary.version !== version)) {
      throw new Error('Lockfile natif incomplet/incompatible : ' + name + ' demandé par ' + location + '. Réparer le lockfile dans une copie propre des sources, sans node_modules, puis redéployer. --include=optional ne recrée pas une entrée absente.');
    }
  }
  if (/(^|\/)node_modules\/lightningcss$/.test(location)) {
    checked++;
    if (process.argv[2] === 'load') {
      const localRequire = createRequire(path.resolve(location, 'package.json'));
      const css = localRequire(path.resolve(location));
      css.transform({ filename: 'smoke.css', code: Buffer.from('a { color: red; }'), minify: true });
    }
  }
}
console.log('Lockfile natif OK ; Lightning CSS : ' + checked + ' occurrence(s)' + (process.argv[2] === 'load' ? ', chargement et transformation OK' : ''));
NATIVE_DEPENDENCIES
}


setup_project_admin() {
    :
}
setup_project_mail() {
    :
}
configure_deployment_env() {
    env_set NODE_ENV production


    env_require 'APP_NAME' 'LesbiLibre'; env_set 'APP_NAME' 'LesbiLibre'
    env_require 'APP_LOCALE' 'fr'; env_set 'APP_LOCALE' 'fr'
    env_require 'APP_FALLBACK_LOCALE' 'fr'; env_set 'APP_FALLBACK_LOCALE' 'fr'
    env_require 'SUPPORT_EMAIL' 'contact@lesbi-libre.fr'; env_set 'SUPPORT_EMAIL' 'contact@lesbi-libre.fr'
    env_require 'SEO_INDEXING_ENABLED' 'false'; env_set 'SEO_INDEXING_ENABLED' 'false'
    env_require 'INERTIA_SSR_ENABLED' 'true'; env_set 'INERTIA_SSR_ENABLED' 'true'
    env_require 'SESSION_SECURE_COOKIE' 'true'; env_set 'SESSION_SECURE_COOKIE' 'true'
    env_require 'BROADCAST_CONNECTION' 'reverb'; env_set 'BROADCAST_CONNECTION' 'reverb'
    env_require 'DB_QUEUE_RETRY_AFTER' '660'; env_set 'DB_QUEUE_RETRY_AFTER' '660'
    env_require 'REDIS_QUEUE_RETRY_AFTER' '660'; env_set 'REDIS_QUEUE_RETRY_AFTER' '660'
    env_require 'MAIL_MAILER' 'log'; env_set 'MAIL_MAILER' 'log'
    env_require 'MAIL_FROM_ADDRESS' 'contact@lesbi-libre.fr'; env_set 'MAIL_FROM_ADDRESS' 'contact@lesbi-libre.fr'
    env_require 'REVERB_APP_ID' 'lesbilibre'; env_set 'REVERB_APP_ID' 'lesbilibre'
    env_require 'REVERB_HOST' '127.0.0.1'; env_set 'REVERB_HOST' '127.0.0.1'
    env_require 'REVERB_PORT' '18080'; env_set 'REVERB_PORT' '18080'
    env_require 'REVERB_SCHEME' 'http'; env_set 'REVERB_SCHEME' 'http'
    env_require 'REVERB_SERVER_HOST' '127.0.0.1'; env_set 'REVERB_SERVER_HOST' '127.0.0.1'
    env_require 'REVERB_SERVER_PORT' '18080'; env_set 'REVERB_SERVER_PORT' '18080'
    env_require 'VITE_REVERB_HOST' 'lesbi-libre.fr'; env_set 'VITE_REVERB_HOST' 'lesbi-libre.fr'
    env_require 'VITE_REVERB_PORT' '443'; env_set 'VITE_REVERB_PORT' '443'
    env_require 'VITE_REVERB_SCHEME' 'https'; env_set 'VITE_REVERB_SCHEME' 'https'
    env_require 'VITE_APP_NAME' 'LesbiLibre'; env_set 'VITE_APP_NAME' 'LesbiLibre'
    env_require 'MODERATION_SERVICE_URL' 'http://127.0.0.1:18000'; env_set 'MODERATION_SERVICE_URL' 'http://127.0.0.1:18000'
    env_require 'HUSKY' '0'; env_set 'HUSKY' '0'

    if [[ -z $(env_value 'REVERB_APP_KEY') || $ENV_NEW == 1 ]]; then env_set 'REVERB_APP_KEY' "$(openssl rand -hex 32)"; fi
    if [[ -z $(env_value 'REVERB_APP_SECRET') || $ENV_NEW == 1 ]]; then env_set 'REVERB_APP_SECRET' "$(openssl rand -hex 32)"; fi
    if [[ -z $(env_value 'MODERATION_API_TOKEN') || $ENV_NEW == 1 ]]; then env_set 'MODERATION_API_TOKEN' "$(openssl rand -hex 32)"; fi



}
validate_project_env() {
    node_command -e 'const keys=JSON.parse(process.argv[1]); for(const key of keys) { const value=process.env[key]; if(!value || /TODO_FILL|changeme|USER:PASSWORD|<openssl|\.\.\./i.test(value)) { console.error("Variable de production à remplir : " + key); process.exitCode=1; } }' '["REVERB_APP_KEY","REVERB_APP_SECRET","MODERATION_API_TOKEN","VITE_REVERB_APP_KEY"]' || die "Compléter $APP/$ENV_NAME puis relancer. Aucun secret remplacé."
}
prepare_node_build() {
    :


}
setup_browser_dependencies() {
    :
}
install_browsers() {
    :

}
finish_deployment() {

    :


}
run_backup() {
    :
}
setup_operations() {
    managed_write "/etc/logrotate.d/vps-project-$PROJECT" <<LOGROTATE
/var/log/vps-projects/$PROJECT.log {
    daily
    rotate 14
    missingok
    notifempty
    compress
    delaycompress
    copytruncate
    su root root
}
$PROJECT_HOME/logs/*.log $APP/logs/*.log $APP/storage/logs/*.log {
    daily
    rotate 14
    missingok
    notifempty
    compress
    delaycompress
    copytruncate
    su $PROJECT $PROJECT
}
LOGROTATE



}
activate_deployment() {
    :




    printf '%s\n' "${APP_UNITS[@]}" | sed '/^$/d' > "$STATE/units"
}



setup_database() {
    [[ $DATABASE != none ]] || return 0
    local existing_db existing_user DB_PASSWORD
    if [[ $DATABASE == mariadb ]]; then
        existing_db=$(mariadb --protocol=socket -NBe "SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$DB_NAME'")
        existing_user=$(mariadb --protocol=socket -NBe "SELECT COUNT(*) FROM mysql.user WHERE User='$DB_NAME'")
    else
        existing_db=$(runuser -u postgres -- psql -XAt -c "SELECT count(*) FROM pg_database WHERE datname='$DB_NAME'")
        existing_user=$(runuser -u postgres -- psql -XAt -c "SELECT count(*) FROM pg_roles WHERE rolname='$DB_NAME'")
    fi
    if [[ ! -f $STATE/db-claimed ]]; then
        [[ $existing_db == 0 && $existing_user == 0 ]] || die 'Base ou compte DB préexistant non géré ; aucune adoption.'
        touch "$STATE/db-claimed"
    fi
    if [[ ! -f $STATE/db-password ]]; then openssl rand -hex 32 > "$STATE/db-password"; chmod 0600 "$STATE/db-password"; fi
    DB_PASSWORD=$(cat "$STATE/db-password")
    [[ $DB_PASSWORD =~ ^[a-f0-9]{64}$ ]] || die 'Secret DB enregistré invalide.'
    if [[ $DATABASE == mariadb ]]; then
        # SQL uses a restricted identifier and a generated hex secret; stdin, never argv/logs.
        if ! mariadb --protocol=socket > "$TMP/db-create.out" 2> "$TMP/db-create.err" <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_NAME'@'127.0.0.1' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_NAME'@'127.0.0.1';
SQL
        then die 'Création MariaDB échouée (diagnostic SQL masqué pour protéger les secrets).'; fi
        # Check credentials without putting the password in argv.
        MYSQL_PWD=$DB_PASSWORD mariadb --host=127.0.0.1 --user="$DB_NAME" "$DB_NAME" -e 'SELECT 1' >/dev/null || die 'Authentification MariaDB échouée. Aucun secret existant remplacé.'
    else
        if [[ $existing_user == 0 ]]; then
            if ! runuser -u postgres -- psql -X -v ON_ERROR_STOP=1 > "$TMP/db-create.out" 2> "$TMP/db-create.err" <<SQL
CREATE ROLE "$DB_NAME" LOGIN PASSWORD '$DB_PASSWORD' NOSUPERUSER NOCREATEDB NOCREATEROLE;
SQL
            then die 'Création du rôle PostgreSQL échouée (diagnostic SQL masqué pour protéger les secrets).'; fi
        fi
        if [[ $existing_db == 0 ]]; then runuser -u postgres -- createdb --owner="$DB_NAME" "$DB_NAME"; fi
        # Verify an existing DB's owner before allowing schema changes.
        [[ $(runuser -u postgres -- psql -XAt -c "SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname='$DB_NAME'") == "$DB_NAME" ]] || die 'Propriétaire PostgreSQL différent.'
        PGPASSWORD=$DB_PASSWORD psql -X -h 127.0.0.1 -U "$DB_NAME" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c 'SELECT 1' >/dev/null || die 'Authentification PostgreSQL échouée.'
    fi
}

configure_database_env() {
    [[ $DATABASE != none ]] || return 0
    local DB_PASSWORD
    [[ -f $STATE/db-claimed && -f $STATE/db-password ]] || die 'Base non préparée : exécuter le provisionnement avant la configuration .env.'
    DB_PASSWORD=$(cat "$STATE/db-password")
    [[ $DB_PASSWORD =~ ^[a-f0-9]{64}$ ]] || die 'Secret DB enregistré invalide.'
    # Validate every existing key before any write; a retry must retain managed credentials.
    env_require DB_HOST 127.0.0.1
    env_require DB_DATABASE "$DB_NAME"
    env_require DB_USERNAME "$DB_NAME"
    env_require DB_PASSWORD "$DB_PASSWORD"
    if [[ $DATABASE == mariadb ]]; then env_require DB_CONNECTION mysql; env_require DB_PORT 3306
    else env_require DB_CONNECTION pgsql; env_require DB_PORT 5432; fi
    if [[ $DATABASE == mariadb ]]; then env_set DB_CONNECTION mysql; env_set DB_PORT 3306
    else env_set DB_CONNECTION pgsql; env_set DB_PORT 5432; fi
    env_set DB_HOST 127.0.0.1; env_set DB_DATABASE "$DB_NAME"; env_set DB_USERNAME "$DB_NAME"; env_set DB_PASSWORD "$DB_PASSWORD"
}


setup_redis() {
    local current
    select_port "$STATE/redis-port" 16379 17379 0 auto
    REDIS_PORT=$SELECTED_PORT
    if [[ ! -f $STATE/redis-password ]]; then openssl rand -hex 32 > "$STATE/redis-password"; chmod 0600 "$STATE/redis-password"; fi
    REDIS_PASSWORD=$(cat "$STATE/redis-password")
    [[ $REDIS_PASSWORD =~ ^[a-f0-9]{64}$ ]] || die 'Secret Redis invalide.'
    env_require REDIS_HOST 127.0.0.1
    env_require REDIS_PORT "$REDIS_PORT"
    env_require REDIS_PASSWORD "$REDIS_PASSWORD"
    env_require REDIS_URL "redis://default:$REDIS_PASSWORD@127.0.0.1:$REDIS_PORT"
    if [[ $ENV_NEW == 0 ]]; then
        current=$(env_value REDIS_PASSWORD)
        [[ -z $current || $current == "$REDIS_PASSWORD" ]] || die 'REDIS_PASSWORD existant différent ; aucune rotation automatique.'
    fi
    as_project mkdir -p "$SHARED/redis"
    as_project chmod 0700 "$SHARED/redis"
    managed_write "/etc/vps-projects/$PROJECT/redis.conf" 0640 "$PROJECT" <<REDIS
# Managed by VPS Project Generator : $PROJECT
bind 127.0.0.1
protected-mode yes
port $REDIS_PORT
daemonize no
supervised no
requirepass $REDIS_PASSWORD
dir $SHARED/redis
appendonly yes
appendfsync everysec
maxmemory 256mb
maxmemory-policy noeviction
logfile ""
REDIS
    managed_write "/etc/systemd/system/$PROJECT-redis.service" <<UNIT
# Managed by VPS Project Generator : $PROJECT
[Unit]
Description=$PROJECT Redis local isolé
After=network.target
[Service]
Type=simple
User=$PROJECT
Group=$PROJECT
ExecStart=/usr/bin/redis-server /etc/vps-projects/$PROJECT/redis.conf
Restart=on-failure
RestartSec=3
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=$SHARED/redis
StandardOutput=journal
StandardError=journal
[Install]
WantedBy=multi-user.target
UNIT
    systemd-analyze verify "/etc/systemd/system/$PROJECT-redis.service"
    systemctl daemon-reload
    enable_unit "$PROJECT-redis.service"
    REDISCLI_AUTH=$REDIS_PASSWORD redis-cli -h 127.0.0.1 -p "$REDIS_PORT" --no-auth-warning ping | grep -qx PONG || die 'Instance Redis projet non disponible.'
    env_set REDIS_HOST 127.0.0.1; env_set REDIS_PORT "$REDIS_PORT"; env_set REDIS_PASSWORD "$REDIS_PASSWORD"
    env_set REDIS_PREFIX "$PROJECT:"
    env_set REDIS_URL "redis://default:$REDIS_PASSWORD@127.0.0.1:$REDIS_PORT"
    unset REDIS_PASSWORD
}


check_application() {
    as_project test -f "$APP/artisan" && as_project test -f "$APP/composer.json" && as_project test -d "$APP/public" || die 'Projet Laravel incomplet (artisan, composer.json, public/).'
    local ext
    for ext in mbstring openssl PDO tokenizer xml ctype fileinfo; do
        as_project "/usr/bin/php$PHP_VERSION" -r "exit(extension_loaded('$ext') ? 0 : 1);" || die "Extension PHP requise : $ext"
    done
    if [[ $DATABASE == mariadb ]]; then as_project "/usr/bin/php$PHP_VERSION" -r 'exit(extension_loaded("pdo_mysql") ? 0 : 1);' || die 'pdo_mysql manquant.'; fi
    if [[ $DATABASE == postgresql ]]; then as_project "/usr/bin/php$PHP_VERSION" -r 'exit(extension_loaded("pdo_pgsql") ? 0 : 1);' || die 'pdo_pgsql manquant.'; fi
}
configure_env() {
    env_require APP_ENV production; env_require APP_DEBUG false
    env_set APP_ENV production; env_set APP_DEBUG false
    env_set APP_URL "https://$MAIN_DOMAIN"

    env_set REDIS_CLIENT predis
    if as_project "/usr/bin/php$PHP_VERSION" -r 'exit(extension_loaded("redis") ? 0 : 1);'; then
        if [[ $ENV_NEW == 1 ]]; then env_set REDIS_CLIENT phpredis; fi
    else
        app_command grep -q '"predis/predis"' composer.json || die 'Redis PHP absent : ajouter predis/predis au projet ou préparer php-redis via le bootstrap.'
    fi
    env_set CACHE_STORE redis; env_set CACHE_DRIVER redis; env_set SESSION_DRIVER redis
    env_require QUEUE_CONNECTION redis
    env_set QUEUE_CONNECTION redis
}
deploy_application() {
    # Explicit PHP binary, Composer never under root. Package scripts use the same PHP via a private bin.
    as_project mkdir -p "$PROJECT_HOME/.local/bin"
    as_project ln -sfn "/usr/bin/php$PHP_VERSION" "$PROJECT_HOME/.local/bin/php"
    as_project env "PATH=$PROJECT_HOME/.local/bin:${NODE_BIN:+$NODE_BIN:}/usr/local/bin:/usr/bin:/bin" /bin/bash -c 'cd -- "$1"; exec "$2" "$3" install --no-dev --prefer-dist --optimize-autoloader --no-interaction' -- "$APP" "/usr/bin/php$PHP_VERSION" "$(command -v composer)"
    if [[ -z $(env_value APP_KEY) ]]; then app_command "/usr/bin/php$PHP_VERSION" artisan key:generate --force; fi
    app_command "/usr/bin/php$PHP_VERSION" artisan storage:link
    node_build
    app_command "/usr/bin/php$PHP_VERSION" artisan migrate --force
    app_command "/usr/bin/php$PHP_VERSION" artisan config:cache
    app_command "/usr/bin/php$PHP_VERSION" artisan route:cache
    app_command "/usr/bin/php$PHP_VERSION" artisan view:cache
    as_project find "$APP/storage" "$APP/bootstrap/cache" -type d -exec chmod 0750 {} +
    as_project find "$APP/storage" "$APP/bootstrap/cache" -type f -exec chmod 0640 {} +
    # Nginx needs only public assets; PHP executes as the project user.
    as_project find "$APP/public" -type d -exec chmod 0755 {} +
    as_project find "$APP/public" -type f -exec chmod 0644 {} +
    as_project chmod 0711 "$APP/storage" "$APP/storage/app"
    if as_project test -d "$APP/storage/app/public"; then
        as_project find "$APP/storage/app/public" -type d -exec chmod 0755 {} +
        as_project find "$APP/storage/app/public" -type f -exec chmod 0644 {} +
    fi
}


setup_php() {
    managed_write "/etc/php/$PHP_VERSION/fpm/pool.d/$PROJECT.conf" <<POOL
; Managed by VPS Project Generator : $PROJECT
[$PROJECT]
user = $PROJECT
group = $PROJECT
listen = /run/php/php$PHP_VERSION-fpm-$PROJECT.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660
pm = dynamic
pm.max_children = 4
pm.start_servers = 1
pm.min_spare_servers = 1
pm.max_spare_servers = 3
pm.max_requests = 500
request_terminate_timeout = 120s
catch_workers_output = yes
clear_env = yes
security.limit_extensions = .php
php_admin_value[upload_max_filesize] = 100M
php_admin_value[post_max_size] = 102M
php_admin_flag[display_errors] = off
php_admin_flag[log_errors] = on
php_admin_value[error_log] = $PROJECT_HOME/logs/php-error.log
POOL
    "php-fpm$PHP_VERSION" -t || die "Validation PHP-FPM échouée ; pool non activé ; sauvegarde : $BACKUP"
    systemctl reload "php$PHP_VERSION-fpm"
}


APP_UNITS=()
reserve_application_ports() {


    :
}

setup_services() {
    APP_UNITS+=("$PROJECT-redis.service")

    managed_write "/etc/systemd/system/lesbilibre-queue@.service" <<UNIT
# Managed by VPS Project Generator : $PROJECT
[Unit]
Description=$PROJECT — lesbilibre-queue@
After=network.target lesbilibre-redis.service
Requires=lesbilibre-redis.service
[Service]
Type=simple
User=$PROJECT
Group=$PROJECT
WorkingDirectory=$APP
Environment="HOME=$PROJECT_HOME"
Environment="PATH=$NODE_BIN:/usr/local/bin:/usr/bin:/bin"
Environment=NODE_ENV=production
ExecStart=/usr/bin/php8.4 $APP/artisan queue:work redis --sleep=3 --timeout=600 --tries=3 --max-time=3600
Restart=always
RestartSec=5
TimeoutStopSec=630
KillSignal=SIGTERM
UMask=0027
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=$PROJECT_HOME
RestrictSUIDSGID=true
LimitNOFILE=65536
TasksMax=512
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
UNIT
    systemd-analyze verify "/etc/systemd/system/lesbilibre-queue@.service"
    APP_UNITS+=("lesbilibre-queue@.service")
    unset 'APP_UNITS[${#APP_UNITS[@]}-1]'
    APP_UNITS+=('lesbilibre-queue@1.service')
    APP_UNITS+=('lesbilibre-queue@2.service')

    managed_write "/etc/systemd/system/$PROJECT-scheduler.service" <<UNIT
# Managed by VPS Project Generator : $PROJECT
[Unit]
Description=$PROJECT Laravel scheduler
After=network.target lesbilibre-redis.service
[Service]
Type=oneshot
User=$PROJECT
Group=$PROJECT
WorkingDirectory=$APP
ExecStart=/usr/bin/php$PHP_VERSION $APP/artisan schedule:run
UMask=0027
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=$PROJECT_HOME
StandardOutput=journal
StandardError=journal
UNIT
    managed_write "/etc/systemd/system/$PROJECT-scheduler.timer" <<UNIT
# Managed by VPS Project Generator : $PROJECT
[Unit]
Description=$PROJECT scheduler chaque minute
[Timer]
OnCalendar=*-*-* *:*:00
AccuracySec=1s
Persistent=true
Unit=$PROJECT-scheduler.service
[Install]
WantedBy=timers.target
UNIT
    systemd-analyze verify "/etc/systemd/system/$PROJECT-scheduler.service" "/etc/systemd/system/$PROJECT-scheduler.timer"
    APP_UNITS+=("$PROJECT-scheduler.timer")
    :
}

enable_unit() {
    local unit=$1
    if ! systemctl is-enabled --quiet "$unit"; then ENABLED_UNITS+=("$unit"); fi
    if systemctl is-active --quiet "$unit"; then RESTARTED_UNITS+=("$unit"); else STARTED_UNITS+=("$unit"); fi
    systemctl enable "$unit"
    systemctl restart "$unit"
    sleep 1
    local i
    for ((i=0;i<10;i++)); do
        if systemctl is-active --quiet "$unit"; then return 0; fi
        sleep 1
    done
    die "Service inactif : $unit ; journalctl -u $unit"
}
activate_services() {
    local unit
    systemctl daemon-reload
    for unit in "${APP_UNITS[@]}"; do if [[ -n $unit && $unit != "$PROJECT-redis.service" ]]; then enable_unit "$unit"; fi; done

    # Remove only activations previously registered by this project's root state.
    if [[ -f $STATE/units ]]; then
        while IFS= read -r unit; do
            [[ $unit == "$PROJECT"*.service || $unit == "$PROJECT"*.timer ]] || die 'Registre de services invalide.'
            if [[ " ${APP_UNITS[*]} " != *" $unit "* ]]; then
                if systemctl is-enabled --quiet "$unit"; then REMOVED_ENABLED_UNITS+=("$unit"); fi
                if systemctl is-active --quiet "$unit"; then RESTARTED_UNITS+=("$unit"); fi
                systemctl disable --now "$unit"
                log "Service précédemment géré désactivé : $unit"
            fi
        done < "$STATE/units"
    fi
    printf '%s\n' "${APP_UNITS[@]}" | sed '/^$/d' > "$STATE/units"
    nginx -t && systemctl reload nginx
}


CERTIFICATE_READY=0
nginx_site_preflight() {
    install -d -m 0755 /etc/nginx/sites-available /etc/nginx/sites-enabled
    install -d -m 0755 "/var/www/vps-project-acme/$PROJECT/.well-known/acme-challenge"
    local link="/etc/nginx/sites-enabled/$PROJECT.conf" target="/etc/nginx/sites-available/$PROJECT.conf"
    if [[ -e $link || -L $link ]]; then
        [[ -L $link && $(readlink -f "$link") == "$target" ]] || die 'Vhost activé inconnu ; refus de remplacement.'
    fi
    # Check that none of our hosts are already served by another project's config.
    local file host
    for file in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
        [[ -e $file && $(readlink -f "$file") != "$target" ]] || continue
        for host in "${DOMAINS[@]}"; do
            if awk -v h="$host" '$1=="server_name" {for(i=2;i<=NF;i++){gsub(/;/,"",$i);if($i==h)found=1}} END {exit !found}' "$file"; then
                die "Domaine $host déjà configuré ailleurs : $file"
            fi
        done
    done
}
nginx_activate_vhost() {
    local link="/etc/nginx/sites-enabled/$PROJECT.conf" target="/etc/nginx/sites-available/$PROJECT.conf"
    if [[ ! -L $link ]]; then
        ln -s "$target" "$link"
        touch "$TMP/new-nginx-link"
    fi
    # A valid global config can silently omit sites-enabled; verify the actual loaded files.
    if ! nginx -T > "$TMP/nginx-loaded.conf" 2> "$TMP/nginx-validation.log"; then
        cat "$TMP/nginx-validation.log" >&2
        die "Nginx invalide ; nouvelle configuration non activée ; sauvegarde : $BACKUP"
    fi
    cat "$TMP/nginx-validation.log" >&2
    grep -qxF "# Managed by VPS Project Generator : $PROJECT" "$TMP/nginx-loaded.conf" || die "Nginx ignore le vhost $link. Vérifier include /etc/nginx/sites-enabled/*; dans le bloc http de /etc/nginx/nginx.conf."
    if grep -qF 'conflicting server name' "$TMP/nginx-validation.log"; then
        die 'Nginx ignore un domaine en conflit ; corriger les server_name existants avant activation.'
    fi
    systemctl reload nginx || die 'Rechargement Nginx échoué.'
    systemctl is-active --quiet nginx || die 'Nginx inactif après rechargement.'
    log "Vhost chargé et activé : $link"
}
setup_initial_nginx() {
    nginx_site_preflight
    local target="/etc/nginx/sites-available/$PROJECT.conf"
    if [[ -e $target || -L $target ]]; then
        # Preserve a previous deployment while sources/build/services are being prepared.
        assert_managed "$target"
        nginx_prepare_new_hosts "$target"
    else
        managed_write "$target" <<NGINX_INITIAL
# Managed by VPS Project Generator : lesbilibre
log_format lesbilibre_dashboard '\$host \$remote_addr - \$remote_user [\$time_local] "\$request_method \$uri \$server_protocol" \$status \$body_bytes_sent';
# Pending application deployment
server {
    listen 80;
    listen [::]:80;
    server_name lesbi-libre.fr;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location ~ /\.(?!well-known(?:/|\$)) { deny all; }
    location ~* (?:^|/)(?:composer\.(?:json|lock)|package(?:-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|README\.md|manifest\.json|install\.sh)\$ { deny all; }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    location / {
        default_type text/plain;
        add_header Retry-After 60 always;
        return 503 "Projet lesbilibre provisionné. Application en attente de déploiement.\n";
    }
}
NGINX_INITIAL
    fi
    nginx_activate_vhost
}
nginx_prepare_new_hosts() {
    local target=$1 host candidate
    local pending_hosts=() pending_app_hosts=() pending_redirect_hosts=()
    for host in "${DOMAINS[@]}"; do
        if ! awk -v h="$host" '$1=="server_name" {for(i=2;i<=NF;i++){gsub(/;/,"",$i);if($i==h)found=1}} END {exit !found}' "$target"; then
            pending_hosts+=("$host")
        fi
    done
    (( ${#pending_hosts[@]} > 0 )) || return 0
    nginx_classify_pending_hosts
    candidate="$TMP/nginx-new-hosts.conf"
    cat "$target" > "$candidate"
    nginx_pending_connection_map "$candidate"
    printf '\n# Pending additional hostnames\n' >> "$candidate"
    if (( ${#pending_app_hosts[@]} > 0 )); then
        cat >> "$candidate" <<NGINX_NEW_HOSTS
server {
    listen 80;
    listen [::]:80;
    server_name ${pending_app_hosts[*]};
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location ~ /\.(?!well-known(?:/|\$)) { deny all; }
    location ~* (?:^|/)(?:composer\.(?:json|lock)|package(?:-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|README\.md|manifest\.json|install\.sh)\$ { deny all; }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    location / {
        default_type text/plain;
        add_header Retry-After 60 always;
        return 503 "Projet lesbilibre provisionné. Application en attente de déploiement.\n";
    }
}
NGINX_NEW_HOSTS
    fi
    if (( ${#pending_redirect_hosts[@]} > 0 )); then
        cat >> "$candidate" <<NGINX_NEW_REDIRECT_HOSTS
server {
    listen 80;
    listen [::]:80;
    server_name ${pending_redirect_hosts[*]};
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location / { return 301 https://lesbi-libre.fr\$request_uri; }
}
NGINX_NEW_REDIRECT_HOSTS
    fi
    managed_write "$target" < "$candidate"
}
nginx_classify_pending_hosts() {
    local host
    for host in "${pending_hosts[@]}"; do
        case "$host" in
            '') pending_redirect_hosts+=("$host") ;;
            *) pending_app_hosts+=("$host") ;;
        esac
    done
}
nginx_pending_connection_map() {
    :
}
nginx_prepare_https_hosts() {
    local target=$1 host candidate
    local pending_hosts=() pending_app_hosts=() pending_redirect_hosts=()
    for host in "${DOMAINS[@]}"; do
        # Keep deployed server blocks. Only hostnames without a TLS block receive a pending HTTPS endpoint.
        if ! awk -v h="$host" '
            $1=="server" && $2=="{" {tls=0;found=0}
            $1=="listen" && /ssl/ {tls=1}
            $1=="server_name" {for(i=2;i<=NF;i++){gsub(/;/,"",$i);if($i==h)found=1}}
            $1=="}" && tls && found {present=1}
            END {exit !present}' "$target"; then
            pending_hosts+=("$host")
        fi
    done
    (( ${#pending_hosts[@]} > 0 )) || return 0
    nginx_classify_pending_hosts
    candidate="$TMP/nginx-new-https-hosts.conf"
    cat "$target" > "$candidate"
    nginx_pending_connection_map "$candidate"
    printf '\n# Pending additional HTTPS hostnames\n' >> "$candidate"
    if (( ${#pending_app_hosts[@]} > 0 )); then
        cat >> "$candidate" <<NGINX_NEW_HTTPS_HOSTS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${pending_app_hosts[*]};
    ssl_certificate /etc/letsencrypt/live/lesbilibre/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lesbilibre/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:lesbilibre_SSL:10m;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location ~ /\.(?!well-known(?:/|\$)) { deny all; }
    location ~* (?:^|/)(?:composer\.(?:json|lock)|package(?:-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|README\.md|manifest\.json|install\.sh)\$ { deny all; }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    location / {
        default_type text/plain;
        add_header Retry-After 60 always;
        return 503 "Projet lesbilibre provisionné. Application en attente de déploiement.\n";
    }
}
NGINX_NEW_HTTPS_HOSTS
    fi
    if (( ${#pending_redirect_hosts[@]} > 0 )); then
        cat >> "$candidate" <<NGINX_NEW_HTTPS_REDIRECT_HOSTS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${pending_redirect_hosts[*]};
    ssl_certificate /etc/letsencrypt/live/lesbilibre/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lesbilibre/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:lesbilibre_SSL:10m;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location / { return 301 https://lesbi-libre.fr\$request_uri; }
}
NGINX_NEW_HTTPS_REDIRECT_HOSTS
    fi
    managed_write "$target" < "$candidate"
    nginx_activate_vhost
}
setup_nginx() {
    nginx_site_preflight
    local target="/etc/nginx/sites-available/$PROJECT.conf"
    if [[ $HTTPS == 1 && -f $STATE/cert-claimed && -f /etc/letsencrypt/live/$PROJECT/fullchain.pem ]]; then
        managed_write "$target" <<NGINX_EXISTING_TLS
# Managed by VPS Project Generator : lesbilibre
log_format lesbilibre_dashboard '\$host \$remote_addr - \$remote_user [\$time_local] "\$request_method \$uri \$server_protocol" \$status \$body_bytes_sent';
server {
    listen 80;
    listen [::]:80;
    server_name lesbi-libre.fr;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location / { return 301 https://lesbi-libre.fr\$request_uri; }
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name lesbi-libre.fr;
    ssl_certificate /etc/letsencrypt/live/lesbilibre/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lesbilibre/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:lesbilibre_SSL:10m;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location ~ /\.(?!well-known(?:/|\$)) { deny all; }
    location ~* (?:^|/)(?:composer\.(?:json|lock)|package(?:-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|README\.md|manifest\.json|install\.sh)\$ { deny all; }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    root /home/lesbilibre/app/public;
    disable_symlinks if_not_owner from=\$document_root;
    index index.php index.html;
    location / { try_files \$uri \$uri/ /index.php?\$query_string; }
    location ~* \.(?:css|js|mjs|png|jpe?g|gif|svg|ico|webp|woff2?)\$ { expires 7d; add_header Cache-Control "public"; try_files \$uri =404; }
    location = /index.php {
        try_files \$uri =404;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT \$realpath_root;
        fastcgi_pass unix:/run/php/php8.4-fpm-lesbilibre.sock;
        fastcgi_read_timeout 120s;
    }
    location ~ \.php\$ { return 404; }
}
NGINX_EXISTING_TLS
    else
        managed_write "$target" <<NGINX_HTTP
# Managed by VPS Project Generator : lesbilibre
log_format lesbilibre_dashboard '\$host \$remote_addr - \$remote_user [\$time_local] "\$request_method \$uri \$server_protocol" \$status \$body_bytes_sent';
server {
    listen 80;
    listen [::]:80;
    server_name lesbi-libre.fr;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location ~ /\.(?!well-known(?:/|\$)) { deny all; }
    location ~* (?:^|/)(?:composer\.(?:json|lock)|package(?:-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|README\.md|manifest\.json|install\.sh)\$ { deny all; }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    root /home/lesbilibre/app/public;
    disable_symlinks if_not_owner from=\$document_root;
    index index.php index.html;
    location / { try_files \$uri \$uri/ /index.php?\$query_string; }
    location ~* \.(?:css|js|mjs|png|jpe?g|gif|svg|ico|webp|woff2?)\$ { expires 7d; add_header Cache-Control "public"; try_files \$uri =404; }
    location = /index.php {
        try_files \$uri =404;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT \$realpath_root;
        fastcgi_pass unix:/run/php/php8.4-fpm-lesbilibre.sock;
        fastcgi_read_timeout 120s;
    }
    location ~ \.php\$ { return 404; }
}
NGINX_HTTP
    fi
    nginx_activate_vhost
}
request_certificate() {
    [[ $HTTPS == 1 ]] || return 0
    [[ $CERTIFICATE_READY != 1 ]] || return 0
    local host address addresses locals
    locals=$(ip -o addr show | awk '{split($4,a,"/"); print a[1]}')
    for host in "${DOMAINS[@]}"; do
        addresses=$({ dig +short A "$host"; dig +short AAAA "$host"; } | awk '/^[0-9.]+$|^[0-9a-fA-F:]+$/' | sort -u) || die "DNS non résolu : $host"
        [[ -n $addresses ]] || die "DNS vide : $host"
        while IFS= read -r address; do
            grep -qxF "$address" <<< "$locals" || die "DNS $host -> $address absent des interfaces locales. Vérifier A/AAAA ; NAT/CDN nécessite une adaptation manuelle."
        done <<< "$addresses"
    done
    if [[ -d /etc/letsencrypt/live/$PROJECT && ! -f $STATE/cert-claimed ]]; then die 'Nom de certificat préexistant non géré.'; fi
    touch "$STATE/cert-claimed"
    local args=()
    for host in "${DOMAINS[@]}"; do args+=(-d "$host"); done
    certbot certonly --webroot --webroot-path "/var/www/vps-project-acme/$PROJECT" --cert-name "$PROJECT" --email "$EMAIL" --agree-tos --non-interactive --keep-until-expiring --expand --deploy-hook '/usr/sbin/nginx -t && /usr/bin/systemctl reload nginx' "${args[@]}" || die 'Certificat échoué : vérifier DNS A/AAAA, accessibilité publique du port 80 et quotas Let’s Encrypt. HTTP restauré selon la sauvegarde.'
    [[ -s /etc/letsencrypt/live/$PROJECT/fullchain.pem && -s /etc/letsencrypt/live/$PROJECT/privkey.pem ]] || die 'Certbot terminé sans certificat et clé utilisables ; vhost HTTP conservé.'
    CERTIFICATE_READY=1
}
setup_initial_https() {
    [[ $HTTPS == 1 ]] || return 0
    local target="/etc/nginx/sites-available/$PROJECT.conf"
    request_certificate
    # A live deployment keeps its existing HTTP/TLS application during preparation.
    if grep -qxF '# Pending application deployment' "$target"; then
        managed_write "$target" <<NGINX_INITIAL_TLS
# Managed by VPS Project Generator : lesbilibre
log_format lesbilibre_dashboard '\$host \$remote_addr - \$remote_user [\$time_local] "\$request_method \$uri \$server_protocol" \$status \$body_bytes_sent';
# Pending application deployment
server {
    listen 80;
    listen [::]:80;
    server_name lesbi-libre.fr;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location / { return 301 https://lesbi-libre.fr\$request_uri; }
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name lesbi-libre.fr;
    ssl_certificate /etc/letsencrypt/live/lesbilibre/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lesbilibre/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:lesbilibre_SSL:10m;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location ~ /\.(?!well-known(?:/|\$)) { deny all; }
    location ~* (?:^|/)(?:composer\.(?:json|lock)|package(?:-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|README\.md|manifest\.json|install\.sh)\$ { deny all; }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    location / {
        default_type text/plain;
        add_header Retry-After 60 always;
        return 503 "Projet lesbilibre provisionné. Application en attente de déploiement.\n";
    }
}
NGINX_INITIAL_TLS
        nginx_activate_vhost
    else
        nginx_prepare_https_hosts "$target"
        nginx_prepare_existing_admin "$target"
    fi
    systemctl is-enabled --quiet certbot.timer || warn 'certbot.timer non activé : activer le renouvellement via le bootstrap.'
}
nginx_prepare_existing_admin() { :; }

setup_https() {
    [[ $HTTPS == 1 ]] || return 0
    request_certificate
    managed_write "/etc/nginx/sites-available/$PROJECT.conf" <<NGINX_TLS
# Managed by VPS Project Generator : lesbilibre
log_format lesbilibre_dashboard '\$host \$remote_addr - \$remote_user [\$time_local] "\$request_method \$uri \$server_protocol" \$status \$body_bytes_sent';
server {
    listen 80;
    listen [::]:80;
    server_name lesbi-libre.fr;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location / { return 301 https://lesbi-libre.fr\$request_uri; }
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name lesbi-libre.fr;
    ssl_certificate /etc/letsencrypt/live/lesbilibre/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lesbilibre/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:lesbilibre_SSL:10m;
    access_log /var/log/nginx/lesbilibre-access.log lesbilibre_dashboard;
    error_log /var/log/nginx/lesbilibre-error.log;
    error_log /var/log/nginx/error.log warn;
    client_max_body_size 102m;
    client_body_timeout 120s;
    send_timeout 120s;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location ^~ /.well-known/acme-challenge/ { root /var/www/vps-project-acme/lesbilibre; try_files \$uri =404; }
    location ~ /\.(?!well-known(?:/|\$)) { deny all; }
    location ~* (?:^|/)(?:composer\.(?:json|lock)|package(?:-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|README\.md|manifest\.json|install\.sh)\$ { deny all; }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    root /home/lesbilibre/app/public;
    disable_symlinks if_not_owner from=\$document_root;
    index index.php index.html;
    location / { try_files \$uri \$uri/ /index.php?\$query_string; }
    location ~* \.(?:css|js|mjs|png|jpe?g|gif|svg|ico|webp|woff2?)\$ { expires 7d; add_header Cache-Control "public"; try_files \$uri =404; }
    location = /index.php {
        try_files \$uri =404;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT \$realpath_root;
        fastcgi_pass unix:/run/php/php8.4-fpm-lesbilibre.sock;
        fastcgi_read_timeout 120s;
    }
    location ~ \.php\$ { return 404; }
}
NGINX_TLS
    nginx_activate_vhost
    systemctl is-enabled --quiet certbot.timer || warn 'certbot.timer non activé : activer le renouvellement via le bootstrap.'
}


setup_ssh() {
    sshd -t || die 'Configuration SSH existante invalide ; aucune modification SSH globale.'
    systemctl is-active --quiet ssh || die 'Service SSH inactif.'
    local global_before root_before effective shadow_state authentication password_auth=no publickey_auth=no pattern
    global_before=$(sshd -T)
    root_before=$(sshd -T -C "user=root,host=$MAIN_DOMAIN,addr=127.0.0.1")
    shadow_state=$(getent shadow "$PROJECT" | awk -F: '{if($2 ~ /^!+$/) print "initial"; else if($2 ~ /^!/) print "locked"; else if($2 ~ /^\*/) print "disabled"; else if($2=="") print "empty"; else print "password"}')
    [[ -n $shadow_state ]] || die 'État du compte SSH introuvable.'
    if [[ $SSH_AUTH != password ]]; then
        printf '%s\n' "$PUBLIC_KEY" > "$TMP/project-key.pub"
        ssh-keygen -l -f "$TMP/project-key.pub" >/dev/null || die 'Clé publique SSH invalide.'
        as_project test ! -L "$PROJECT_HOME/.ssh" || die 'Dossier .ssh lié interdit.'
        as_project mkdir -p "$PROJECT_HOME/.ssh"
        as_project chmod 0700 "$PROJECT_HOME/.ssh"
        as_project test ! -L "$PROJECT_HOME/.ssh/authorized_keys" || die 'authorized_keys lié interdit.'
        printf '%s\n' "$PUBLIC_KEY" | as_project /bin/bash -c '
            set -euo pipefail; file="$1/.ssh/authorized_keys"; IFS= read -r key
            touch "$file"; chmod 600 "$file"
            if ! grep -qxF "$key" "$file"; then printf "%s\n" "$key" >> "$file"; fi
        ' -- "$PROJECT_HOME"
        publickey_auth=yes
    fi
    if [[ $SSH_AUTH == password || $SSH_AUTH == both ]]; then
        if [[ $shadow_state != password ]]; then
            command_exists passwd || die 'passwd manquant.'
            [[ -t 0 && -r /dev/tty && -w /dev/tty ]] || die "Mot de passe Linux absent ou compte verrouillé : exécuter sudo passwd $PROJECT sur la console VPS, puis relancer install.sh. Une console interactive est requise."
            log 'Définir le mot de passe Linux sur la console VPS. Jamais inclus dans le bundle ou le journal.'
            passwd "$PROJECT" </dev/tty >/dev/tty 2>&1
        fi
        touch "$STATE/password-set"
        password_auth=yes
    elif [[ $shadow_state == initial || $shadow_state == empty ]]; then
        # useradd locks new accounts with '!'; '*' permits public keys on Linux without a usable password.
        usermod --password '*' "$PROJECT"
    elif [[ $shadow_state == locked ]]; then
        die "Compte $PROJECT verrouillé manuellement : déverrouiller explicitement le compte avant de relancer."
    fi

    case $SSH_AUTH in key) authentication=publickey ;; password) authentication=password ;; both) authentication='publickey password' ;; esac
    # Match applies only to this project. The bootstrap's administrator/root policy remains unchanged.
    managed_write "/etc/ssh/sshd_config.d/10-vps-project-$PROJECT.conf" 0600 <<SSH_PROJECT
# Managed by vps-project-generator for $PROJECT.
Match User $PROJECT
    AllowUsers $PROJECT
    AllowGroups $PROJECT
    PubkeyAuthentication $publickey_auth
    PasswordAuthentication $password_auth
    KbdInteractiveAuthentication no
    PermitEmptyPasswords no
    AuthenticationMethods $authentication
    AuthorizedKeysFile .ssh/authorized_keys
    ForceCommand none
    ChrootDirectory none
SSH_PROJECT
    # Set before validation/reload so rollback restores a previously active project policy as well.
    SSH_RELOAD_REQUIRED=1
    sshd -t || die 'Configuration SSH du projet invalide ; restauration des fichiers avant rechargement.'
    [[ $(sshd -T) == "$global_before" ]] || die 'La configuration projet change la politique SSH globale ; rechargement refusé.'
    [[ $(sshd -T -C "user=root,host=$MAIN_DOMAIN,addr=127.0.0.1") == "$root_before" ]] || die 'La configuration projet change la politique SSH root ; rechargement refusé.'
    effective=$(sshd -T -C "user=$PROJECT,host=$MAIN_DOMAIN,addr=127.0.0.1")
    grep -qx "allowusers $PROJECT" <<< "$effective" || die 'Un bloc SSH existant masque AllowUsers du projet.'
    grep -qx "allowgroups $PROJECT" <<< "$effective" || die 'Un bloc SSH existant masque AllowGroups du projet.'
    grep -qx "passwordauthentication $password_auth" <<< "$effective" || die 'Authentification SSH par mot de passe du projet masquée.'
    grep -qx "pubkeyauthentication $publickey_auth" <<< "$effective" || die 'Authentification SSH par clé du projet masquée.'
    grep -qx "authenticationmethods $authentication" <<< "$effective" || die 'Méthodes d’authentification SSH du projet masquées.'
    grep -qx 'authorizedkeysfile .ssh/authorized_keys' <<< "$effective" || die 'Emplacement des clés SSH du projet masqué.'
    grep -qx 'forcecommand none' <<< "$effective" && grep -qx 'chrootdirectory none' <<< "$effective" || die 'Un bloc SSH impose un shell ou un chroot incompatible au projet.'
    while IFS= read -r pattern; do
        # Reject an explicit denial even when it is restricted to a remote host.
        pattern=${pattern%%@*}
        # OpenSSH deny patterns must be evaluated as patterns, rather than quoted literal names.
        # shellcheck disable=SC2254
        case $PROJECT in $pattern) die 'DenyUsers/DenyGroups interdit le compte projet ; réconcilier explicitement la politique SSH.' ;; esac
    done < <(awk '$1=="denyusers" || $1=="denygroups" {for(i=2;i<=NF;i++) print $i}' <<< "$effective")
    awk '$1=="subsystem" && $2=="sftp" {found=1} END{exit !found}' <<< "$effective" || die 'Subsystem sftp absent de sshd_config.'
    systemctl reload ssh
    systemctl is-active --quiet ssh || die 'Service SSH inactif après rechargement.'
    touch "$STATE/ssh-ready"
    log "SSH/SFTP activé pour $PROJECT avec $SSH_AUTH ; dossier de téléversement : $APP. Compte sans sudo."
}


record_dashboard_inventory() {
    # Root-owned metadata only. The dashboard collector reconciles it with the VPS.
    cat > "$STATE/inventory.json.new" <<'VPS_PROJECT_INVENTORY'
{"name":"lesbilibre","type":"laravel-react","user":"lesbilibre","domains":["lesbi-libre.fr"],"database":"mariadb","databaseUser":"lesbilibre","app":"/home/lesbilibre/app","services":["nginx","php8.4-fpm","lesbilibre-redis","lesbilibre-queue@1","lesbilibre-queue@2","lesbilibre-scheduler.timer"],"processes":[]}
VPS_PROJECT_INVENTORY
    chmod 0600 "$STATE/inventory.json.new"
    mv -f -- "$STATE/inventory.json.new" "$STATE/inventory.json"
}
finish_provisioning() {
    COMMITTED=1
    printf 'provisioned\n' > "$STATE/last-stage"
    printf '\nHébergement prêt : %s\nUtilisateur : %s\nApplication : %s\nBase : %s (%s)\nJournal : %s\n' "$MAIN_DOMAIN" "$PROJECT" "$APP" "$DATABASE" "$DB_NAME" "$LOG"
    log 'Compte, accès sélectionnés, vhosts et base préparés. Aucun clone, build ou démarrage applicatif effectué.'
    log "Transférer les sources dans $APP si nécessaire, puis relancer sudo bash ./install.sh sans --provision."
}

main() {
    (( $# <= 1 )) && [[ ${1:-} == '' || ${1:-} == --preflight || ${1:-} == --provision ]] || die 'Usage : sudo bash ./install.sh [--preflight|--provision]'
    preflight
    if [[ ${1:-} == --preflight ]]; then log 'Préflight terminé sans écriture persistante. Les sources seront contrôlées au déploiement.'; return 0; fi
    setup_state
    run_stage setup_user
    run_stage setup_ssh
    checkpoint_configuration
    record_dashboard_inventory

    run_stage setup_php
    run_stage reserve_application_ports
    run_stage setup_initial_nginx
    checkpoint_configuration
    run_stage setup_initial_https
    checkpoint_configuration

    run_stage setup_database
    checkpoint_configuration
    if [[ ${1:-} == --provision ]]; then finish_provisioning; return 0; fi
    if [[ $SOURCE == present && -z $(as_project find "$APP" -mindepth 1 -maxdepth 1 -print -quit) ]]; then
        log 'Sources à transférer : hébergement préparé avec succès.'
        finish_provisioning; return 0
    fi
    run_stage prepare_source
    run_stage setup_env
    run_stage check_application
    run_stage configure_database_env
    run_stage setup_redis
    run_stage configure_env
    run_stage configure_deployment_env
    run_stage validate_project_env
    run_stage setup_operations
    run_stage setup_browser_dependencies
    run_stage deploy_application
    run_stage finish_deployment
    run_stage setup_services
    run_stage setup_nginx
    run_stage setup_https
    run_stage activate_services
    run_stage activate_deployment
    COMMITTED=1
    printf 'complete\n' > "$STATE/last-stage"
    printf '\n========================================\nDéploiement terminé\n========================================\n'
    printf 'Projet : %s\nUtilisateur : %s\nDomaine : %s\nApplication : %s\nPHP : %s\nNode : %s\nBase : %s\nRedis : %s\nHTTPS : %s\nPort local : %s\nJournal : %s\nSauvegardes : %s\n' "$PROJECT" "$PROJECT" "$MAIN_DOMAIN" "$APP" "$PHP_VERSION" "$NODE_BIN" "$DATABASE" "$REDIS_ENABLED" "$HTTPS" "$PORT" "$LOG" "$BACKUP"
    printf 'Services : %s\n' "${APP_UNITS[*]:-aucun}"
}
if [[ ${BASH_SOURCE[0]} == "$0" ]]; then main "$@"; fi
