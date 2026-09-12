"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { projectRepository } from "@/features/projects/repository";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/fileStorage";
import type { ProjectStatus } from "@/types/project";

export interface ProjectFormState {
  error?: string;
}

const PROJECT_STATUSES: ProjectStatus[] = [
  "upcoming",
  "planning",
  "ongoing",
  "ready",
  "completed",
  "suspended",
  "cancelled",
];
const SALES_STATUSES = ["not-started", "open", "closed"] as const;
type SalesStatus = (typeof SALES_STATUSES)[number];

function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as string[]).includes(value);
}

function isSalesStatus(value: string): value is SalesStatus {
  return (SALES_STATUSES as readonly string[]).includes(value);
}

function toList(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toOptionalNumber(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function toOptionalDate(raw: string): string | undefined {
  return raw.trim() || undefined;
}

/** A file input with nothing chosen still shows up in FormData as an empty File — treat that as "no file". Same convention as gallery's `createGalleryItem`. */
function getUploadedFile(formData: FormData, field: string): File | null {
  const file = formData.get(field);
  return file instanceof File && file.size > 0 ? file : null;
}

function getUploadedFiles(formData: FormData, field: string): File[] {
  return formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
}

async function requireProjectPermission(permission: "project.create" | "project.update" | "project.delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

/** Same convention as every content slugify helper — internal Project has its own `slug`, unused by any route today, but kept consistent for a future one. */
function slugifyProjectCode(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseProjectFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const landAreaSqftRaw = String(formData.get("landAreaSqft") ?? "");
  const plotInfo = String(formData.get("plotInfo") ?? "").trim();
  const ownershipStructure = String(formData.get("ownershipStructure") ?? "").trim();
  const propertyType = String(formData.get("propertyType") ?? "").trim();
  const buildingCountRaw = String(formData.get("buildingCount") ?? "");
  const floorCountRaw = String(formData.get("floorCount") ?? "");
  const unitCountRaw = String(formData.get("unitCount") ?? "");
  const parkingCountRaw = String(formData.get("parkingCount") ?? "");
  const amenitiesRaw = String(formData.get("amenities") ?? "");
  const launchDate = String(formData.get("launchDate") ?? "");
  const constructionStartDate = String(formData.get("constructionStartDate") ?? "");
  const expectedCompletionDate = String(formData.get("expectedCompletionDate") ?? "");
  const handoverDate = String(formData.get("handoverDate") ?? "");
  const status = String(formData.get("status") ?? "");
  const salesStatus = String(formData.get("salesStatus") ?? "");
  const budgetRaw = String(formData.get("budget") ?? "");
  const isPublished = formData.get("isPublished") === "on";

  if (!name || name.length < 3) return { error: "Name must be at least 3 characters." } as const;
  if (!code) return { error: "Enter a project code, e.g. \"MER-01\"." } as const;
  if (!description || description.length < 10) return { error: "Description must be at least 10 characters." } as const;
  if (!address) return { error: "Enter an address." } as const;
  if (!city) return { error: "Enter a city." } as const;
  if (!propertyType) return { error: "Enter a property type." } as const;
  if (!isProjectStatus(status)) return { error: "Choose a valid status." } as const;
  if (!isSalesStatus(salesStatus)) return { error: "Choose a valid sales status." } as const;

  const buildingCount = toOptionalNumber(buildingCountRaw) ?? 0;
  const floorCount = toOptionalNumber(floorCountRaw) ?? 0;
  const unitCount = toOptionalNumber(unitCountRaw) ?? 0;

  return {
    fields: {
      name,
      code,
      description,
      address,
      area: area || undefined,
      city,
      postalCode: postalCode || undefined,
      landAreaSqft: toOptionalNumber(landAreaSqftRaw),
      plotInfo: plotInfo || undefined,
      ownershipStructure: ownershipStructure || undefined,
      propertyType,
      buildingCount,
      floorCount,
      unitCount,
      parkingCount: toOptionalNumber(parkingCountRaw),
      amenities: toList(amenitiesRaw),
      launchDate: toOptionalDate(launchDate),
      constructionStartDate: toOptionalDate(constructionStartDate),
      expectedCompletionDate: toOptionalDate(expectedCompletionDate),
      handoverDate: toOptionalDate(handoverDate),
      status,
      salesStatus,
      budget: toOptionalNumber(budgetRaw),
      isPublished,
    },
  } as const;
}

export async function createProject(_prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const user = await requireProjectPermission("project.create");

  const parsed = parseProjectFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const coverFile = getUploadedFile(formData, "coverImage");
  const galleryFiles = getUploadedFiles(formData, "gallery");

  let coverImage: string | undefined;
  let gallery: string[] = [];
  try {
    if (coverFile) coverImage = (await saveUploadedFile(coverFile, "projects")).url;
    if (galleryFiles.length > 0) {
      gallery = (await Promise.all(galleryFiles.map((f) => saveUploadedFile(f, "projects")))).map((f) => f.url);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save the uploaded image(s)." };
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await projectRepository.create({
    id,
    code: fields.code,
    name: fields.name,
    slug: slugifyProjectCode(fields.name),
    description: fields.description,
    address: fields.address,
    area: fields.area,
    city: fields.city,
    postalCode: fields.postalCode,
    landAreaSqft: fields.landAreaSqft,
    plotInfo: fields.plotInfo,
    ownershipStructure: fields.ownershipStructure,
    propertyType: fields.propertyType,
    buildingCount: fields.buildingCount,
    floorCount: fields.floorCount,
    unitCount: fields.unitCount,
    parkingCount: fields.parkingCount,
    amenities: fields.amenities,
    launchDate: fields.launchDate,
    constructionStartDate: fields.constructionStartDate,
    expectedCompletionDate: fields.expectedCompletionDate,
    handoverDate: fields.handoverDate,
    status: fields.status,
    salesStatus: fields.salesStatus,
    budget: fields.budget !== undefined ? { amount: fields.budget, currency: "BDT" } : undefined,
    media: { coverImage, gallery, renders: [], videos: [] },
    isPublished: fields.isPublished,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
  });

  await recordAuditEvent({ actorUserId: user.id, action: "project.create", entityType: "Project", entityId: id });

  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function updateProject(
  id: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const user = await requireProjectPermission("project.update");

  const parsed = parseProjectFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await projectRepository.findById(id);
  if (!existing) return { error: "This project no longer exists." };

  const coverFile = getUploadedFile(formData, "coverImage");
  const galleryFiles = getUploadedFiles(formData, "gallery");

  let coverImage = existing.media.coverImage;
  let gallery = existing.media.gallery;
  try {
    if (coverFile) {
      const saved = await saveUploadedFile(coverFile, "projects");
      if (existing.media.coverImage) await deleteUploadedFile(existing.media.coverImage);
      coverImage = saved.url;
    }
    if (galleryFiles.length > 0) {
      const saved = await Promise.all(galleryFiles.map((f) => saveUploadedFile(f, "projects")));
      gallery = [...existing.media.gallery, ...saved.map((f) => f.url)];
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save the uploaded image(s)." };
  }

  const updated = await projectRepository.update(id, {
    code: fields.code,
    name: fields.name,
    description: fields.description,
    address: fields.address,
    area: fields.area,
    city: fields.city,
    postalCode: fields.postalCode,
    landAreaSqft: fields.landAreaSqft,
    plotInfo: fields.plotInfo,
    ownershipStructure: fields.ownershipStructure,
    propertyType: fields.propertyType,
    buildingCount: fields.buildingCount,
    floorCount: fields.floorCount,
    unitCount: fields.unitCount,
    parkingCount: fields.parkingCount,
    amenities: fields.amenities,
    launchDate: fields.launchDate,
    constructionStartDate: fields.constructionStartDate,
    expectedCompletionDate: fields.expectedCompletionDate,
    handoverDate: fields.handoverDate,
    status: fields.status,
    salesStatus: fields.salesStatus,
    budget: fields.budget !== undefined ? { amount: fields.budget, currency: "BDT" } : undefined,
    media: { ...existing.media, coverImage, gallery },
    isPublished: fields.isPublished,
    updatedBy: user.id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return { error: "This project no longer exists." };

  await recordAuditEvent({ actorUserId: user.id, action: "project.update", entityType: "Project", entityId: id });

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  redirect(`/admin/projects/${id}`);
}

export async function deleteProject(id: string): Promise<void> {
  const user = await requireProjectPermission("project.delete");

  const existing = await projectRepository.findById(id);
  if (!existing) return;

  await projectRepository.remove(id);

  await recordAuditEvent({ actorUserId: user.id, action: "project.delete", entityType: "Project", entityId: id });

  revalidatePath("/admin/projects");
}
