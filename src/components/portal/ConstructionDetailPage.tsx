import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { resolveOwnerContext } from "@/lib/ownerContext";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { StatusBadge } from "@/components/ui/Badge";
import { PropertySwitcher } from "@/components/portal/PropertySwitcher";
import { ConstructionHero } from "@/components/portal/ConstructionHero";
import { PropertyTimeline, type PropertyMilestone } from "@/components/portal/PropertyTimeline";
import { ConstructionUpdatesFeed } from "@/components/portal/ConstructionUpdatesFeed";
import { ScheduleUpdatesList } from "@/components/portal/ScheduleUpdatesList";
import { PropertyGallery } from "@/components/portal/PropertyGallery";
import { formatDate } from "@/lib/format";
import {
  getOwnerUnitDetail,
  getOwnerUnits,
  getOwnerProjects,
  getOwnerConstructionDetail,
  type OwnerConstructionPhase,
} from "@/features/ownerPortal/queries";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="text-label text-fg-subtle mb-4 uppercase">{children}</p>;
}

function phasesToMilestones(phases: OwnerConstructionPhase[], currentStageId: string | null): PropertyMilestone[] {
  return phases.map((p) => {
    const state: PropertyMilestone["state"] =
      p.status === "completed" || p.status === "cancelled" ? "done" : p.id === currentStageId ? "current" : "upcoming";
    return { label: p.name, date: p.status === "completed" ? p.actualEndDate : p.targetEndDate, state };
  });
}

/**
 * Chapter 3 Prompt 4 — the dedicated Construction Progress experience.
 * Every figure comes from `getOwnerConstructionDetail`, which reads the
 * same Chapter 2 phase/milestone/activity-log engine the Admin's own
 * Construction dashboard uses — this page only formats and presents.
 */
export async function ConstructionDetailPage({ base, unitId }: { base: string; unitId: string }) {
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

  const [detail, unitDetail, allUnits, ownerProjects] = await Promise.all([
    getOwnerConstructionDetail(context.ownerType, context.ownerId, unitId),
    getOwnerUnitDetail(context.ownerType, context.ownerId, unitId),
    getOwnerUnits(context.ownerType, context.ownerId),
    getOwnerProjects(context.ownerType, context.ownerId),
  ]);
  if (!detail || !unitDetail) notFound();

  const { unit, project, building, floor } = unitDetail;
  const projectNameById = new Map(ownerProjects.map((p) => [p.id, p.name]));
  const switcherItems = allUnits.map((u) => ({ unitId: u.id, unitNumber: u.unitNumber, projectName: projectNameById.get(u.projectId) ?? "—" }));

  const journeyMilestones = phasesToMilestones(detail.phases, detail.currentStage?.id ?? null);
  const milestoneItems: PropertyMilestone[] = detail.milestones.map((m) => ({
    label: m.name,
    date: m.completedDate ?? m.targetDate,
    state: m.status === "completed" ? "done" : "upcoming",
  }));
  const galleryImages = detail.galleryPhotos.map((p) => ({ src: p.url, alt: p.name }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 p-4 pb-16 sm:p-6 lg:p-10">
      <PropertySwitcher base={base} section="construction" items={switcherItems} activeUnitId={unit.id} />

      <div>
        <p className="text-label text-fg-subtle uppercase">
          {project?.name ?? "—"}
          {building?.name ? ` · ${building.name}` : ""}
          {floor?.label ? ` · ${floor.label}` : ""}
        </p>
        <h1 className="text-display-m text-fg mt-2">Construction Progress</h1>
        <p className="text-body text-fg-muted mt-1">Unit {unit.unitNumber}</p>
      </div>

      <Reveal>
        <ConstructionHero
          scopeLevel={detail.scopeLevel}
          scopeLabel={detail.scopeLabel}
          progress={detail.progress}
          currentStageName={detail.currentStage?.name}
        />
      </Reveal>

      {detail.currentStage && (
        <Reveal>
          <SectionHeading>Currently Underway</SectionHeading>
          <div className="border-accent/40 bg-accent-soft flex items-center justify-between gap-4 rounded-2xl border p-7 shadow-sm sm:p-8">
            <div>
              <p className="text-h3 text-fg">{detail.currentStage.name}</p>
              <p className="text-body-sm text-fg-muted mt-1">{detail.currentStage.progress}% complete</p>
              {detail.nextStageName && <p className="text-caption text-fg-subtle mt-2">Next: {detail.nextStageName}</p>}
            </div>
            <StatusBadge status={detail.currentStage.isDelayed ? "delayed" : detail.currentStage.status} />
          </div>
        </Reveal>
      )}

      {journeyMilestones.length > 0 && (
        <Reveal>
          <SectionHeading>Project Journey</SectionHeading>
          <PropertyTimeline milestones={journeyMilestones} />
        </Reveal>
      )}

      {milestoneItems.length > 0 && (
        <Reveal>
          <SectionHeading>Milestones</SectionHeading>
          <PropertyTimeline milestones={milestoneItems} />
        </Reveal>
      )}

      {detail.scheduleUpdates.length > 0 && (
        <Reveal>
          <SectionHeading>Schedule Updates</SectionHeading>
          <ScheduleUpdatesList updates={detail.scheduleUpdates} />
        </Reveal>
      )}

      <Reveal>
        <SectionHeading>Estimated Completion</SectionHeading>
        {detail.expectedCompletionDate ? (
          <div className="bg-surface rounded-2xl p-7 sm:p-8">
            <p className="text-display-m text-fg">{formatDate(new Date(detail.expectedCompletionDate))}</p>
            {detail.isHandedOver && <p className="text-body-sm text-fg-muted mt-1">Handover date</p>}
          </div>
        ) : (
          <p className="text-body-sm text-fg-muted">The completion timeline will be updated as the project progresses.</p>
        )}
      </Reveal>

      <Reveal>
        <SectionHeading>Latest Updates</SectionHeading>
        <ConstructionUpdatesFeed updates={detail.updates} />
      </Reveal>

      <Reveal>
        <SectionHeading>Construction Gallery</SectionHeading>
        {galleryImages.length > 0 ? (
          <PropertyGallery images={galleryImages} />
        ) : (
          <EmptyState title="No photos yet" description="Construction photos will appear here as updates are shared." />
        )}
      </Reveal>
    </div>
  );
}
