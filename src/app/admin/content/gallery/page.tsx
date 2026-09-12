import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { buttonVariants } from "@/components/ui/Button";
import { GalleryAdminGrid } from "@/components/admin/gallery/GalleryAdminGrid";
import { galleryRepository } from "@/features/gallery/repository";

export default async function AdminGalleryListPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "content.view")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to manage Gallery content." />
      </div>
    );
  }

  const items = await galleryRepository.list();
  const canCreate = hasPermission(user.role, "content.create");
  const canDelete = hasPermission(user.role, "content.delete");

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Images shown on the public Gallery page."
        breadcrumbs={[{ label: "Content", href: "/admin/content" }, { label: "Gallery" }]}
        primaryAction={
          canCreate && (
            <Link href="/admin/content/gallery/new" className={buttonVariants({ size: "md" })}>
              <Plus aria-hidden className="size-4" />
              New Image
            </Link>
          )
        }
      />
      <div className="p-4 sm:p-6">
        <GalleryAdminGrid items={items} canDelete={canDelete} />
      </div>
    </>
  );
}
