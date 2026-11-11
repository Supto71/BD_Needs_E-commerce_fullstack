#!/usr/bin/env node
/**
 * Regenerate database/schema.sql from prisma/schema.prisma.
 *   npm run db:schema-sql
 *
 * Output is IDEMPOTENT (safe to run many times on cPanel):
 *  - every table uses CREATE TABLE IF NOT EXISTS
 *  - foreign keys are inlined into CREATE TABLE (FOREIGN_KEY_CHECKS=0 while creating)
 * For changes to an EXISTING database, write database/migrations/NNN_name.sql by hand.
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ddl = execSync(
  "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
  { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
).replace(/\r\n/g, "\n");

// Collect FK constraints:  ALTER TABLE `T` ADD CONSTRAINT ...;
const fks = new Map();
const withoutFks = ddl.replace(
  /-- AddForeignKey\nALTER TABLE `([^`]+)` ADD (CONSTRAINT [^;]+);\n*/g,
  (_m, table, constraint) => {
    if (!fks.has(table)) fks.set(table, []);
    fks.get(table).push(constraint);
    return "";
  },
);

const out = withoutFks.replace(
  /CREATE TABLE `([^`]+)` \(([\s\S]*?)\n\) (DEFAULT CHARACTER SET[^;]*);/g,
  (_m, table, body, tail) => {
    const extra = (fks.get(table) ?? []).map((c) => `,\n    ${c}`).join("");
    return `CREATE TABLE IF NOT EXISTS \`${table}\` (${body}${extra}\n) ${tail};`;
  },
);

if (/ALTER TABLE/.test(out)) {
  console.error("✖ Unhandled ALTER TABLE left in output — check scripts/gen-schema-sql.mjs");
  process.exit(1);
}

const header = `-- =============================================================================
-- BDNeeds MySQL schema (generated from prisma/schema.prisma by scripts/gen-schema-sql.mjs)
-- Idempotent: safe to import many times. Import with --default-character-set=utf8mb4
-- =============================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

`;
mkdirSync(join(ROOT, "database"), { recursive: true });
writeFileSync(join(ROOT, "database", "schema.sql"), `${header}${out.trim()}\n\nSET FOREIGN_KEY_CHECKS = 1;\n`);
console.log("✔ database/schema.sql written");

