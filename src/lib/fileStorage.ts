import "server-only";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getUploadStore, isUsingBlobStore } from "@/lib/uploadStore";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB — comfortably above a scanned deed/agreement, well under the 20MB Server Action body limit set in next.config.ts.
const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx"]);

export interface SavedFile {
  url: string;
  size: number;
  extension: string;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(-100);
}

function getExtension(fileName: string): string {
  const ext = path.extname(fileName).slice(1).toLowerCase();
  return ext;
}

/**
 * Writes an uploaded `File` (from a Server Action's `FormData`) via
 * `getUploadStore()` — local disk in dev, Netlify Blobs once deployed (see
 * `uploadStore.ts`'s own comment) — named `<uuid>-<sanitized original
 * name>` so two uploads never collide. Returns the public URL path (usable
 * directly as `fileUrl`/`<img src>`) and the file's size/extension for
 * display: a local-disk file keeps the old `/uploads/...` path (served by
 * Next's static `public/` folder), a Blob-stored one is served through
 * `/api/uploads/...` (`src/app/api/uploads/[...path]/route.ts`) instead,
 * since a Blob has no filesystem path of its own to serve statically.
 */
export async function saveUploadedFile(file: File, subdir: string): Promise<SavedFile> {
  if (file.size === 0) throw new Error("The selected file is empty.");
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("File is too large — the limit is 15MB.");

  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error("Unsupported file type — allowed: PDF, JPG, PNG, WEBP, DOC, DOCX.");
  }

  const fileName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const relativePath = `${subdir}/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await getUploadStore().write(relativePath, buffer);

  const urlPrefix = isUsingBlobStore() ? "/api/uploads" : "/uploads";
  return { url: `${urlPrefix}/${relativePath}`, size: file.size, extension };
}

/** Best-effort cleanup — a missing file (already deleted, or a path from before this store existed) is not an error. */
export async function deleteUploadedFile(url: string): Promise<void> {
  const relativePath = url.startsWith("/api/uploads/")
    ? url.slice("/api/uploads/".length)
    : url.startsWith("/uploads/")
      ? url.slice("/uploads/".length)
      : null;
  if (!relativePath) return;

  await getUploadStore().remove(relativePath);
}
