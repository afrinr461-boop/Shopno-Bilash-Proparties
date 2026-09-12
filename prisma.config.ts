import process from "node:process";
import { defineConfig } from "prisma/config";

// A `prisma.config.ts` file being present turns OFF Prisma CLI's old
// implicit `.env` auto-loading entirely (confirmed: `prisma db seed`
// printed "skipping environment variable loading" the moment this file
// was added) — so `DATABASE_URL` (and, for `prisma db seed`, the bootstrap
// admin vars) must be loaded here explicitly instead of assumed.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env in this environment — nothing to load.
}
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local in this environment (e.g. CI) — nothing to load.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
