import Link from "next/link";
import { ArrowRight, FileStack, Images, Newspaper, Building2, Home } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PermissionDeniedState } from "@/components/feedback/PermissionDeniedState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const SECTIONS = [
  { label: "News", href: "/admin/content/news", icon: Newspaper, comingSoon: false },
  { label: "Projects", href: "/admin/content/projects", icon: Building2, comingSoon: false },
  { label: "Properties", href: "/admin/content/properties", icon: Home, comingSoon: false },
  { label: "Gallery", href: "/admin/content/gallery", icon: Images, comingSoon: false },
  { label: "Pages", href: "/admin/content/pages", icon: FileStack, comingSoon: false },
];

/** CMS index — News is the first real domain (CMS Step 1); the rest follow the same repository/action/permission pattern later. */
export default async function AdminContentPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "content.view")) {
    return (
      <div className="p-4 sm:p-6">
        <PermissionDeniedState description="You don't have permission to manage website content." />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader title="Content" description="Manage what the public website shows." />
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          if (section.comingSoon) {
            return (
              <div
                key={section.label}
                aria-disabled="true"
                className="border-border text-fg-subtle/60 flex cursor-not-allowed items-center gap-3 rounded-lg border border-dashed p-4"
              >
                <Icon aria-hidden className="size-5 shrink-0" />
                <span className="text-body-sm flex-1">{section.label}</span>
                <span className="text-caption bg-surface rounded px-1.5 py-0.5">Soon</span>
              </div>
            );
          }
          return (
            <Link
              key={section.label}
              href={section.href}
              className="border-border hover:border-fg-subtle group flex items-center gap-3 rounded-lg border p-4 transition-colors"
            >
              <Icon aria-hidden className="text-fg-muted size-5 shrink-0" />
              <span className="text-body-sm flex-1 text-fg">{section.label}</span>
              <ArrowRight
                aria-hidden
                className="text-fg-subtle size-4 shrink-0 transition-transform group-hover:translate-x-1"
              />
            </Link>
          );
        })}
      </div>
    </>
  );
}
