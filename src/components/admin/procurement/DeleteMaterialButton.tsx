"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { deleteMaterial } from "@/features/procurement/materialActions";

export function DeleteMaterialButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deleteMaterial(id);
      if (result.error) window.alert(result.error);
    });
  }

  return <IconButton icon={Trash2} label={`Delete ${name}`} size="sm" disabled={isPending} onClick={handleDelete} className="hover:text-error" />;
}
