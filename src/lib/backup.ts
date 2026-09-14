import "server-only";
import AdmZip from "adm-zip";
import { prisma } from "@/lib/db";
import { listAllStoredFiles, readFromStore, writeToStore } from "@/lib/uploadStore";

// Ephemeral security bookkeeping, not real business data — restoring old
// rate-limit rows on top of a live system could reintroduce a stale
// lockout for someone who's long since been let back in, so this is
// deliberately left out of every backup.
const EXCLUDED_MODELS = new Set(["rateLimitAttempt"]);

/** Every generic `{id, data}` (or otherwise `findMany`-capable) Prisma model on the client, same technique `scripts/export-data.mjs` already uses — walking the client's own model list instead of hand-maintaining a name array that can drift out of sync with `schema.prisma`. */
function listBackupModelNames(): string[] {
  return Object.keys(prisma).filter((key) => {
    if (key.startsWith("_") || key.startsWith("$") || EXCLUDED_MODELS.has(key)) return false;
    const delegate = (prisma as unknown as Record<string, unknown>)[key];
    return typeof (delegate as { findMany?: unknown })?.findMany === "function";
  });
}

export interface BackupManifest {
  createdAt: string;
  mode: "full" | "data";
  tableCount: number;
  rowCount: number;
  fileCount: number;
}

/**
 * Builds the whole backup as an in-memory zip: `manifest.json` (metadata),
 * `data.json` (every table dumped whole — the same shape
 * `scripts/export-data.mjs` produces, so either can read the other's
 * output), and, in `"full"` mode, every file currently under
 * the active upload store (`lib/uploadStore.ts` — local disk or Netlify
 * Blobs) at its same relative path — gallery photos, project/unit/building
 * images, founder photo, uploaded documents, everything an admin has ever
 * uploaded through this app.
 */
export async function buildBackupZip(mode: "full" | "data"): Promise<Buffer> {
  const modelNames = listBackupModelNames();
  const dump: Record<string, unknown[]> = {};
  let rowCount = 0;

  for (const name of modelNames) {
    const rows = await (prisma as unknown as Record<string, { findMany: () => Promise<unknown[]> }>)[name].findMany();
    dump[name] = rows;
    rowCount += rows.length;
  }

  const zip = new AdmZip();
  let fileCount = 0;

  if (mode === "full") {
    const files = await listAllStoredFiles();
    for (const { relativePath, kind } of files) {
      const content = await readFromStore(relativePath, kind);
      if (!content) continue; // Listed but unreadable between the list() and read() calls — skip rather than fail the whole backup.
      zip.addFile(`uploads/${relativePath}`, content);
      fileCount += 1;
    }
  }

  const manifest: BackupManifest = {
    createdAt: new Date().toISOString(),
    mode,
    tableCount: modelNames.length,
    rowCount,
    fileCount,
  };

  zip.addFile("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2)));
  zip.addFile("data.json", Buffer.from(JSON.stringify(dump, null, 2)));

  return zip.toBuffer();
}

export interface RestoreSummary {
  tables: number;
  rows: number;
  files: number;
  skippedTables: string[];
}

interface TransactionDelegate {
  deleteMany(): unknown;
  createMany(args: { data: unknown[] }): unknown;
}

/**
 * The disaster-recovery button: replaces every table's contents with
 * whatever `data.json` inside the zip says (delete-then-recreate per
 * table, all inside one `$transaction` so a failure partway through
 * leaves the database exactly as it was, not half-restored), then writes
 * back any `uploads/**` files the zip carries. A table name in the backup
 * that isn't a real model on this build (an old field renamed since, for
 * example) is skipped rather than failing the whole restore — reported
 * back in `skippedTables` so it's visible, not silent.
 */
export async function restoreFromZip(buffer: Buffer): Promise<RestoreSummary> {
  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    throw new Error("That file isn't a valid .zip archive.");
  }

  const dataEntry = zip.getEntry("data.json");
  if (!dataEntry) throw new Error("This doesn't look like a Shopno Bilash backup — data.json is missing.");

  let dump: Record<string, unknown[]>;
  try {
    dump = JSON.parse(dataEntry.getData().toString("utf-8"));
  } catch {
    throw new Error("data.json inside the backup is corrupted and can't be read.");
  }
  if (typeof dump !== "object" || dump === null || Array.isArray(dump)) {
    throw new Error("data.json inside the backup isn't in the expected format.");
  }

  const knownModels = new Set(listBackupModelNames());
  const skippedTables: string[] = [];
  const operations: unknown[] = [];
  let rowCount = 0;
  let tableCount = 0;

  for (const [name, rows] of Object.entries(dump)) {
    if (!Array.isArray(rows)) continue;
    if (!knownModels.has(name)) {
      skippedTables.push(name);
      continue;
    }
    const delegate = (prisma as unknown as Record<string, TransactionDelegate>)[name];
    operations.push(delegate.deleteMany());
    if (rows.length > 0) operations.push(delegate.createMany({ data: rows }));
    rowCount += rows.length;
    tableCount += 1;
  }

  await prisma.$transaction(operations as never[]);

  let fileCount = 0;
  const uploadEntries = zip.getEntries().filter((e) => !e.isDirectory && e.entryName.startsWith("uploads/"));
  for (const entry of uploadEntries) {
    const relative = entry.entryName.slice("uploads/".length);
    if (!relative || relative.includes("..")) continue; // Defensive — a crafted entry name shouldn't be able to write outside the uploads store.
    await writeToStore(relative, entry.getData());
    fileCount += 1;
  }

  return { tables: tableCount, rows: rowCount, files: fileCount, skippedTables };
}
