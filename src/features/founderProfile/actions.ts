"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { founderProfileRepository, FOUNDER_PROFILE_ID } from "@/features/founderProfile/repository";
import { FOUNDER_GALLERY_SLOTS } from "@/features/founderProfile/constants";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/fileStorage";
import type { FounderGalleryImage } from "@/types/founderProfile";

export interface FounderProfileFormState {
  error?: string;
}

function getUploadedFile(formData: FormData, field: string): File | null {
  const file = formData.get(field);
  return file instanceof File && file.size > 0 ? file : null;
}

function linesToList(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Singleton — no create/delete, only update the one seeded row, matching `updateCompanySettings`. */
export async function updateFounderProfile(
  _prevState: FounderProfileFormState,
  formData: FormData,
): Promise<FounderProfileFormState> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "content.update")) throw new Error("Forbidden");

  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const statement = String(formData.get("statement") ?? "").trim();
  const vision = String(formData.get("vision") ?? "").trim();
  const mission = String(formData.get("mission") ?? "").trim();
  const philosophy = String(formData.get("philosophy") ?? "").trim();
  const principles = linesToList(String(formData.get("principles") ?? ""));
  const highlights = linesToList(String(formData.get("highlights") ?? ""));

  if (!name || name.length < 2) return { error: "Enter a name." };
  if (!title || title.length < 2) return { error: "Enter a title/role." };
  if (!bio || bio.length < 10) return { error: "Bio must be at least 10 characters." };

  const existing = await founderProfileRepository.findById(FOUNDER_PROFILE_ID);
  if (!existing) return { error: "Profile record is missing." };

  const newPhoto = getUploadedFile(formData, "photo");
  const removePhoto = formData.get("photo-remove") === "on";
  let photo = existing.photo;

  if (newPhoto) {
    let saved;
    try {
      saved = await saveUploadedFile(newPhoto, "founder");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Couldn't save that photo." };
    }
    if (existing.photo) await deleteUploadedFile(existing.photo);
    photo = saved.url;
  } else if (removePhoto && existing.photo) {
    await deleteUploadedFile(existing.photo);
    photo = undefined;
  }

  const existingGallery = existing.gallery ?? [];
  const gallery: FounderGalleryImage[] = [];

  for (let i = 0; i < FOUNDER_GALLERY_SLOTS; i++) {
    const existingEntry = existingGallery[i];
    const remove = formData.get(`gallery-${i}-remove`) === "on";
    const caption = String(formData.get(`gallery-${i}-caption`) ?? "").trim();

    if (remove) {
      if (existingEntry) await deleteUploadedFile(existingEntry.src);
      continue;
    }

    const newImage = getUploadedFile(formData, `gallery-${i}-image`);
    if (newImage) {
      let saved;
      try {
        saved = await saveUploadedFile(newImage, "founder");
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Couldn't save a gallery image." };
      }
      if (existingEntry) await deleteUploadedFile(existingEntry.src);
      gallery.push({ src: saved.url, caption: caption || undefined });
    } else if (existingEntry) {
      gallery.push({ src: existingEntry.src, caption: caption || existingEntry.caption });
    }
  }

  await founderProfileRepository.update(FOUNDER_PROFILE_ID, {
    name,
    title,
    intro: intro || undefined,
    bio,
    statement: statement || undefined,
    vision: vision || undefined,
    mission: mission || undefined,
    philosophy: philosophy || undefined,
    principles,
    highlights,
    photo,
    gallery,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });

  await recordAuditEvent({ actorUserId: user.id, action: "content.founder.update", entityType: "FounderProfile", entityId: FOUNDER_PROFILE_ID });

  revalidatePath("/founder");
  revalidatePath("/admin/content/founder");
  redirect("/admin/content/founder");
}
