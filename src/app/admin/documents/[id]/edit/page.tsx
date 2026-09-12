import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DocumentForm } from "@/components/admin/documents/DocumentForm";
import { updateDocument } from "@/features/documents/actions";
import { documentRepository } from "@/features/documents/repository";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "documents.upload")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to edit this document." />
      </div>
    );
  }

  const document = await documentRepository.findById(id);
  if (!document) notFound();

  const boundAction = updateDocument.bind(null, id);

  return (
    <>
      <AdminPageHeader
        title={document.name}
        breadcrumbs={[
          { label: "Documents", href: "/admin/documents" },
          { label: document.name, href: `/admin/documents/${id}` },
          { label: "Edit" },
        ]}
      />
      <div className="p-4 sm:p-6">
        <DocumentForm action={boundAction} document={document} submitLabel="Save Changes" />
      </div>
    </>
  );
}
