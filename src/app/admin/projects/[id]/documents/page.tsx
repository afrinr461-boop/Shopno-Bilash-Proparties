import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { projectRepository } from "@/features/projects/repository";
import { canAccessProject } from "@/lib/projectScope";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * `Document` has polymorphic ownership (entityType/entityId), not a
 * `projectId` field — retrofitting project-scoping onto it is a bigger,
 * unrelated schema change. This tab is honest about that instead of
 * fabricating a filter, and links to the unfiltered global Documents page.
 */
export default async function ProjectDocumentsPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "documents.view")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to view Documents." />
      </div>
    );
  }

  let project;
  try {
    project = await projectRepository.findById(id);
  } catch {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState description="This project couldn't be loaded. Please try again." />
      </div>
    );
  }

  if (!project) notFound();
  if (!canAccessProject(user, project.id)) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="This project isn't assigned to your account." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <EmptyState
        icon={FileText}
        title="Documents aren't filtered by project yet"
        description="Documents are linked to the record they belong to (a unit, customer, agreement, etc.), not directly to a project — browse the full library instead."
        action={
          <Link
            href="/admin/documents"
            className="text-body-sm text-accent hover:text-accent-strong inline-flex items-center gap-1.5 font-medium transition-colors"
          >
            Open Documents <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        }
      />
    </div>
  );
}
