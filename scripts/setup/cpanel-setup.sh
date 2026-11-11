#!/bin/bash
# =============================================================================
# One-shot cPanel setup. Run it INSIDE cPanel (Terminal or SSH):
#   cPanel → Terminal (or SSH)  →  bash cpanel-setup.sh
#
# It creates / configures, in order:
#   1. MySQL database + user (via `uapi`)            — only if NEEDS_MYSQL=yes
#   2. Node.js app (CloudLinux "Setup Node.js App", via `cloudlinux-selector`)
#   3. Server secrets in <app>/.env
#   4. An SSH deploy key so cPanel can read the private GitHub repo
#   5. A cPanel API token for GitHub Actions
#   6. → prints ONE command to run on your computer (sets up GitHub), waits
#   7. Clones the repo with Git™ Version Control (+ imports database/schema.sql)
#
# Safe to re-run: existing database, .env, key and clone are reused.
# Optional overrides via env: DOMAIN, APP_DIR, REPO_SLUG, NODE_MAJOR
# =============================================================================
set -euo pipefail

REPO_SLUG="${REPO_SLUG:-Supto71/BD_Needs_E-commerce_fullstack}"          # GitHub owner/repo
APP_SLUG="bdneeds"                         # short lowercase name, e.g. "shop"
APP_DIR="${APP_DIR:-${APP_SLUG}_app}"
REPO_NAME="$APP_SLUG"
NEEDS_MYSQL="${NEEDS_MYSQL:-yes}"     # yes | no
HEALTH_PATH="/api/health"
CPUSER="$(id -un)"
REPO_ROOT="$HOME/repositories/$REPO_NAME"
APP_ROOT="$HOME/$APP_DIR"
KEY="$HOME/.ssh/${APP_SLUG}_deploy"
GITHUB_ED25519_FP="SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU"

bold() { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok() { printf '  \033[32m✔\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
die() { printf '\n\033[31m✖ %s\033[0m\n' "$*" >&2; exit 1; }

command -v uapi >/dev/null || die "uapi not found — run this inside cPanel → Terminal."
command -v perl >/dev/null || die "perl not found."

# --- JSON helper (perl is always present on cPanel servers) -------------------
json() { perl -MJSON::PP -e '
  my $j = eval { decode_json(join("", <STDIN>)) } or exit 0;
  my $v = $j;
  for my $k (split /\./, $ARGV[0]) { $v = ref($v) eq "ARRAY" ? $v->[$k] : $v->{$k}; }
  print ref($v) ? JSON::PP->new->canonical->encode($v) : (defined $v ? $v : "");' "$1"; }

# uapi <Module> <func> [k=v ...]  → prints result JSON; fails with errors on status 0
uapi_ok() {
  local out
  out="$(uapi --output=json "$@" 2>/dev/null || true)"
  if [ "$(printf '%s' "$out" | json result.status)" != "1" ]; then
    printf '%s' "$out" | json result.errors >&2
    return 1
  fi
  printf '%s' "$out"
}

rand() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c "${1:-32}"; }

# --- Inputs ---------------------------------------------------------------------
bold "cPanel setup for $APP_SLUG (account: $CPUSER)"
if [ -z "${DOMAIN:-}" ]; then
  DEFAULT_DOMAIN="$(uapi --output=json DomainInfo list_domains 2>/dev/null | json result.data.main_domain || true)"
  read -r -p "  Domain for the site [${DEFAULT_DOMAIN}]: " DOMAIN
  DOMAIN="${DOMAIN:-$DEFAULT_DOMAIN}"
fi
[ -n "$DOMAIN" ] || die "A domain is required."
SERVER_HOST="$(hostname -f 2>/dev/null || hostname)"
ok "Domain $DOMAIN · app root ~/$APP_DIR · repo $REPO_SLUG"

# --- 1. Database ----------------------------------------------------------------
bold "1/7 Database"
DB_FRESH=0
if [ "$NEEDS_MYSQL" != "yes" ]; then
  ok "Skipped (NEEDS_MYSQL=no)"
elif [ -f "$APP_ROOT/.env" ] && grep -qE '^(DB_NAME|DATABASE_URL)=' "$APP_ROOT/.env"; then
  # shellcheck disable=SC1091
  set -a; . "$APP_ROOT/.env"; set +a
  if [ -z "${DB_NAME:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
    # Parse mysql://user:pass@host:port/dbname from an existing DATABASE_URL (core perl only)
    eval "$(perl -e '
      sub u { my $s = shift; $s =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/eg; $s =~ s/\x27/\x27\\\x27\x27/g; return $s; }
      if ($ENV{DATABASE_URL} =~ m{^mysql://([^:@]+):([^@]*)@([^:/]+)(?::(\d+))?/([^?]+)}) {
        printf "DB_USER=\x27%s\x27\nDB_PASSWORD=\x27%s\x27\nDB_HOST=\x27%s\x27\nDB_PORT=\x27%s\x27\nDB_NAME=\x27%s\x27\n",
          u($1), u($2), u($3), ($4 || 3306), u($5);
      }' 2>/dev/null || true)"
  fi
  ok "Reusing database from existing .env (${DB_NAME:-from DATABASE_URL})"
else
  DB_NAME="${CPUSER}_${APP_SLUG}"
  DB_USER="${CPUSER}_${APP_SLUG:0:6}"
  DB_PASSWORD="$(rand 28)"
  DBS_JSON="$(uapi --output=json Mysql list_databases 2>/dev/null || true)"
  if [[ "$DBS_JSON" == *"\"database\":\"$DB_NAME\""* ]]; then
    ok "Database $DB_NAME already exists"
  else
    uapi_ok Mysql create_database name="$DB_NAME" >/dev/null || die "Could not create database $DB_NAME"
    ok "Created database $DB_NAME"
  fi
  USERS_JSON="$(uapi --output=json Mysql list_users 2>/dev/null || true)"
  if [[ "$USERS_JSON" == *"\"user\":\"$DB_USER\""* ]]; then
    uapi_ok Mysql set_password user="$DB_USER" password="$DB_PASSWORD" >/dev/null || die "Could not reset password for $DB_USER"
    ok "DB user $DB_USER exists — password rotated"
  else
    uapi_ok Mysql create_user name="$DB_USER" password="$DB_PASSWORD" >/dev/null || die "Could not create DB user $DB_USER"
    ok "Created DB user $DB_USER"
  fi
  uapi_ok Mysql set_privileges_on_database user="$DB_USER" database="$DB_NAME" privileges="ALL PRIVILEGES" >/dev/null \
    || die "Could not grant privileges"
  ok "Granted ALL PRIVILEGES"
  DB_FRESH=1
fi
APP_SECRET="${APP_SECRET:-$(rand 48)}"

# --- 2. Node.js app -------------------------------------------------------------
bold "2/7 Node.js app"
NODE_VERSION_USED=""
if command -v cloudlinux-selector >/dev/null; then
  VERSIONS_JSON="$(cloudlinux-selector get --json --interpreter=nodejs 2>/dev/null || echo '{}')"
  # Pick a major version: NODE_MAJOR (default 20) if enabled, else 22, then 18.
  NODE_VERSION_USED="$(printf '%s' "$VERSIONS_JSON" | perl -MJSON::PP -e '
    my $j = eval { decode_json(join("", <STDIN>)) } || {};
    my %v = %{ $j->{available_versions} || {} };
    my %majors;
    for my $ver (keys %v) {
      my $st = ref $v{$ver} eq "HASH" ? ($v{$ver}{status} // "enabled") : "enabled";
      next unless $st eq "enabled";
      my ($m) = split /\./, $ver; $majors{$m} = 1;
    }
    for my $m ($ARGV[0], 20, 22, 18) { if ($majors{$m}) { print $m; last } }' "${NODE_MAJOR:-20}")"
  [ -n "$NODE_VERSION_USED" ] || die "No Node.js 18/20/22 available in Setup Node.js App. Ask your host to enable one."

  if [[ "$VERSIONS_JSON" == *"\"$APP_DIR\""* ]]; then
    ok "Node.js app ~/$APP_DIR already exists (ensure Startup file is 'app.js' in Setup Node.js App)"
  else
    cloudlinux-selector create --json --interpreter=nodejs --version="$NODE_VERSION_USED" \
      --app-root="$APP_DIR" --domain="$DOMAIN" --app-uri="/" --app-mode=production \
      --startup-file=app.js \
      --env-vars='{"NODE_OPTIONS":"--max-old-space-size=256 --max-semi-space-size=4","UV_THREADPOOL_SIZE":"2"}' \
      >/dev/null 2>&1 && ok "Created Node.js $NODE_VERSION_USED app at ~/$APP_DIR → https://$DOMAIN" || {
      [ -d "$APP_ROOT" ] || die "cloudlinux-selector could not create the app. Create it in Setup Node.js App (startup file app.js) and re-run."
      warn "Node.js app not created (it probably exists already) — keeping ~/$APP_DIR"
    }
  fi
else
  warn "Setup Node.js App (CloudLinux) not found on this server."
  warn "Create the app manually: root ~/$APP_DIR, startup file app.js, Node 20,"
  warn "env NODE_OPTIONS=--max-old-space-size=256 --max-semi-space-size=4, UV_THREADPOOL_SIZE=2"
  NODE_VERSION_USED="20"
fi
mkdir -p "$APP_ROOT/tmp" "$APP_ROOT/uploads"

# --- 3. .env --------------------------------------------------------------------
bold "3/7 Server secrets (~/$APP_DIR/.env)"
umask 077
if [ -f "$APP_ROOT/.env" ] && [ "${REWRITE_ENV:-no}" != "yes" ] && [ "$DB_FRESH" != "1" ]; then
  ok "Keeping existing .env (set REWRITE_ENV=yes to regenerate)"
else
  {
    echo "NODE_ENV=production"
    echo "APP_URL=https://$DOMAIN"
    echo "APP_SECRET=$APP_SECRET"
    if [ "$NEEDS_MYSQL" = "yes" ]; then
      echo "DB_HOST=localhost"
      echo "DB_PORT=3306"
      echo "DB_USER=$DB_USER"
      echo "DB_PASSWORD=$DB_PASSWORD"
      echo "DB_NAME=$DB_NAME"
      echo "DB_CONNECTION_LIMIT=3"
      # Prisma reads DATABASE_URL (small pool is mandatory on shared hosting).
      echo "DATABASE_URL=mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME?connection_limit=3"
    fi
    # --- BDNeeds server-only variables ---
    echo "NEXTAUTH_URL=https://$DOMAIN"
    echo "NEXTAUTH_SECRET=$(rand 48)"
    echo "NEXT_PUBLIC_SITE_URL=https://$DOMAIN"
    echo "# UddoktaPay (online payment)"
    echo "UDDOKTAPAY_API_KEY=CHANGE_ME"
    echo "UDDOKTAPAY_BASE_URL=CHANGE_ME"
    echo "# Email: Resend (recommended) and/or SMTP fallback"
    echo "RESEND_API_KEY=CHANGE_ME"
    echo "EMAIL_FROM=BDNeeds <support@$DOMAIN>"
    echo "SMTP_HOST=CHANGE_ME"
    echo "SMTP_PORT=587"
    echo "SMTP_USER=CHANGE_ME"
    echo "SMTP_PASS=CHANGE_ME"
    echo "SMTP_SECURE=false"
    echo "# Cloudinary (product / banner image uploads)"
    echo "CLOUDINARY_CLOUD_NAME=CHANGE_ME"
    echo "CLOUDINARY_API_KEY=CHANGE_ME"
    echo "CLOUDINARY_API_SECRET=CHANGE_ME"
    echo "# Social login (optional)"
    echo "GOOGLE_CLIENT_ID="
    echo "GOOGLE_CLIENT_SECRET="
    echo "FACEBOOK_CLIENT_ID="
    echo "FACEBOOK_CLIENT_SECRET="
    echo "# Rate limiting (optional, Upstash Redis)"
    echo "UPSTASH_REDIS_REST_URL="
    echo "UPSTASH_REDIS_REST_TOKEN="
  } > "$APP_ROOT/.env"
  warn "Edit ~/$APP_DIR/.env and replace every CHANGE_ME (UddoktaPay, email, Cloudinary)."
fi
chmod 600 "$APP_ROOT/.env"
printf 'APP_DIR=%s\n' "$APP_ROOT" > "$HOME/.${APP_SLUG}-deploy.conf"
ok "Wrote .env (chmod 600) and ~/.${APP_SLUG}-deploy.conf"

# --- 4. SSH deploy key ----------------------------------------------------------
bold "4/7 GitHub deploy key"
mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"
if [ ! -f "$KEY" ]; then
  ssh-keygen -q -t ed25519 -N "" -C "cpanel-$CPUSER-$APP_SLUG" -f "$KEY"
  ok "Generated $KEY"
else
  ok "Reusing $KEY"
fi
SSH_ALIAS="github-$APP_SLUG"
if ! grep -q "^Host $SSH_ALIAS\$" "$HOME/.ssh/config" 2>/dev/null; then
  cat >> "$HOME/.ssh/config" <<CFG

Host $SSH_ALIAS
  HostName ssh.github.com
  Port 443
  User git
  IdentityFile $KEY
  IdentitiesOnly yes
CFG
  chmod 600 "$HOME/.ssh/config"
fi
# Pin GitHub's host key (port 443 endpoint) after checking its published fingerprint.
if ! ssh-keygen -F "[ssh.github.com]:443" -f "$HOME/.ssh/known_hosts" >/dev/null 2>&1; then
  SCAN="$(ssh-keyscan -t ed25519 -p 443 ssh.github.com 2>/dev/null)"
  FP="$(printf '%s\n' "$SCAN" | ssh-keygen -lf - 2>/dev/null | awk '{print $2}')"
  [ "$FP" = "$GITHUB_ED25519_FP" ] || die "GitHub host key fingerprint mismatch ($FP). Aborting."
  printf '%s\n' "$SCAN" >> "$HOME/.ssh/known_hosts"
fi
ok "SSH configured (GitHub over port 443, host key verified)"
PUBKEY="$(cat "$KEY.pub")"

# --- 5. API token ---------------------------------------------------------------
bold "5/7 cPanel API token"
TOKEN_NAME="github-deploy-$(date +%Y%m%d%H%M%S)"
API_TOKEN="$(uapi_ok Tokens create_full_access name="$TOKEN_NAME" | json result.data.token)" \
  || die "Could not create an API token (Security → Manage API Tokens may be disabled by your host)."
[ -n "$API_TOKEN" ] || die "Token creation returned no token."
ok "Created token $TOKEN_NAME"

# --- 6. Hand-off to the local computer ----------------------------------------------------
bold "6/7 Run this on your computer (inside the project folder):"
printf "\n  bash scripts/setup/github-setup.sh \\\\\n"
printf "    --host '%s' --user '%s' --token '%s' \\\\\n" "$SERVER_HOST" "$CPUSER" "$API_TOKEN"
printf "    --repo-path '%s' --url 'https://%s' --node '%s' \\\\\n" "$REPO_ROOT" "$DOMAIN" "$NODE_VERSION_USED"
printf "    --pubkey '%s'\n\n" "$PUBKEY"
printf "  (It contains your API token — don't share it.)\n"
read -r -p "  Press Enter here once the local script says the deploy key was added… " _

# --- 7. Clone + database import ------------------------------------------------
bold "7/7 Clone repository + import database"
# Fall back to classic port 22 when the host firewall blocks ssh.github.com:443.
use_port_22() {
  if ! ssh-keygen -F github.com -f "$HOME/.ssh/known_hosts" >/dev/null 2>&1; then
    local scan fp
    scan="$(ssh-keyscan -t ed25519 github.com 2>/dev/null)"
    fp="$(printf '%s\n' "$scan" | ssh-keygen -lf - 2>/dev/null | awk '{print $2}')"
    [ "$fp" = "$GITHUB_ED25519_FP" ] || return 1
    printf '%s\n' "$scan" >> "$HOME/.ssh/known_hosts"
  fi
  perl -0pi -e 's/(Host \Q'"$SSH_ALIAS"'\E\n\s+HostName )ssh\.github\.com(\n\s+Port )443/${1}github.com${2}22/' "$HOME/.ssh/config"
}

for attempt in 1 2 3 4; do
  SSH_OUT="$(ssh -o BatchMode=yes -o ConnectTimeout=15 -T "git@$SSH_ALIAS" 2>&1 || true)"
  if [[ "$SSH_OUT" == *"successfully authenticated"* ]]; then
    ok "GitHub accepts the deploy key"
    break
  fi
  if [[ "$SSH_OUT" =~ (timed\ out|refused|unreachable|resolve) ]] && grep -q "Port 443" "$HOME/.ssh/config"; then
    warn "Port 443 to GitHub is blocked here — switching to port 22"
    use_port_22 || die "Could not verify github.com host key on port 22."
    continue
  fi
  printf '  GitHub said: %s\n' "$(printf '%s' "$SSH_OUT" | tail -n 2 | tr '\n' ' ')"
  [ "$attempt" = 4 ] && die "GitHub did not accept the key. Check repo → Settings → Deploy keys, then re-run this script."
  read -r -p "  Not yet accepted. Add the key (local script), then press Enter to retry… " _
done

if [ -d "$REPO_ROOT/.git" ]; then
  ok "Repository already cloned at $REPO_ROOT"
else
  mkdir -p "$HOME/repositories"
  uapi_ok VersionControl create type=git name="$REPO_NAME" repository_root="$REPO_ROOT" \
    source_repository="{\"remote_name\":\"origin\",\"url\":\"git@$SSH_ALIAS:$REPO_SLUG.git\"}" >/dev/null \
    || die "Git™ Version Control could not clone the repository."
  printf '  Cloning'
  for _ in $(seq 1 90); do
    [ -f "$REPO_ROOT/.cpanel.yml" ] && break
    printf '.'; sleep 2
  done
  echo
  [ -f "$REPO_ROOT/.cpanel.yml" ] || die "Clone did not finish (no .cpanel.yml). Check Git™ Version Control in cPanel."
  ok "Cloned into $REPO_ROOT (branch main)"
fi

if [ "$NEEDS_MYSQL" = "yes" ] && [ -n "${DB_NAME:-}" ] && [ -f "$REPO_ROOT/database/schema.sql" ]; then
  MYCNF="$(mktemp)"; trap 'rm -f "$MYCNF"' EXIT
  printf '[client]\nuser=%s\npassword=%s\nhost=%s\nport=%s\ndefault-character-set=utf8mb4\n' \
    "$DB_USER" "$DB_PASSWORD" "${DB_HOST:-localhost}" "${DB_PORT:-3306}" > "$MYCNF"
  TABLES="$(mysql --defaults-extra-file="$MYCNF" -N -e "SHOW TABLES" "$DB_NAME" 2>/dev/null | wc -l)"
  mysql --defaults-extra-file="$MYCNF" "$DB_NAME" < "$REPO_ROOT/database/schema.sql"
  ok "Schema applied (database/schema.sql must be idempotent: CREATE TABLE IF NOT EXISTS)"
  if [ -f "$REPO_ROOT/database/seed.sql" ] && { [ "$TABLES" = "0" ] || [ "$DB_FRESH" = "1" ]; }; then
    mysql --defaults-extra-file="$MYCNF" "$DB_NAME" < "$REPO_ROOT/database/seed.sql"
    ok "Seed data imported"
  fi
fi

touch "$APP_ROOT/tmp/restart.txt"

bold "Server ready ✔"
cat <<DONE
  Now press Enter in the local terminal — it starts the first GitHub build + deploy.
  Health check after it finishes:  https://$DOMAIN$HEALTH_PATH
  Don't forget: replace CHANGE_ME values in ~/$APP_DIR/.env, then: touch ~/$APP_DIR/tmp/restart.txt
DONE

