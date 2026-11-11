#!/bin/bash
# =============================================================================
# GitHub side of the cPanel auto-deploy. Run on your computer, in the project
# folder, with the exact command printed by scripts/setup/cpanel-setup.sh.
# Needs the GitHub CLI (https://cli.github.com) logged in:  gh auth login
#
# Sets: deploy key, Actions secrets/variables, workflow permissions,
# then (after the server finishes) runs the first build + deploy.
# =============================================================================
set -euo pipefail

bold() { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok() { printf '  \033[32m✔\033[0m %s\n' "$*"; }
die() { printf '\n\033[31m✖ %s\033[0m\n' "$*" >&2; exit 1; }

HOST="" USER_NAME="" TOKEN="" REPO_PATH="" URL="" NODE="20" PUBKEY=""
HEALTH_PATH="/api/health"
while [ $# -gt 0 ]; do
  case "$1" in
    --host) HOST="$2"; shift 2 ;;
    --user) USER_NAME="$2"; shift 2 ;;
    --token) TOKEN="$2"; shift 2 ;;
    --repo-path) REPO_PATH="$2"; shift 2 ;;
    --url) URL="${2%/}"; shift 2 ;;
    --node) NODE="$2"; shift 2 ;;
    --pubkey) PUBKEY="$2"; shift 2 ;;
    *) die "Unknown option: $1" ;;
  esac
done
for pair in HOST:host USER_NAME:user TOKEN:token REPO_PATH:repo-path URL:url PUBKEY:pubkey; do
  name="${pair%%:*}"
  [ -n "${!name}" ] || die "Missing --${pair#*:} — paste the full command printed on the server."
done

command -v gh >/dev/null || die "GitHub CLI not found. Install it from https://cli.github.com, then run: gh auth login"
gh auth status >/dev/null 2>&1 || die "Not logged in to GitHub CLI. Run: gh auth login (install: https://cli.github.com)"
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)" \
  || die "Run this inside the project folder (with the GitHub remote 'origin' set)."
bold "Configuring $REPO"

# 1. Deploy key (read-only) for the cPanel serve
KEY_BODY="$(printf '%s' "$PUBKEY" | awk '{print $2}')"
EXISTING_KEYS="$(gh repo deploy-key list --json key -q '.[].key' 2>/dev/null || true)"
if [[ "$EXISTING_KEYS" == *"$KEY_BODY"* ]]; then
  ok "Deploy key already present"
else
  printf '%s\n' "$PUBKEY" | gh repo deploy-key add - --title "cPanel ($USER_NAME@$HOST)" >/dev/null
  ok "Deploy key added (read-only)"
fi

# 2. Secrets
gh secret set CPANEL_HOST --body "$HOST" >/dev/null
gh secret set CPANEL_USERNAME --body "$USER_NAME" >/dev/null
gh secret set CPANEL_API_TOKEN --body "$TOKEN" >/dev/null
ok "Secrets: CPANEL_HOST, CPANEL_USERNAME, CPANEL_API_TOKEN"

# 3. Variables
gh variable set CPANEL_REPO_PATH --body "$REPO_PATH" >/dev/null
gh variable set APP_URL --body "$URL" >/dev/null
gh variable set NODE_VERSION --body "$NODE" >/dev/null
ok "Variables: CPANEL_REPO_PATH, APP_URL, NODE_VERSION=$NODE"

# 4. Let the workflow push the `deploy` branch
gh api -X PUT "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=write -F can_approve_pull_request_reviews=false >/dev/null 2>&1 \
  && ok "Actions workflow permissions: read and write" \
  || printf '  ! Could not change workflow permissions — set Settings → Actions → General → "Read and write".\n'

bold "Deploy key added ✔  Now press Enter in the cPanel terminal."
read -r -p "  When the cPanel terminal says 'Server ready', press Enter here to build + deploy… " _

# 5. First build + deploy
bold "Running the 'Deploy to cPanel' workflow"
gh workflow run deploy.yml --ref main >/dev/null
sleep 6
RUN_ID="$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')"
gh run watch "$RUN_ID" --exit-status || die "Workflow failed — open: gh run view $RUN_ID --log-failed"

bold "Checking $URL$HEALTH_PATH"
for _ in $(seq 1 12); do
  BODY="$(curl -fsS "$URL$HEALTH_PATH" 2>/dev/null || true)"
  if [[ "$BODY" == *'"status":"ok"'* ]]; then
    ok "$BODY"
    bold "Done ✔  Pushes to main now deploy automatically."
    exit 0
  fi
  sleep 10
done
die "Site did not report healthy yet. Check <app_root>/stderr.log on the server, or: gh run view $RUN_ID --log"

