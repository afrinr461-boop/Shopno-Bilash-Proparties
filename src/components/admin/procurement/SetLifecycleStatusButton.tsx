"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Power, PowerOff } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import type { LifecycleStatus } from "@/types/procurement";

export interface SetLifecycleStatusButtonProps {
  status: LifecycleStatus | undefined;
  label: string;
  onSetStatus: (status: LifecycleStatus) => Promise<{ error?: string }>;
}

/** One reusable status toggle for Material/MaterialCategory/Vendor — "inactive" retires a record without losing its purchase/stock history, the preferred path once anything real references it. Absent status = "active". */
export function SetLifecycleStatusButton({ status, label, onSetStatus }: SetLifecycleStatusButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isActive = status !== "inactive";

  function handleToggle() {
    const next: LifecycleStatus = isActive ? "inactive" : "active";
    startTransition(async () => {
      const result = await onSetStatus(next);
      if (result.error) window.alert(result.error);
      else router.refresh();
    });
  }

  return (
    <IconButton
      icon={isActive ? PowerOff : Power}
      label={isActive ? `Set ${label} inactive` : `Set ${label} active`}
      size="sm"
      disabled={isPending}
      onClick={handleToggle}
      className={isActive ? "hover:text-warning" : "hover:text-success"}
    />
  );
}
