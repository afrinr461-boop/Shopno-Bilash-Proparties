"use client";

import { useState, useTransition } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { sendOverdueNotices } from "@/features/costAllocations/notifyActions";

export function SendOverdueNoticesButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | undefined>();

  function handleClick() {
    setMessage(undefined);
    startTransition(async () => {
      const result = await sendOverdueNotices();
      const parts = [`${result.sent} notice${result.sent === 1 ? "" : "s"} sent`];
      if (result.alreadyNotified > 0) parts.push(`${result.alreadyNotified} already notified`);
      if (result.noPortalAccount > 0) parts.push(`${result.noPortalAccount} have no portal account`);
      setMessage(parts.join(" · "));
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button type="button" variant="outline" size="sm" onClick={handleClick} loading={isPending}>
        <BellRing aria-hidden className="size-3.5" />
        Send Overdue Notices
      </Button>
      {message && <p className="text-caption text-fg-subtle">{message}</p>}
    </div>
  );
}
