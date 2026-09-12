import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
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
 * Writes an uploaded `File` (from a Server Action's `FormData`) to
 * `public/<subdir>/`, named `<uuid>-<sanitized original name>` so two
 * uploads never collide. Returns the public URL path (usable directly as
 * `fileUrl`/`<img src>`) and the file's size/extension for display.
 * Local-disk storage, not a cloud bucket — this project has no cloud
 * storage precedent anywhere and runs SQLite locally; moving to a real
 * object store later is a service-layer swap behind this same function,
 * not a rewrite of every caller.
 */
export async function saveUploadedFile(file: File, subdir: string): Promise<SavedFile> {
  if (file.size === 0) throw new Error("The selected file is empty.");
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("File is too large — the limit is 15MB.");

  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error("Unsupported file type — allowed: PDF, JPG, PNG, WEBP, DOC, DOCX.");
  }

  const dir = path.join(UPLOADS_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const fileName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, fileName), buffer);

  return { url: `/uploads/${subdir}/${fileName}`, size: file.size, extension };
}

/** Best-effort cleanup — a missing file (already deleted, or never a local path) is not an error. */
export async function deleteUploadedFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", url));
  } catch {
    // Already gone, or the path predates local storage — nothing to do.
  }
}
