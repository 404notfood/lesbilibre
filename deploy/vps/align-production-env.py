"""Align deployment settings while retaining credentials and all other values."""
from datetime import datetime, timezone
import os
from pathlib import Path
import re
import sys
import tempfile

EXPECTED = dict(line.split("=", 1) for line in """APP_NAME=LesbiLibre
APP_ENV=production
APP_DEBUG=false
APP_URL=https://lesbi-libre.fr
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr
SUPPORT_EMAIL=contact@lesbi-libre.fr
SEO_INDEXING_ENABLED=false
INERTIA_SSR_ENABLED=true
SESSION_SECURE_COOKIE=true
SESSION_DRIVER=redis
CACHE_STORE=redis
CACHE_DRIVER=redis
REDIS_CLIENT=phpredis
QUEUE_CONNECTION=redis
BROADCAST_CONNECTION=reverb
DB_QUEUE_RETRY_AFTER=660
REDIS_QUEUE_RETRY_AFTER=660
MAIL_MAILER=log
MAIL_FROM_ADDRESS=contact@lesbi-libre.fr
REVERB_APP_ID=lesbilibre
REVERB_HOST=127.0.0.1
REVERB_PORT=18080
REVERB_SCHEME=http
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=18080
VITE_REVERB_HOST=lesbi-libre.fr
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
VITE_APP_NAME=LesbiLibre
MODERATION_SERVICE_URL=http://127.0.0.1:18000
HUSKY=0
NODE_ENV=production""".splitlines())


def align(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError("Le .env doit être un fichier régulier, sans lien symbolique.")
    original = path.read_bytes()
    lines = original.decode("utf-8").splitlines(keepends=True)
    updates = dict(EXPECTED)
    for line in lines:
        if line.startswith("REVERB_APP_KEY="):
            public_key = line.partition("=")[2].strip().strip("\"'")
            if public_key:
                updates["VITE_REVERB_APP_KEY"] = public_key
            break
    if "VITE_REVERB_APP_KEY" not in updates:
        raise ValueError("REVERB_APP_KEY absente ou vide : aucune modification effectuée.")

    pattern = re.compile(r"^([A-Z][A-Z0-9_]*)=")
    retained = []
    for line in lines:
        match = pattern.match(line)
        if not match or match.group(1) not in updates:
            retained.append(line)
    content = "".join(retained)
    if content and not content.endswith("\n"):
        content += "\n"
    content += "".join(f"{key}={value}\n" for key, value in updates.items())
    replacement = content.encode("utf-8")
    if replacement == original:
        return None

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    backup = path.with_name(f".env.before-production-{stamp}-{os.getpid()}")
    descriptor = os.open(backup, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "wb") as stream:
        stream.write(original)
    descriptor, temporary = tempfile.mkstemp(prefix=".env.production-", dir=path.parent)
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(replacement)
        os.chmod(temporary, 0o600)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    return backup


if __name__ == "__main__":
    try:
        target = Path(sys.argv[1] if len(sys.argv) > 1 else "/home/lesbilibre/app/.env")
        saved = align(target)
        print(f"Paramètres alignés. Sauvegarde privée : {saved}" if saved else "Paramètres déjà alignés.")
        print("APP_KEY, secrets DB/Redis/Stripe/SMTP/VAPID et jeton de modération conservés.")
    except (ValueError, OSError, UnicodeError) as error:
        raise SystemExit(f"Correction interrompue : {error}")
