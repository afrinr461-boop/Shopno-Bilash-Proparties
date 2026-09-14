import "server-only";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
const BLOB_STORE_NAME = "uploads";

/**
 * Netlify's serverless functions have no persistent disk — the same reason
 * this app's database moved from a local SQLite file to Neon Postgres.
 * `saveUploadedFile`/`deleteUploadedFile` used to write straight to
 * `public/uploads/` on local disk, which works in local dev (a long-running
 * process, real disk) but silently loses every uploaded file on Netlify (a
 * fresh, isolated container per invocation, no shared writable disk).
 *
 * `process.env.NETLIFY` is set to `"true"` by Netlify's build and runtime
 * environment (and never set locally), so this picks Blob storage there and
 * plain disk storage everywhere else — zero behavior change for local dev,
 * real persistence once deployed. Both implementations share this one
 * interface so `fileStorage.ts`/`backup.ts` never need to know which one is
 * active.
 */
export interface UploadStore {
  /** Relative path within the store, e.g. `"settings/abc-logo.png"`. */
  write(relativePath: string, data: Buffer): Promise<void>;
  read(relativePath: string): Promise<Buffer | null>;
  remove(relativePath: string): Promise<void>;
  /** Every currently-stored relative path — for the full-backup zip. */
  list(): Promise<string[]>;
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

class LocalDiskStore implements UploadStore {
  async write(relativePath: string, data: Buffer): Promise<void> {
    const destination = path.join(UPLOADS_ROOT, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, data);
  }

  async read(relativePath: string): Promise<Buffer | null> {
    try {
      return await readFile(path.join(UPLOADS_ROOT, relativePath));
    } catch {
      return null;
    }
  }

  async remove(relativePath: string): Promise<void> {
    try {
      await unlink(path.join(UPLOADS_ROOT, relativePath));
    } catch {
      // Already gone — nothing to do.
    }
  }

  async list(): Promise<string[]> {
    try {
      const entries = await readdir(UPLOADS_ROOT, { recursive: true });
      const files: string[] = [];
      for (const entry of entries) {
        const full = path.join(UPLOADS_ROOT, entry);
        if ((await stat(full)).isFile()) files.push(entry.split(path.sep).join("/"));
      }
      return files;
    } catch {
      return []; // No uploads directory yet (a fresh install) — not an error.
    }
  }
}

class NetlifyBlobStoreAdapter implements UploadStore {
  private store() {
    return getStore(BLOB_STORE_NAME);
  }

  async write(relativePath: string, data: Buffer): Promise<void> {
    await this.store().set(relativePath, toArrayBuffer(data));
  }

  async read(relativePath: string): Promise<Buffer | null> {
    const result = await this.store().get(relativePath, { type: "arrayBuffer" });
    return result ? Buffer.from(result) : null;
  }

  async remove(relativePath: string): Promise<void> {
    await this.store().delete(relativePath);
  }

  async list(): Promise<string[]> {
    const result = await this.store().list();
    return result.blobs.map((blob) => blob.key);
  }
}

const localDiskStore = new LocalDiskStore();
const netlifyBlobStore = new NetlifyBlobStoreAdapter();

/** The single decision point — everything else just calls the returned store. */
export function getUploadStore(): UploadStore {
  return process.env.NETLIFY === "true" ? netlifyBlobStore : localDiskStore;
}

/** Whether the active store is Blob-backed — `saveUploadedFile` uses this to pick the right public URL prefix. */
export function isUsingBlobStore(): boolean {
  return process.env.NETLIFY === "true";
}
