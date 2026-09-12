import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { buttonVariants } from "@/components/ui/Button";
import { UnitContentAdminTable } from "@/components/admin/unitContent/UnitContentAdminTable";
import { unitContentRepository } from "@/features/unitContent/repository";
import { projectContentRepository } from "@/features/projectContent/repository";

/** List page for the Website CMS's Properties (Unit) domain — same shape as Projects CMS's list page. */
export default async function AdminUnitContentListPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "content.view")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to manage Properties content." />
      </div>
    );
  }

  const [units, projects] = await Promise.all([unitContentRepository.list(), projectContentRepository.list()]);
  const projectsBySlug = new Map(projects.map((p) => [p.slug, p]));
  const rows = units.map((u) => ({ ...u, projectName: projectsBySlug.get(u.projectSlug)?.name ?? u.projectSlug }));

  const canCreate = hasPermission(user.role, "content.create");
  const canDelete = hasPermission(user.role, "content.delete");

  return (
    <>
      <AdminPageHeader
        title="Properties"
        description="Individual units shown on the public Properties pages."
        breadcrumbs={[{ label: "Content", href: "/admin/content" }, { label: "Properties" }]}
        primaryAction={
          canCreate && (
            <Link href="/admin/content/properties/new" className={buttonVariants({ size: "md" })}>
              <Plus aria-hidden className="size-4" />
              New Property
            </Link>
          )
        }
      />
      <div className="p-4 sm:p-6">
        <UnitContentAdminTable units={rows} canDelete={canDelete} />
      </div>
    </>
  );
}
