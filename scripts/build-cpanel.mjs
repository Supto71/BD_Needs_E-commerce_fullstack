#!/usr/bin/env node
/**
 * Assemble the cPanel bundle →  .cpanel-build/   (pushed to the `deploy` branch by CI)
 *   npm run build:cpanel            (CI and local)
 *   npm run build:cpanel -- --zip   (also writes bdneeds-cpanel-ready.zip for manual upload)
 * MODE "next":  Next.js with output: "standalone"  (server.js + traced node_modules)
 * MODE "node":  any other Node server (compiled output + production node_modules)
 *
 * BDNeeds additions: Prisma engines (all binaryTargets for CloudLinux/RHEL) are copied
 * into the bundle, prisma/seed.ts is bundled to prisma/seed.js, and database/*.sql is shipped.
 */
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const MODE = "next"; // "next" | "node"
const ROOT = process.cwd();
const OUT = join(ROOT, ".cpanel-build");
const WANT_ZIP = process.argv.includes("--zip");
const run = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: "inherit" });

rmSync(OUT, { recursive: true, force: true });

if (MODE === "next") {
  // `build` = "prisma generate && next build"; webpack is used for reliable Prisma tracing.
  run("npm run build -- --webpack"); // must run `next build` with output: "standalone"
  const standalone = join(ROOT, ".next", "standalone");
  if (!existsSync(join(standalone, "server.js"))) {
    console.error('✖ .next/standalone/server.js missing. Set output: "standalone" in next.config.');
    process.exit(1);
  }
  cpSync(standalone, OUT, { recursive: true });
  cpSync(join(ROOT, ".next", "static"), join(OUT, ".next", "static"), { recursive: true });
  if (existsSync(join(ROOT, "public"))) {
    cpSync(join(ROOT, "public"), join(OUT, "public"), { recursive: true });
  }
  rmSync(join(OUT, ".next", "cache"), { recursive: true, force: true });

  // --- Prisma: ship the generated client with every Linux engine (server is CloudLinux/RHEL).
  const nm = join(OUT, "node_modules");
  for (const p of [join(".prisma", "client"), join("@prisma", "client"), "bcryptjs"]) {
    const src = join(ROOT, "node_modules", p);
    if (existsSync(src)) cpSync(src, join(nm, p), { recursive: true });
  }
  // Drop Windows/macOS engines (only useful when building on a dev machine).
  const engineDir = join(nm, ".prisma", "client");
  if (existsSync(engineDir)) {
    for (const f of readdirSync(engineDir)) {
      if (/windows|darwin/i.test(f) || f.endsWith(".tmp") || /\.tmp\d+$/.test(f)) {
        rmSync(join(engineDir, f), { force: true });
      }
    }
  }

  // --- Prisma schema + seed script (plain JS; the server has no tsx and no src/).
  mkdirSync(join(OUT, "prisma"), { recursive: true });
  cpSync(join(ROOT, "prisma", "schema.prisma"), join(OUT, "prisma", "schema.prisma"));
  try {
    const esbuild = require("esbuild");
    esbuild.buildSync({
      entryPoints: [join(ROOT, "prisma", "seed.ts")],
      bundle: true,
      platform: "node",
      format: "cjs",
      target: "node18",
      external: ["@prisma/client", ".prisma/client"],
      tsconfig: join(ROOT, "tsconfig.json"),
      outfile: join(OUT, "prisma", "seed.js"),
      logLevel: "warning",
    });
  } catch (err) {
    console.warn("! Could not bundle prisma/seed.ts (optional):", err?.message ?? err);
  }

  // --- SQL files (schema is idempotent; used by the setup script / manual import).
  if (existsSync(join(ROOT, "database"))) {
    cpSync(join(ROOT, "database"), join(OUT, "database"), { recursive: true });
  }
} else {
  run("npm run build");
  for (const p of ["dist", "public"]) {
    if (existsSync(join(ROOT, p))) cpSync(join(ROOT, p), join(OUT, p), { recursive: true });
  }
  cpSync(join(ROOT, "package.json"), join(OUT, "package.json"));
  cpSync(join(ROOT, "package-lock.json"), join(OUT, "package-lock.json"));
  // Production dependencies are installed HERE (in CI), never on cPanel.
  run("npm ci --omit=dev --ignore-scripts --no-audit --no-fund", OUT);
}

// Never ship env files — server secrets live in <app_root>/.env on cPanel.
for (const file of readdirSync(OUT)) {
  if (file.startsWith(".env")) rmSync(join(OUT, file), { force: true });
}

// Shell scripts must have LF line endings even when built on Windows.
const copyLf = (src, dest) => writeFileSync(dest, readFileSync(src, "utf8").replace(/\r\n/g, "\n"));
cpSync(join(ROOT, "cpanel", "app.js"), join(OUT, "app.js"));
copyLf(join(ROOT, "cpanel", "deploy.sh"), join(OUT, "cpanel-deploy.sh"));

let sha = process.env.GITHUB_SHA ?? "";
try {
  sha ||= execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
} catch {
  sha ||= "local";
}
writeFileSync(join(OUT, "BUILD_INFO"), `${sha} ${new Date().toISOString()}\n`);
console.log(`✔ cPanel bundle ready at ${OUT}`);

// Optional: a zip for manual upload through cPanel File Manager.
if (WANT_ZIP) {
  const AdmZip = require("adm-zip");
  const zipPath = join(ROOT, "bdneeds-cpanel-ready.zip");
  rmSync(zipPath, { force: true });
  const zip = new AdmZip();
  zip.addLocalFolder(OUT);
  if (existsSync(join(ROOT, ".env.example"))) {
    // Template only (no secrets). Rename to .env on the server and fill in.
    zip.addLocalFile(join(ROOT, ".env.example"), "", "env.example.txt");
  }
  zip.writeZip(zipPath);
  console.log(`✔ Zip ready: ${zipPath}`);
}

