import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { restoreFromZip } from "@/lib/backup";

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500MB — comfortably above a full-image backup of a real-estate site's gallery/documents.

/**
 * The other half of the disaster-recovery pair: replaces the live database
 * (and any uploaded files the zip carries) with a backup produced by
 * `GET /api/admin/backup`. Same permission gate as that route — this is
 * strictly more dangerous, since it overwrites current data rather than
 * only reading it, so the confirmation step lives in the admin UI
 * (`BackupPanel`), not here; this route trusts that a request reaching it
 * has already been through that.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!hasPermission(user.role, "settings.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("backup");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No backup file was uploaded." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "The selected file is empty." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "That backup file is too large (over 500MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const summary = await restoreFromZip(buffer);
    await recordAuditEvent({
      actorUserId: user.id,
      action: "system.backup.restore",
      entityType: "Backup",
      entityId: "restore",
      newValue: summary,
    });
    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Restore failed for an unknown reason.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
