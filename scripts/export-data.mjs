#!/usr/bin/env node
// One-time export of every table's data (the current SQLite dev.db) to a
// single JSON file, so it can be re-imported into the new Postgres database
// after the SQLite -> Postgres provider switch. Every model here is the
// generic `{id, data: Json}` shape (see ARCHITECTURE.md), so this walks
// the Prisma Client's own model list rather than hardcoding all 58 names.
//
// Usage: node scripts/export-data.mjs [output-file]

import { PrismaClient } from "@prisma/client";
import { writeFile } from "node:fs/promises";

const prisma = new PrismaClient();
const outputFile = process.argv[2] ?? "data-export.json";

const modelNames = Object.keys(prisma).filter(
  (key) => !key.startsWith("_") && !key.startsWith("$") && typeof prisma[key]?.findMany === "function",
);

const dump = {};
for (const name of modelNames) {
  const rows = await prisma[name].findMany();
  dump[name] = rows;
  console.log(`${name}: ${rows.length} rows`);
}

await writeFile(outputFile, JSON.stringify(dump, null, 2));
console.log(`\nExported ${modelNames.length} tables to ${outputFile}`);
await prisma.$disconnect();
