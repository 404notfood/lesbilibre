#!/usr/bin/env bash
# Application-specific additions to the unmodified VPS Project Generator bundle.
set -Eeuo pipefail
BUNDLE_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$BUNDLE_DIR/install.sh"

for original in preflight setup_state reserve_application_ports configure_deployment_env deploy_application node_build setup_services managed_write activate_deployment; do
    definition=$(declare -f "$original")
    eval "${definition/#$original /vps_base_$original }"
done
unset original definition
DECLARED_PORTS+=(13714 18000 18080)

preflight() {
    vps_base_preflight
    local executable extension
    for executable in ffmpeg ffprobe python3 curl; do
        command_exists "$executable" || die "Prérequis applicatif manquant : $executable ; voir INSTALLATION.md."
    done
    python3 -c 'import venv' || die 'python3-venv manquant.'
    for extension in gd exif bcmath intl zip pcntl redis; do
        "/usr/bin/php$PHP_VERSION" -r "exit(extension_loaded('$extension') ? 0 : 1);" || die "Extension PHP requise : $extension"
    done
    log 'Compléments LesbiLibre vérifiés ; ports réservés : 13714, 18000, 18080.'
}

setup_state() {
    vps_base_setup_state
    managed_write "/etc/vps-projects/$PROJECT/application.nginx" < "$BUNDLE_DIR/application.nginx"
}

reserve_application_ports() {
    vps_base_reserve_application_ports
    select_port "$STATE/ssr-port" 13714 13714 13714 manual "$PROJECT-ssr"
    select_port "$STATE/moderation-port" 18000 18000 18000 manual "$PROJECT-moderation"
    select_port "$STATE/reverb-port" 18080 18080 18080 manual "$PROJECT-reverb"
}

configure_deployment_env() {
    vps_base_configure_deployment_env
    env_require VITE_REVERB_APP_KEY "$(env_value REVERB_APP_KEY)"
    env_set VITE_REVERB_APP_KEY "$(env_value REVERB_APP_KEY)"
    # Never retain test Stripe credentials copied from .env.example on a new VPS.
    if [[ $ENV_NEW == 1 ]]; then
        local key
        for key in STRIPE_KEY STRIPE_SECRET STRIPE_WEBHOOK_SECRET STRIPE_PRICE_1_MONTH STRIPE_PRICE_3_MONTHS STRIPE_PRICE_6_MONTHS; do
            env_set "$key" ''
        done
    fi
}

deploy_application() {
    # These writable directories are excluded from Git and the source archive.
    as_project mkdir -p "$APP/bootstrap/cache" "$APP/storage/logs" \
        "$APP/storage/framework/cache/data" "$APP/storage/framework/sessions" "$APP/storage/framework/views"
    vps_base_deploy_application
}

node_build() {
    # Keep the generator's dependency and native-module checks, then build SSR.
    vps_base_node_build
    node_command "$NODE_BIN/npm" run build:ssr
    as_project test -f "$APP/bootstrap/ssr/ssr.js" || die 'Bundle Inertia SSR absent après le build.'
    as_project /usr/bin/python3 -m venv "$SHARED/moderation-venv"
    # CPU wheels avoid downloading CUDA runtimes on an ordinary VPS.
    as_project "$SHARED/moderation-venv/bin/pip" install 'torch==2.7.1' --index-url https://download.pytorch.org/whl/cpu
    as_project "$SHARED/moderation-venv/bin/pip" install -r "$APP/moderation/requirements.txt"
    as_project mkdir -p "$SHARED/moderation-models"
    preload_moderation_model
}

preload_moderation_model() {
    local load_model='from transformers import pipeline; pipeline("image-classification", model="Falconsai/nsfw_image_detection", device=-1)'
    # A transferred or previously downloaded model must not require Hub access.
    if as_project env "HF_HOME=$SHARED/moderation-models" HF_HUB_OFFLINE=1 \
        "$SHARED/moderation-venv/bin/python" -c "$load_model" > "$TMP/moderation-model.log" 2>&1; then
        log 'Modèle de modération chargé depuis le cache local, sans accès réseau.'
        return 0
    fi
    log 'Modèle absent ou inutilisable en cache ; tentative de téléchargement public.'
    if ! as_project env "HF_HOME=$SHARED/moderation-models" \
        "$SHARED/moderation-venv/bin/python" -c "$load_model"; then
        die 'Modèle non chargé. En cas de HTTP 429, transférer lesbilibre-moderation-model.tar.gz selon RECUPERATION_MODELE.md, puis relancer deploy.sh. Aucun compte Hugging Face obligatoire.'
    fi
}

managed_write() {
    if [[ $1 == "/etc/nginx/sites-available/$PROJECT.conf" ]]; then
        local candidate
        candidate=$(mktemp "$TMP/lesbilibre-nginx.XXXXXX")
        # Exact application roots exclude HTTP redirects and pending vhosts.
        awk -v root="    root $APP/public;" -v snippet="/etc/vps-projects/$PROJECT/application.nginx" \
            '$0 == root { print "    include " snippet ";" } { print }' > "$candidate"
        vps_base_managed_write "$@" < "$candidate"
        rm -f -- "$candidate"
    else
        vps_base_managed_write "$@"
    fi
}

application_unit() {
    local name=$1 directory=$2 executable=$3 extra=${4:-}
    managed_write "/etc/systemd/system/$PROJECT-$name.service" <<UNIT
# Managed by VPS Project Generator : $PROJECT
# LesbiLibre application extension
[Unit]
Description=$PROJECT $name
After=network.target
[Service]
Type=simple
User=$PROJECT
Group=$PROJECT
WorkingDirectory=$directory
Environment="HOME=$PROJECT_HOME"
Environment="PATH=$PROJECT_HOME/.local/bin:$NODE_BIN:/usr/local/bin:/usr/bin:/bin"
Environment=NODE_ENV=production
ExecStart=$executable
Restart=always
RestartSec=5
TimeoutStopSec=630
UMask=0027
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=$PROJECT_HOME
RestrictSUIDSGID=true
LimitNOFILE=65536
StandardOutput=journal
StandardError=journal
$extra
[Install]
WantedBy=multi-user.target
UNIT
    systemd-analyze verify "/etc/systemd/system/$PROJECT-$name.service"
    APP_UNITS+=("$PROJECT-$name.service")
}

setup_services() {
    vps_base_setup_services
    # Inertia's bundled server listens on all interfaces. Restrict its traffic
    # to localhost with systemd's IP filter, in addition to the VPS firewall.
    application_unit ssr "$APP" "$NODE_BIN/node $APP/bootstrap/ssr/ssr.js" \
        $'IPAddressDeny=any\nIPAddressAllow=localhost'
    application_unit reverb "$APP" "/usr/bin/php$PHP_VERSION $APP/artisan reverb:start --host=127.0.0.1 --port=18080"
    managed_write "/etc/vps-projects/$PROJECT/moderation.env" 0600 root <<ENV
MODERATION_API_TOKEN=$(env_value MODERATION_API_TOKEN)
IMAGES_ROOT=$APP/storage/app/public
HF_HOME=$SHARED/moderation-models
HF_HUB_OFFLINE=1
NSFW_MODEL_ID=Falconsai/nsfw_image_detection
PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
ENV
    application_unit moderation "$APP/moderation" \
        "$SHARED/moderation-venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 18000" \
        "EnvironmentFile=/etc/vps-projects/$PROJECT/moderation.env"
}

activate_deployment() {
    vps_base_activate_deployment
    local attempt
    for attempt in {1..30}; do
        if curl --fail --silent --max-time 5 http://127.0.0.1:18000/health >/dev/null; then break; fi
        [[ $attempt != 30 ]] || die 'La modération ne répond pas ; consulter journalctl.'
        sleep 2
    done
    app_command "/usr/bin/php$PHP_VERSION" artisan inertia:check-ssr
    log 'SSR et modération disponibles. Configurer SMTP, Stripe et VAPID avant ouverture publique.'
}

if [[ ${BASH_SOURCE[0]} == "$0" ]]; then main "$@"; fi
