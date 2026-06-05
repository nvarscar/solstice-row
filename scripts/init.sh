#!/bin/sh
# Solstice Row — First-run admin credential initialization
# Runs before `next dev`. Generates a random password on first start,
# stores a hashed copy in the persistent data volume, and prints it to logs.

DATA_DIR="${DATA_DIR:-/data}"
CREDS_FILE="$DATA_DIR/auth/credentials.json"

if [ ! -f "$CREDS_FILE" ]; then
    mkdir -p "$DATA_DIR/auth"

    PASSWORD=$(cat /dev/urandom | tr -dc 'A-Za-z0-9!@#%^' | head -c 16)
    SECRET=$(cat /dev/urandom | tr -dc 'A-Za-z0-9' | head -c 32)

    HASH=$(node -e "
const c = require('crypto');
process.stdout.write(c.createHmac('sha256','$SECRET').update('$PASSWORD').digest('hex'));
")

    printf '{"username":"admin","passwordHash":"%s","secret":"%s"}\n' "$HASH" "$SECRET" > "$CREDS_FILE"

    echo ""
    echo "╔══════════════════════════════════════════════╗"
    echo "║      SOLSTICE ROW — ADMIN CREDENTIALS        ║"
    echo "╠══════════════════════════════════════════════╣"
    echo "║  Username : admin                            ║"
    printf "║  Password : %-32s║\n" "$PASSWORD"
    echo "╠══════════════════════════════════════════════╣"
    echo "║  Visit /admin to log in.                     ║"
    echo "║  Change your password in Admin → Settings.   ║"
    echo "╚══════════════════════════════════════════════╝"
    echo ""
else
    echo "[solstice-row] Admin credentials loaded from persistent storage."
fi

if [ "$NODE_ENV" = "production" ]; then
    exec npm start
else
    exec npm run dev
fi
