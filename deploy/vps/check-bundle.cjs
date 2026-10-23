const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const bash = process.env.BASH_EXE || (process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : '/bin/bash');
function run(args, options = {}) {
    const result = spawnSync(bash, args, { encoding: 'utf8', ...options });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    return result.stdout;
}

for (const name of ['install.sh', 'deploy.sh']) run(['-n', path.join(__dirname, name)]);
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'lesbilibre-config.json'))).configuration;
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json')));
assert.equal(config.domains[0].name, 'lesbi-libre.fr');
assert.equal(config.email, 'contact@lesbi-libre.fr');
assert.equal(config.queueTimeout, 600);
assert.equal(config.envDefaults.REDIS_QUEUE_RETRY_AFTER, '660');
assert.equal(manifest.project.name, config.name);
assert.equal(config.envDefaults.MAIL_MAILER, 'log');
assert(config.hexSecretKeys.includes('REVERB_APP_SECRET'));
assert(!('REVERB_APP_SECRET' in config.envDefaults));

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lesbilibre-bundle-check-'));
try {
    run(['-c', `
set -Eeuo pipefail
source "$TEST_BUNDLE/deploy.sh"
trap - EXIT ERR
TMP="$TEST_TEMP"
vps_base_managed_write() { cat > "$TEST_TEMP/rendered.conf"; CHANGED+=("$1"); }
printf 'server {\n    root /home/lesbilibre/app/public;\n}\n' > "$TMP/input"
managed_write /etc/nginx/sites-available/lesbilibre.conf < "$TMP/input"
[[ \${#CHANGED[@]} == 1 ]]
grep -q 'include /etc/vps-projects/lesbilibre/application.nginx;' "$TMP/rendered.conf"
printf 'server {\n    location / { return 503; }\n}\n' > "$TMP/input"
managed_write /etc/nginx/sites-available/lesbilibre.conf < "$TMP/input"
! grep -q 'include ' "$TMP/rendered.conf"

original_configure=$(declare -f vps_base_configure_deployment_env)
vps_base_configure_deployment_env() { :; }
ENV_NEW=1
env_value() { printf 'server-generated-test-value'; }
env_require() { :; }
env_set() { printf '%s=%s\n' "$1" "$2" >> "$TEST_TEMP/env-changes"; }
configure_deployment_env
grep -qx 'VITE_REVERB_APP_KEY=server-generated-test-value' "$TEST_TEMP/env-changes"
grep -qx 'STRIPE_SECRET=' "$TEST_TEMP/env-changes"

# The base installer accepts a published site's indexing choice on redeploy.
eval "$original_configure"
env_require() { [[ $1 != SEO_INDEXING_ENABLED ]]; }
ENV_NEW=0
vps_base_configure_deployment_env
grep -qx 'SEO_INDEXING_ENABLED=false' "$TEST_TEMP/env-changes"

vps_base_reserve_application_ports() { :; }
select_port() { printf '%s\n' "$2" >> "$TEST_TEMP/ports"; }
reserve_application_ports
[[ $(wc -l < "$TEST_TEMP/ports") == 3 ]]

vps_base_setup_services() { APP_UNITS=('lesbilibre-queue@1.service' 'lesbilibre-queue@2.service' 'lesbilibre-scheduler.timer'); }
managed_write() { cat > "$TEST_TEMP/$(basename "$1")"; }
systemd-analyze() { :; }
NODE_BIN=/opt/nvm/versions/node/v24.0.0/bin
setup_services
[[ \${#APP_UNITS[@]} == 6 ]]
grep -qx 'IPAddressDeny=any' "$TEST_TEMP/lesbilibre-ssr.service"
grep -qx 'IPAddressAllow=localhost' "$TEST_TEMP/lesbilibre-ssr.service"
grep -q 'reverb:start --host=127.0.0.1 --port=18080' "$TEST_TEMP/lesbilibre-reverb.service"
grep -q -- '--host 127.0.0.1 --port 18000' "$TEST_TEMP/lesbilibre-moderation.service"
grep -qx 'MODERATION_API_TOKEN=server-generated-test-value' "$TEST_TEMP/moderation.env"
grep -qx 'HF_HUB_OFFLINE=1' "$TEST_TEMP/moderation.env"

# A valid local model never triggers a second, network-enabled loading attempt.
as_project() { printf '%s\\n' "$*" >> "$TEST_TEMP/model-attempts"; }
preload_moderation_model
[[ $(wc -l < "$TEST_TEMP/model-attempts") == 1 ]]
grep -q 'HF_HUB_OFFLINE=1' "$TEST_TEMP/model-attempts"

# If the offline attempt fails, retain the public download path.
attempts=0
as_project() { attempts=$((attempts + 1)); [[ $attempts == 2 ]]; }
preload_moderation_model
[[ $attempts == 2 ]]

# If both attempts fail, stop rather than enabling an unusable service.
as_project() { return 1; }
die() { return 1; }
if preload_moderation_model; then
    printf 'Missing model unexpectedly accepted.\\n' >&2
    exit 1
fi
printf 'Bundle checks passed: syntax, nginx, rollback tracking, environment, ports, services.\n'
`], { env: { ...process.env, TEST_BUNDLE: __dirname.replaceAll('\\', '/'), TEST_TEMP: temporary.replaceAll('\\', '/') } });
    const snippet = fs.readFileSync(path.join(__dirname, 'application.nginx'), 'utf8');
    assert(snippet.includes('location = /manifest.json'));
    assert(snippet.includes('location = /sw.js'));
    assert(snippet.includes('proxy_set_header Upgrade $http_upgrade;'));
    assert(snippet.includes('fastcgi_buffer_size 16k;'));
    assert(snippet.includes('fastcgi_buffers 8 16k;'));
    console.log('All deployment bundle checks passed. No server commands executed.');
} finally {
    fs.rmSync(temporary, { recursive: true, force: true });
}
