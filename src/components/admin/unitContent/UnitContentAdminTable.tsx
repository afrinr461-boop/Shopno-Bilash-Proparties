"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/IconButton";
import { buttonVariants } from "@/components/ui/Button";
import { UNIT_STATUS_LABEL, type Unit } from "@/content/units";
import { deleteUnitContent } from "@/features/unitContent/actions";
import { cn } from "@/lib/utils";

export interface UnitContentAdminTableProps {
  units: (Unit & { projectName: string })[];
  canDelete: boolean;
}

export function UnitContentAdminTable({ units, canDelete }: UnitContentAdminTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(unit: Unit) {
    if (!window.confirm(`Delete "${unit.name}"? This can't be undone.`)) return;
    startTransition(() => {
      deleteUnitContent(unit.id);
    });
  }

  const columns: DataTableColumn<Unit & { projectName: string }>[] = [
    { key: "name", header: "Name", render: (u) => <span className="text-fg">{u.name}</span> },
    { key: "project", header: "Project", render: (u) => u.projectName },
    { key: "unitType", header: "Type", render: (u) => u.unitType },
    { key: "status", header: "Status", render: (u) => UNIT_STATUS_LABEL[u.status] },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <span className="flex items-center justify-end gap-1">
          <Link href={`/admin/content/properties/${u.id}/edit`}>
            <IconButton icon={Pencil} label={`Edit ${u.name}`} size="sm" />
          </Link>
          {canDelete && (
            <IconButton
              icon={Trash2}
              label={`Delete ${u.name}`}
              size="sm"
              disabled={isPending}
              onClick={() => handleDelete(u)}
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
      data={units}
      getRowId={(u) => u.id}
      emptyTitle="No properties yet."
      emptyDescription="Create the first property to publish it on the public site."
      emptyAction={
        <Link
          href="/admin/content/properties/new"
          className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-2")}
        >
          New Property
        </Link>
      }
    />
  );
}
