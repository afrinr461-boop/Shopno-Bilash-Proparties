"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/IconButton";
import { buttonVariants } from "@/components/ui/Button";
import { PROJECT_STATUS_LABEL, type Project } from "@/content/projects";
import { deleteProjectContent } from "@/features/projectContent/actions";
import { cn } from "@/lib/utils";

export interface ProjectContentAdminTableProps {
  projects: Project[];
  canDelete: boolean;
}

export function ProjectContentAdminTable({ projects, canDelete }: ProjectContentAdminTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(project: Project) {
    if (!window.confirm(`Delete "${project.name}"? This can't be undone.`)) return;
    startTransition(() => {
      deleteProjectContent(project.id);
    });
  }

  const columns: DataTableColumn<Project>[] = [
    {
      key: "name",
      header: "Name",
      render: (p) => (
        <span className="flex items-center gap-2">
          {p.featured && <Star aria-hidden className="text-accent size-3.5 shrink-0 fill-current" />}
          <span className="text-fg">{p.name}</span>
        </span>
      ),
    },
    { key: "city", header: "City", render: (p) => p.city },
    { key: "projectType", header: "Type", render: (p) => p.projectType },
    { key: "status", header: "Status", render: (p) => PROJECT_STATUS_LABEL[p.status] },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (p) => (
        <span className="flex items-center justify-end gap-1">
          <Link href={`/admin/content/projects/${p.id}/edit`}>
            <IconButton icon={Pencil} label={`Edit ${p.name}`} size="sm" />
          </Link>
          {canDelete && (
            <IconButton
              icon={Trash2}
              label={`Delete ${p.name}`}
              size="sm"
              disabled={isPending}
              onClick={() => handleDelete(p)}
              className="hover:text-error"
            />
          )}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={projects}
      getRowId={(p) => p.id}
      emptyTitle="No projects yet."
      emptyDescription="Create the first project to publish it on the public site."
      emptyAction={
        <Link href="/admin/content/projects/new" className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-2")}>
          New Project
        </Link>
      }
    />
  );
}
