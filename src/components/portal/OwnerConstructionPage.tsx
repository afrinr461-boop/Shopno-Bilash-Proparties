import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { resolveOwnerContext } from "@/lib/ownerContext";
import { EmptyState } from "@/components/feedback/EmptyState";
import { getOwnerUnits, getOwnerProjects, getOwnerConstructionProgress } from "@/features/ownerPortal/queries";

/**
 * "All Properties" construction overview — Chapter 3 Prompt 4 §24. A
 * single-property owner goes straight to their property's construction
 * page (matching `OwnerPropertyIndex`'s same convention); a multi-property
 * owner sees a project-grouped picker first, exactly like the Payments
 * overview, so progress from different properties is never blended into
 * one misleading number.
 */
export async function OwnerConstructionPage({ base }: { base: string }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const context = resolveOwnerContext(user);
  if (!context) {
    return (
      <div className="p-4 sm:p-6 lg:p-10">
        <EmptyState title="No property is currently connected to your account." description="Please contact Shopno Bilash Properties Ltd. for assistance." />
      </div>
    );
  }

  const units = await getOwnerUnits(context.ownerType, context.ownerId);
  if (units.length === 1) {
    redirect(`${base}/construction/${units[0].id}`);
  }
  if (units.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-10">
        <EmptyState title="No construction updates are available yet" description="Progress for your property will appear here once it begins." />
      </div>
    );
  }

  const [projects, progress] = await Promise.all([
    getOwnerProjects(context.ownerType, context.ownerId),
    getOwnerConstructionProgress(context.ownerType, context.ownerId),
  ]);
  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const progressByProject = new Map(progress.map((p) => [p.projectId, p]));

  const unitsByProject = new Map<string, typeof units>();
  for (const unit of units) {
    const list = unitsByProject.get(unit.projectId) ?? [];
    list.push(unit);
    unitsByProject.set(unit.projectId, list);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6 lg:p-10">
      <div>
        <p className="text-label text-fg-subtle uppercase">Construction</p>
        <h1 className="text-display-m text-fg mt-2">My Properties</h1>
      </div>

      <ul className="border-border bg-surface-raised divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
        {Array.from(unitsByProject.entries()).map(([projectId, projectUnits]) => {
          const p = progressByProject.get(projectId);
          return (
            <li key={projectId}>
              <Link href={`${base}/construction/${projectUnits[0].id}`} className="hover:bg-surface flex items-center justify-between gap-3 p-5 transition-colors">
                <div>
                  <p className="text-body text-fg font-medium">{projectsById.get(projectId)?.name ?? "—"}</p>
                  <p className="text-body-sm text-fg-muted mt-0.5">{projectUnits.map((u) => u.unitNumber).join(", ")}</p>
                  {p?.currentStageName && <p className="text-caption text-fg-subtle mt-1">{p.currentStageName}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-body text-fg font-medium">{p?.averageProgress ?? 0}%</p>
                  <ChevronRight aria-hidden className="text-fg-subtle size-4" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
