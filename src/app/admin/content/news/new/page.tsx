import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewsArticleForm } from "@/components/admin/news/NewsArticleForm";
import { createNewsArticle } from "@/features/news/actions";
import { projects } from "@/content/projects";

export default async function NewNewsArticlePage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "content.create")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to create News content." />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="New Article"
        breadcrumbs={[
          { label: "Content", href: "/admin/content" },
          { label: "News", href: "/admin/content/news" },
          { label: "New" },
        ]}
      />
      <div className="p-4 sm:p-6">
        <NewsArticleForm action={createNewsArticle} projects={projects} submitLabel="Publish Article" />
      </div>
    </>
  );
}
