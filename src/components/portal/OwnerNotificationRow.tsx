"use client";

import { useTransition } from "react";
import { formatDateTime } from "@/lib/format";
import { markNotificationRead } from "@/features/notifications/actions";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";

export function OwnerNotificationRow({ notification }: { notification: Notification }) {
  const [isPending, startTransition] = useTransition();
  const unread = notification.status !== "read" && notification.status !== "archived";

  function handleClick() {
    if (!unread) return;
    startTransition(() => {
      markNotificationRead(notification.id);
    });
  }

  return (
    <li
      onClick={handleClick}
      className={cn(
        "hover:bg-surface flex cursor-pointer items-start gap-3 p-5 transition-colors",
        unread ? "bg-accent-soft/40" : "",
        isPending && "opacity-60",
      )}
    >
      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", unread ? "bg-accent" : "bg-transparent")} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-body text-fg font-medium">{notification.title}</p>
        <p className="text-body-sm text-fg-muted mt-0.5">{notification.body}</p>
        {notification.imageUrl && (
          <div className="mt-2.5 max-w-xs">
            <Media src={notification.imageUrl} alt="" ratio="standard" radius="md" sizes="320px" />
          </div>
        )}
        <p className="text-caption text-fg-subtle mt-1.5">{formatDateTime(new Date(notification.createdAt))}</p>
      </div>
    </li>
  );
}
