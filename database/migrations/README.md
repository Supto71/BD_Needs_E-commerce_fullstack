# Database migrations

Schema changes for an **existing** live database go here as `NNN_name.sql`
(e.g. `001_add_order_notes.sql`). Rules:

- Each file must be **safe to run twice** (`CREATE TABLE IF NOT EXISTS`,
  `ADD COLUMN IF NOT EXISTS` on MariaDB, guarded `UPDATE ... WHERE` the old value still matches).
- Also update `prisma/schema.prisma`, then run `npm run db:schema-sql` so
  `database/schema.sql` stays in sync for fresh installs.
- Run them by hand in the cPanel Terminal after the deploy (see `docs/DEPLOYMENT_CPANEL.md` §9.3),
  always with `--default-character-set=utf8mb4`.

