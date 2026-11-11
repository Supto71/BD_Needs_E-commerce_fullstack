# cPanel Auto-Deployment Guide (`bdneeds`)

## Architecture Overview

1. You push code to the `main` branch on GitHub (`Supto71/BD_Needs_E-commerce_fullstack`).
2. **GitHub Actions builds** the standalone Next.js + Prisma bundle in CI (`.github/workflows/deploy.yml`). The cPanel server **never** runs `npm install`, `npm ci`, or `next build`.
3. GitHub Actions commits and pushes the prebuilt `.cpanel-build/` bundle to a dedicated **`deploy`** branch (fast-forward only).
4. GitHub Actions calls the **cPanel UAPI** using an API token. cPanel pulls `main` and triggers `.cpanel.yml`, which runs `cpanel/remote-deploy.sh` to fetch the `deploy` branch and copy the bundle into `~/bdneeds_app`.
5. `cpanel/app.js` detects the updated `tmp/restart.txt` file and exits cleanly so LiteSpeed / Passenger spawns a fresh Node.js process serving the new build.

---

## Manual First-Time Upload (cPanel Ready ZIP)

If you want to upload the prebuilt bundle manually via cPanel File Manager right now:

1. Upload **`bdneeds-cpanel-ready.zip`** (in the project root; regenerate anytime with `npm run build:cpanel:zip`) to your cPanel application directory (e.g. `~/bdneeds_app`) and **Extract** it.
2. Copy `env.example.txt` (or create `.env`) inside `~/bdneeds_app/.env` and fill in your production credentials (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UDDOKTAPAY_*`, `RESEND_API_KEY`, `CLOUDINARY_*`).
3. Import `database/schema.sql` (and optionally `database/seed.sql`) into your MySQL database via phpMyAdmin or Terminal.
4. In cPanel **Setup Node.js App**:
   - **Application root:** `bdneeds_app`
   - **Application startup file:** `app.js`
   - **Environment variables:** `NODE_OPTIONS=--max-old-space-size=256 --max-semi-space-size=4`, `UV_THREADPOOL_SIZE=2`
5. Start/Restart the app or run `touch ~/bdneeds_app/tmp/restart.txt`.

---

## Automated GitHub → cPanel Setup & Runbook

### 9.1 One-time setup (≈5 minutes)
1. Push the repo (with all files above) to GitHub `main`.
2. Install the GitHub CLI on the computer and log in: `gh auth login`.
3. cPanel → **Terminal**:
   ```bash
   curl -fsSL -o cpanel-setup.sh https://raw.githubusercontent.com/Supto71/BD_Needs_E-commerce_fullstack/main/scripts/setup/cpanel-setup.sh && bash cpanel-setup.sh
   ```
   (Private repo: copy the file into the cPanel File Manager instead, then `bash cpanel-setup.sh`.)
4. The script prints **one command**. Run it on the computer **inside the project folder**. It adds the deploy key and GitHub secrets.
5. Press Enter in the cPanel Terminal. It clones the repo (and imports the database).
6. Press Enter on the computer. It runs the first build + deploy and checks `/api/health`.

### 9.2 Every day
`git push origin main` → about 3–5 minutes later the site runs the new version. Manual run: `gh workflow run deploy.yml --ref main`.
Check: open `https://<domain>/api/health` — a small `uptimeSeconds` means the new build is live.

### 9.3 Database migrations (run in cPanel Terminal after the deploy)
```bash
cd ~/bdneeds_app && set -a && . ./.env && set +a && \
mysql --default-character-set=utf8mb4 -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < ~/repositories/bdneeds/database/migrations/NNN_name.sql && echo done
```

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Redirect goes to `localhost:3000` | URL built from `request.url` behind the proxy | Use `getPublicOrigin(request)` from `src/lib/request-origin.ts` |
| CSS/JS files return 400/404, "Something went wrong" after a deploy | Old process still running with the old build's file list | Wait 15 s (watcher). If the app was started from an old `app.js` without the watcher: WHM → Process Manager → kill `lsnode:/home/<user>/<app>` once, or ask the host |
| `Cannot find module …/route.js` | Unanchored exclude skipped a nested folder | Keep all excludes in `cpanel/deploy.sh` anchored with leading `/` |
| `uptimeSeconds` keeps growing after deploys | Restart not happening | Check `app.js` has the watcher and `deploy.sh` touches `tmp/restart.txt` |
| Deploy job: `status 0` from VersionControl | Wrong `CPANEL_REPO_PATH` or the clone has local changes | Path must be `/home/<user>/repositories/bdneeds`; never edit files inside the clone |
| Uploaded images disappear after deploy | Uploads saved inside a build folder | Store user uploads in Cloudinary or `<app_root>/uploads/` |
| "Queue limit reached" / DB timeouts | Pool too large or too many parallel queries | `connectionLimit` 3 (`?connection_limit=3` in `DATABASE_URL`), cache read queries |
| Many `Failed to find Server Action` lines in `stderr.log` | Bots probing the site | Harmless if the framework is up to date |
| Garbled `—` / Bangla text after a migration | MySQL client charset | Always pass `--default-character-set=utf8mb4` |
| GitHub SSH from cPanel times out | Port 443 to GitHub blocked | The setup script falls back to port 22 automatically |

Logs on the server: `<app_root>/stderr.log` (app errors) and `<app_root>/deploy.log` (each deploy).

