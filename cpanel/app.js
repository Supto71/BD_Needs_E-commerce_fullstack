/**
 * cPanel "Setup Node.js App" startup file  (Application startup file: app.js)
 * Wraps the real server with low-resource defaults for a 1 core / 1 GB /
 * 100-process shared plan. Plain CommonJS, zero dependencies.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const v8 = require("node:v8");

const ROOT = __dirname;

/** Minimal .env loader (KEY=VALUE, # comments, optional quotes). Never overrides real env. */
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, "");
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT, ".env"));

process.env.NODE_ENV = "production";
process.env.NEXT_TELEMETRY_DISABLED = "1";
// libuv thread pool: 2 keeps us far below the 100-process/thread limit.
if (!process.env.UV_THREADPOOL_SIZE) process.env.UV_THREADPOOL_SIZE = "2";

// The heap limit only works from NODE_OPTIONS (set in Setup Node.js App env):
//   NODE_OPTIONS=--max-old-space-size=256 --max-semi-space-size=4
const heapLimitMb = Math.round(v8.getHeapStatistics().heap_size_limit / 1048576);
if (heapLimitMb > 768) {
  console.warn(
    `[app] V8 heap limit is ${heapLimitMb} MB. Set NODE_OPTIONS=--max-old-space-size=256 in Setup Node.js App.`,
  );
}

// Passenger / LiteSpeed (lsnode) intercept listen(); PORT is only for manual runs.
if (!process.env.PORT) process.env.PORT = "3000";
if (!process.env.HOSTNAME) process.env.HOSTNAME = "127.0.0.1";
if (!process.env.KEEP_ALIVE_TIMEOUT) process.env.KEEP_ALIVE_TIMEOUT = "5000";

process.on("unhandledRejection", (reason) => {
  console.error("[app] Unhandled rejection:", reason);
});

// SELF-RESTART AFTER DEPLOY (do not remove).
// Under LiteSpeed + CageFS neither tmp/restart.txt nor `cloudlinux-selector
// restart` reliably replaces the running process, and the cPanel account
// cannot see or kill it. So the app watches tmp/restart.txt itself and exits
// when the deploy script touches it; LiteSpeed/Passenger start the new build
// on the next request.
const RESTART_FILE = path.join(ROOT, "tmp", "restart.txt");
function restartStamp() {
  try {
    return fs.statSync(RESTART_FILE).mtimeMs;
  } catch {
    return 0;
  }
}
const bootStamp = restartStamp();
const restartWatcher = setInterval(() => {
  if (restartStamp() > bootStamp) {
    clearInterval(restartWatcher);
    console.log("[app] New deploy detected (tmp/restart.txt) — restarting to load it.");
    setTimeout(() => process.exit(0), 2000).unref(); // grace for in-flight requests
  }
}, Number(process.env.RESTART_POLL_MS) || 15000);
restartWatcher.unref();

// server.js: Next.js standalone server entry.
require(path.join(ROOT, "server.js"));

