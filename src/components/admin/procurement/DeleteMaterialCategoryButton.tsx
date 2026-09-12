"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { deleteMaterialCategory } from "@/features/procurement/materialCategoryActions";

export function DeleteMaterialCategoryButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete category "${name}"? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deleteMaterialCategory(id);
      if (result.error) window.alert(result.error);
    });
  }

  return <IconButton icon={Trash2} label={`Delete ${name}`} size="sm" disabled={isPending} onClick={handleDelete} className="hover:text-error" />;
}
