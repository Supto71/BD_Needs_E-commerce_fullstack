#!/bin/bash
# -----------------------------------------------------------------------------
# Runs ON the cPanel server via .cpanel.yml (the cPanel clone stays on `main`).
# Fetches the prebuilt bundle from the `deploy` branch and installs it.
# -----------------------------------------------------------------------------
set -euo pipefail

HOME="${HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF="$HOME/.bdneeds-deploy.conf"

# shellcheck disable=SC1090
[ -f "$CONF" ] && . "$CONF"
: "${APP_DIR:?APP_DIR is not set. Run scripts/setup/cpanel-setup.sh first (it writes $CONF).}"

cd "$REPO_DIR"
git fetch --quiet --depth=1 origin deploy

WORK="$(mktemp -d "$HOME/.bdneeds-release.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT

git archive FETCH_HEAD | tar -x -C "$WORK"
bash "$WORK/cpanel-deploy.sh" "$APP_DIR"

git gc --auto --quiet >/dev/null 2>&1 || true
echo "Deployed $(cat "$WORK/BUILD_INFO" 2>/dev/null || echo '?') to $APP_DIR"

