import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ProjectUnitsGrid, type GridBuilding } from "@/components/admin/properties/ProjectUnitsGrid";
import { projectRepository } from "@/features/projects/repository";
import { buildingRepository } from "@/features/buildings/repository";
import { floorRepository } from "@/features/floors/repository";
import { unitRepository } from "@/features/units/repository";
import { resolveUnitOwner } from "@/features/ownership/resolveUnitOwner";
import { resolveDocumentOwner } from "@/features/documents/resolveOwner";
import { canAccessProject } from "@/lib/projectScope";
import type { Building, Floor } from "@/types/project";
import type { Unit } from "@/types/unit";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Building → Floor → Unit visual grid — the read-focused workspace view. Full CRUD/search lives on the global Properties page, reached here pre-filtered. */
export default async function ProjectUnitsPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "unit.view")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to view Units." />
      </div>
    );
  }

  let project;
  let buildings: Building[] | undefined;
  let floors: Floor[] | undefined;
  let units: Unit[] | undefined;
  try {
    project = await projectRepository.findById(id);
    if (project) {
      [buildings, floors, units] = await Promise.all([
        buildingRepository.list().then((all) => all.filter((b) => b.projectId === id)),
        floorRepository.list().then((all) => all.filter((f) => f.projectId === id)),
        unitRepository.list().then((all) => all.filter((u) => u.projectId === id)),
      ]);
    }
  } catch {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState description="Units couldn't be loaded. Please try again." />
      </div>
    );
  }

  if (!project || !buildings || !floors || !units) notFound();
  if (!canAccessProject(user, project.id)) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="This project isn't assigned to your account." />
      </div>
    );
  }

  const ownerLabels = new Map<string, string>();
  for (const unit of units) {
    const ownerRef = await resolveUnitOwner(unit);
    if (ownerRef) {
      const resolved = await resolveDocumentOwner(ownerRef.ownerType, ownerRef.ownerId);
      ownerLabels.set(unit.id, resolved.label);
    }
  }

  const gridBuildings: GridBuilding[] = buildings
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((building) => ({
      ...building,
      floors: floors
        .filter((f) => f.buildingId === building.id)
        .sort((a, b) => a.floorNumber - b.floorNumber)
        .map((floor) => ({
          ...floor,
          units: units
            .filter((u) => u.floorId === floor.id)
            .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber))
            .map((u) => ({ id: u.id, unitNumber: u.unitNumber, status: u.status, ownerLabel: ownerLabels.get(u.id) })),
        })),
    }));

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-fg-muted">{units.length} unit(s) in this project.</p>
        <Link
          href={`/admin/properties?projectId=${project.id}`}
          className="text-body-sm text-accent hover:text-accent-strong inline-flex items-center gap-1.5 font-medium transition-colors"
        >
          Manage all units <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </div>

      <ProjectUnitsGrid projectId={project.id} buildings={gridBuildings} />
    </div>
  );
}
