#!/usr/bin/env node
// Loads a JSON file produced by `scripts/export-data.mjs` into whichever
// database `DATABASE_URL` currently points at (run this against the fresh
// Postgres database, after `prisma db push`, once — the target tables must
// already be empty, since this always inserts rather than upserts).
//
// Usage: node scripts/import-data.mjs [input-file]

import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";

const prisma = new PrismaClient();
const inputFile = process.argv[2] ?? "data-export.json";

const dump = JSON.parse(await readFile(inputFile, "utf-8"));

for (const [name, rows] of Object.entries(dump)) {
  if (!rows.length) continue;
  if (typeof prisma[name]?.createMany !== "function") {
    console.warn(`Skipping unknown model: ${name}`);
    continue;
  }
  await prisma[name].createMany({ data: rows });
  console.log(`${name}: imported ${rows.length} rows`);
}

console.log("\nImport complete.");
await prisma.$disconnect();
