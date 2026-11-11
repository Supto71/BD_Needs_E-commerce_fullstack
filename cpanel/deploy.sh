#!/bin/bash
# -----------------------------------------------------------------------------
# Runs ON the cPanel server (called by cpanel/remote-deploy.sh). Copies the
# prebuilt bundle into the Node.js app root, then triggers the restart.
# No npm install, no build on the server.        Usage: bash cpanel-deploy.sh <app_dir>
# -----------------------------------------------------------------------------
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${1:?Usage: cpanel-deploy.sh <app_dir>}"
LOG="$APP_DIR/deploy.log"

mkdir -p "$APP_DIR/tmp"
echo "[$(date -u +%FT%TZ)] deploy $(cat "$SRC/BUILD_INFO" 2>/dev/null || echo '?')" >> "$LOG"

# Anchored ("/x") so a nested folder with the same name (e.g. .next/server/app/uploads)
# is NEVER skipped. Everything listed here belongs to the server, not the bundle.
# NOTE (BDNeeds): public/uploads is NOT excluded — in this project it holds images
# committed to the repo; runtime uploads go to Cloudinary, never to disk.
EXCLUDES=(
  --exclude=/.git --exclude=/.cpanel.yml --exclude=/cpanel-deploy.sh
  --exclude=/.env --exclude=/.htaccess --exclude=/tmp/ --exclude=/.next/cache/
  --exclude=/deploy.log --exclude=/stderr.log --exclude=/nodevenv/
  --exclude=/uploads/
)

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "${EXCLUDES[@]}" "$SRC/" "$APP_DIR/"
else
  # No rsync (common under CageFS): unpack into a staging folder, then swap each
  # build folder with a rename so the live app is never half-copied.
  STAGE="$APP_DIR/.deploy-new"
  rm -rf "$STAGE" && mkdir -p "$STAGE"
  (cd "$SRC" && tar --anchored --exclude=./.git --exclude=./.cpanel.yml --exclude=./cpanel-deploy.sh -cf - .) \
    | (cd "$STAGE" && tar -xf -)
  # The bundle's build folders (each one is swapped atomically).
  for d in .next/server .next/static node_modules public prisma database; do
    if [ -e "$STAGE/$d" ]; then
      mkdir -p "$(dirname "$APP_DIR/$d")"
      rm -rf "$APP_DIR/$d.old"
      if [ -e "$APP_DIR/$d" ]; then mv "$APP_DIR/$d" "$APP_DIR/$d.old"; fi
      mv "$STAGE/$d" "$APP_DIR/$d"
      rm -rf "$APP_DIR/$d.old"
    fi
  done
  # Remaining top-level files (app.js, server entry, package.json, manifests…)
  (cd "$STAGE" && tar -cf - .) | (cd "$APP_DIR" && tar -xf -)
  rm -rf "$STAGE"
fi

# Restart: app.js watches this file and exits; the host starts the new build.
touch "$APP_DIR/tmp/restart.txt"
if command -v cloudlinux-selector >/dev/null 2>&1; then
  REL="${APP_DIR#"$HOME"/}"
  cloudlinux-selector restart --json --interpreter nodejs --app-root "$REL" >> "$LOG" 2>&1 || true
fi
echo "[$(date -u +%FT%TZ)] done" >> "$LOG"

