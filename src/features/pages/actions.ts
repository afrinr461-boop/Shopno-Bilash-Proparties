"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { pageContentRepository } from "@/features/pages/repository";
import type { LegalSection, PageContentId } from "@/content/legal";

export interface PageContentFormState {
  error?: string;
}

const PUBLIC_PATH: Record<PageContentId, string> = {
  privacy: "/privacy",
  terms: "/terms",
  disclaimer: "/disclaimer",
  cookies: "/cookies",
};

async function requireContentPermission(permission: "content.update") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

function parsePageFields(formData: FormData) {
  const eyebrow = String(formData.get("eyebrow") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const lastUpdated = String(formData.get("lastUpdated") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  const sectionCount = Number(formData.get("sectionCount") ?? "0");

  if (!title || title.length < 3) return { error: "Title must be at least 3 characters." } as const;
  if (!lastUpdated) return { error: "Enter a \"last updated\" date." } as const;
  if (!intro || intro.length < 10) return { error: "Intro must be at least 10 characters." } as const;

  const sections: LegalSection[] = [];
  for (let i = 0; i < sectionCount; i++) {
    const heading = String(formData.get(`section-${i}-heading`) ?? "").trim();
    const bodyRaw = String(formData.get(`section-${i}-body`) ?? "");
    const listRaw = String(formData.get(`section-${i}-list`) ?? "");

    if (!heading) return { error: `Section ${i + 1} needs a heading.` } as const;

    const body = bodyRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (body.length === 0) return { error: `Section "${heading}" needs at least one paragraph.` } as const;

    const list = listRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    sections.push({ heading, body, list: list.length > 0 ? list : undefined });
  }

  return { fields: { eyebrow: eyebrow || "Legal", title, lastUpdated, intro, sections } } as const;
}

export async function updatePageContent(
  id: PageContentId,
  _prevState: PageContentFormState,
  formData: FormData,
): Promise<PageContentFormState> {
  const user = await requireContentPermission("content.update");

  const parsed = parsePageFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await pageContentRepository.findById(id);
  if (!existing) return { error: "This page no longer exists." };

  const updated = await pageContentRepository.update(id, {
    eyebrow: fields.eyebrow,
    title: fields.title,
    lastUpdated: fields.lastUpdated,
    intro: fields.intro,
    sections: fields.sections,
  });
  if (!updated) return { error: "This page no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "content.page.update", entityType: "PageContent", entityId: id });

  const path = PUBLIC_PATH[id];
  revalidatePath(path);
  revalidatePath("/admin/content/pages");
  redirect("/admin/content/pages");
}
