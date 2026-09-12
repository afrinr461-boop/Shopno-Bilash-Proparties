"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { deleteStockMovement } from "@/features/procurement/stockMovementActions";

export function DeleteStockMovementButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Delete this movement? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deleteStockMovement(id);
      if (result.error) window.alert(result.error);
    });
  }

  return <IconButton icon={Trash2} label="Delete movement" size="sm" disabled={isPending} onClick={handleDelete} className="hover:text-error" />;
}
