"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { unitContentRepository, slugifyUnitName } from "@/features/unitContent/repository";
import { projectContentRepository } from "@/features/projectContent/repository";
import type { UnitStatus } from "@/content/units";

export interface UnitContentFormState {
  error?: string;
}

const UNIT_STATUSES: UnitStatus[] = ["available", "reserved", "sold", "on-hold"];

function isUnitStatus(value: string): value is UnitStatus {
  return (UNIT_STATUSES as string[]).includes(value);
}

function toOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function toList(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

async function requireContentPermission(permission: "content.create" | "content.update" | "content.delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

async function parseUnitFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim();
  const unitNumber = String(formData.get("unitNumber") ?? "").trim();
  const unitType = String(formData.get("unitType") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const area = String(formData.get("area") ?? "").trim();
  const facing = String(formData.get("facing") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const featuresRaw = String(formData.get("features") ?? "");
  const floorRaw = String(formData.get("floor") ?? "");
  const bedroomsRaw = String(formData.get("bedrooms") ?? "");
  const bathroomsRaw = String(formData.get("bathrooms") ?? "");
  const balconiesRaw = String(formData.get("balconies") ?? "");
  const parkingRaw = String(formData.get("parking") ?? "");

  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." } as const;
  const projects = await projectContentRepository.list();
  if (!projectSlug || !projects.some((p) => p.slug === projectSlug)) return { error: "Choose a valid project." } as const;
  if (!unitType) return { error: "Enter a unit type, e.g. \"Apartment\"." } as const;
  if (!isUnitStatus(status)) return { error: "Choose a valid status." } as const;
  if (!shortDescription || shortDescription.length < 10) return { error: "Short description must be at least 10 characters." } as const;
  if (!description || description.length < 10) return { error: "Description must be at least 10 characters." } as const;

  return {
    fields: {
      name,
      projectSlug,
      unitNumber: unitNumber || undefined,
      unitType,
      status,
      area: area || undefined,
      facing: facing || undefined,
      price: price || undefined,
      shortDescription,
      description,
      features: toList(featuresRaw),
      floor: toOptionalNumber(floorRaw),
      bedrooms: toOptionalNumber(bedroomsRaw),
      bathrooms: toOptionalNumber(bathroomsRaw),
      balconies: toOptionalNumber(balconiesRaw),
      parking: toOptionalNumber(parkingRaw),
    },
  } as const;
}

export async function createUnitContent(
  _prevState: UnitContentFormState,
  formData: FormData,
): Promise<UnitContentFormState> {
  const user = await requireContentPermission("content.create");

  const parsed = await parseUnitFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await unitContentRepository.list();
  let slug = slugifyUnitName(fields.name);
  if (existing.some((u) => u.slug === slug)) {
    slug = `${slug}-${existing.length + 1}`;
  }

  const id = randomUUID();
  await unitContentRepository.create({
    id,
    slug,
    projectSlug: fields.projectSlug,
    name: fields.name,
    unitNumber: fields.unitNumber,
    unitType: fields.unitType,
    status: fields.status,
    floor: fields.floor,
    area: fields.area,
    bedrooms: fields.bedrooms,
    bathrooms: fields.bathrooms,
    balconies: fields.balconies,
    parking: fields.parking,
    facing: fields.facing,
    price: fields.price,
    shortDescription: fields.shortDescription,
    description: fields.description,
    features: fields.features.length > 0 ? fields.features : undefined,
    coverImage: { src: "/placeholder-image.png", alt: fields.name },
    gallery: [{ src: "/placeholder-image.png", alt: fields.name }],
  });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "content.unit.create",
    entityType: "Unit",
    entityId: id,
  });

  revalidatePath("/properties");
  revalidatePath(`/projects/${fields.projectSlug}`);
  revalidatePath(`/projects/${fields.projectSlug}/units/${slug}`);
  revalidatePath("/admin/content/properties");
  revalidatePath("/sitemap");
  revalidatePath("/sitemap.xml");
  redirect("/admin/content/properties");
}

export async function updateUnitContent(
  id: string,
  _prevState: UnitContentFormState,
  formData: FormData,
): Promise<UnitContentFormState> {
  const user = await requireContentPermission("content.update");

  const parsed = await parseUnitFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existingUnit = await unitContentRepository.findById(id);
  if (!existingUnit) return { error: "This unit no longer exists." };

  const updated = await unitContentRepository.update(id, {
    projectSlug: fields.projectSlug,
    name: fields.name,
    unitNumber: fields.unitNumber,
    unitType: fields.unitType,
    status: fields.status,
    floor: fields.floor,
    area: fields.area,
    bedrooms: fields.bedrooms,
    bathrooms: fields.bathrooms,
    balconies: fields.balconies,
    parking: fields.parking,
    facing: fields.facing,
    price: fields.price,
    shortDescription: fields.shortDescription,
    description: fields.description,
    features: fields.features.length > 0 ? fields.features : undefined,
  });
  if (!updated) return { error: "This unit no longer exists." };

  await recordAuditEvent({
    actorUserId: user.id,
    action: "content.unit.update",
    entityType: "Unit",
    entityId: id,
  });

  revalidatePath("/properties");
  revalidatePath(`/projects/${existingUnit.projectSlug}`);
  revalidatePath(`/projects/${existingUnit.projectSlug}/units/${existingUnit.slug}`);
  revalidatePath("/admin/content/properties");
  revalidatePath("/sitemap");
  revalidatePath("/sitemap.xml");
  redirect("/admin/content/properties");
}

export async function deleteUnitContent(id: string): Promise<void> {
  const user = await requireContentPermission("content.delete");

  const unit = await unitContentRepository.findById(id);
  if (!unit) return;

  await unitContentRepository.remove(id);

  await recordAuditEvent({
    actorUserId: user.id,
    action: "content.unit.delete",
    entityType: "Unit",
    entityId: id,
  });

  revalidatePath("/properties");
  revalidatePath(`/projects/${unit.projectSlug}`);
  revalidatePath(`/projects/${unit.projectSlug}/units/${unit.slug}`);
  revalidatePath("/admin/content/properties");
  revalidatePath("/sitemap");
  revalidatePath("/sitemap.xml");
  revalidatePath("/saved");
  revalidatePath("/", "layout");
}
