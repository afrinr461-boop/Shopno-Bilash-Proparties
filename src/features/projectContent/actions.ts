"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { recordAuditEvent } from "@/features/audit/repository";
import { projectContentRepository, slugifyProjectName } from "@/features/projectContent/repository";
import type { ProjectStatus } from "@/content/projects";

export interface ProjectContentFormState {
  error?: string;
}

const PROJECT_STATUSES: ProjectStatus[] = [
  "upcoming",
  "planning",
  "ongoing",
  "near-completion",
  "completed",
  "sold-out",
];

function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as string[]).includes(value);
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

async function requireContentPermission(permission: "content.create" | "content.update" | "content.delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, permission)) throw new Error("Forbidden");
  return user;
}

function parseProjectFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const projectType = String(formData.get("projectType") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const buildingType = String(formData.get("buildingType") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const locationDescription = String(formData.get("locationDescription") ?? "").trim();
  const featuresRaw = String(formData.get("features") ?? "");
  const unitTypesRaw = String(formData.get("unitTypes") ?? "");
  const completionYearRaw = String(formData.get("completionYear") ?? "");
  const totalUnitsRaw = String(formData.get("totalUnits") ?? "");
  const availableUnitsRaw = String(formData.get("availableUnits") ?? "");
  const totalParkingCarRaw = String(formData.get("totalParkingCar") ?? "");
  const availableParkingCarRaw = String(formData.get("availableParkingCar") ?? "");
  const totalParkingBikeRaw = String(formData.get("totalParkingBike") ?? "");
  const availableParkingBikeRaw = String(formData.get("availableParkingBike") ?? "");
  const floorsRaw = String(formData.get("floors") ?? "");
  const featured = formData.get("featured") === "on";

  if (!name || name.length < 3) return { error: "Name must be at least 3 characters." } as const;
  if (!location) return { error: "Enter a display location, e.g. \"Gulshan 2, Dhaka\"." } as const;
  if (!city) return { error: "Enter a city." } as const;
  if (!projectType) return { error: "Choose a project type." } as const;
  if (!isProjectStatus(status)) return { error: "Choose a valid status." } as const;
  if (!shortDescription || shortDescription.length < 10) return { error: "Short description must be at least 10 characters." } as const;
  if (!description || description.length < 10) return { error: "Description must be at least 10 characters." } as const;

  return {
    fields: {
      name,
      location,
      city,
      projectType,
      status,
      shortDescription,
      description,
      buildingType: buildingType || undefined,
      area: area || undefined,
      locationDescription: locationDescription || undefined,
      features: toList(featuresRaw),
      unitTypes: toList(unitTypesRaw),
      completionYear: toOptionalNumber(completionYearRaw),
      totalUnits: toOptionalNumber(totalUnitsRaw),
      availableUnits: toOptionalNumber(availableUnitsRaw),
      totalParkingCar: toOptionalNumber(totalParkingCarRaw),
      availableParkingCar: toOptionalNumber(availableParkingCarRaw),
      totalParkingBike: toOptionalNumber(totalParkingBikeRaw),
      availableParkingBike: toOptionalNumber(availableParkingBikeRaw),
      floors: toOptionalNumber(floorsRaw),
      featured,
    },
  } as const;
}

export async function createProjectContent(
  _prevState: ProjectContentFormState,
  formData: FormData,
): Promise<ProjectContentFormState> {
  const user = await requireContentPermission("content.create");

  const parsed = parseProjectFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existing = await projectContentRepository.list();
  let slug = slugifyProjectName(fields.name);
  if (existing.some((p) => p.slug === slug)) {
    slug = `${slug}-${existing.length + 1}`;
  }

  const id = randomUUID();
  await projectContentRepository.create({
    id,
    slug,
    name: fields.name,
    location: fields.location,
    city: fields.city,
    projectType: fields.projectType,
    status: fields.status,
    shortDescription: fields.shortDescription,
    description: fields.description,
    buildingType: fields.buildingType,
    area: fields.area,
    locationDescription: fields.locationDescription,
    features: fields.features.length > 0 ? fields.features : undefined,
    unitTypes: fields.unitTypes.length > 0 ? fields.unitTypes : undefined,
    completionYear: fields.completionYear,
    totalUnits: fields.totalUnits,
    availableUnits: fields.availableUnits,
    totalParkingCar: fields.totalParkingCar,
    availableParkingCar: fields.availableParkingCar,
    totalParkingBike: fields.totalParkingBike,
    availableParkingBike: fields.availableParkingBike,
    floors: fields.floors,
    featured: fields.featured,
    coverImage: { src: "/placeholder-image.png", alt: fields.name },
    gallery: [{ src: "/placeholder-image.png", alt: fields.name }],
  });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "content.project.create",
    entityType: "Project",
    entityId: id,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath(`/projects/${slug}/construction`);
  revalidatePath("/admin/content/projects");
  revalidatePath("/sitemap");
  revalidatePath("/sitemap.xml");
  revalidatePath("/saved");
  revalidatePath("/", "layout");
  revalidatePath("/gallery");
  revalidatePath("/landowners");
  revalidatePath("/services");
  revalidatePath("/construction");
  redirect("/admin/content/projects");
}

export async function updateProjectContent(
  id: string,
  _prevState: ProjectContentFormState,
  formData: FormData,
): Promise<ProjectContentFormState> {
  const user = await requireContentPermission("content.update");

  const parsed = parseProjectFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { fields } = parsed;

  const existingProject = await projectContentRepository.findById(id);
  if (!existingProject) return { error: "This project no longer exists." };

  const updated = await projectContentRepository.update(id, {
    name: fields.name,
    location: fields.location,
    city: fields.city,
    projectType: fields.projectType,
    status: fields.status,
    shortDescription: fields.shortDescription,
    description: fields.description,
    buildingType: fields.buildingType,
    area: fields.area,
    locationDescription: fields.locationDescription,
    features: fields.features.length > 0 ? fields.features : undefined,
    unitTypes: fields.unitTypes.length > 0 ? fields.unitTypes : undefined,
    completionYear: fields.completionYear,
    totalUnits: fields.totalUnits,
    availableUnits: fields.availableUnits,
    totalParkingCar: fields.totalParkingCar,
    availableParkingCar: fields.availableParkingCar,
    totalParkingBike: fields.totalParkingBike,
    availableParkingBike: fields.availableParkingBike,
    floors: fields.floors,
    featured: fields.featured,
  });
  if (!updated) return { error: "This project no longer exists." };

  await recordAuditEvent({
    actorUserId: user.id,
    action: "content.project.update",
    entityType: "Project",
    entityId: id,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${existingProject.slug}`);
  revalidatePath(`/projects/${existingProject.slug}/construction`);
  revalidatePath("/admin/content/projects");
  revalidatePath("/sitemap");
  revalidatePath("/sitemap.xml");
  revalidatePath("/saved");
  revalidatePath("/", "layout");
  revalidatePath("/gallery");
  revalidatePath("/landowners");
  revalidatePath("/services");
  revalidatePath("/construction");
  redirect("/admin/content/projects");
}

export async function deleteProjectContent(id: string): Promise<void> {
  const user = await requireContentPermission("content.delete");

  const project = await projectContentRepository.findById(id);
  if (!project) return;

  await projectContentRepository.remove(id);

  await recordAuditEvent({
    actorUserId: user.id,
    action: "content.project.delete",
    entityType: "Project",
    entityId: id,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  revalidatePath(`/projects/${project.slug}/construction`);
  revalidatePath("/admin/content/projects");
  revalidatePath("/sitemap");
  revalidatePath("/sitemap.xml");
  revalidatePath("/saved");
  revalidatePath("/", "layout");
  revalidatePath("/gallery");
  revalidatePath("/landowners");
  revalidatePath("/services");
  revalidatePath("/construction");
}
