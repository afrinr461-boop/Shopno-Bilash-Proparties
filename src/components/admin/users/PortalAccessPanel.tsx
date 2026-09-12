"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { grantPortalAccess, resetOwnerPortalAccess } from "@/features/users/portalAccessActions";
import type { OwnerType } from "@/types/finance/costAllocation";
import type { UserStatus } from "@/types/user";

const STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  invited: "Pending Activation",
  suspended: "Suspended",
  disabled: "Deactivated",
};

export interface PortalAccessPanelProps {
  ownerType: OwnerType;
  ownerId: string;
  linkedUser: { id: string; status: UserStatus } | null;
}

/**
 * Chapter 3 — the admin-side "Portal Access" control on a Customer/
 * Shareholder/Landowner detail page. Grant creates the linked `User`
 * (still "Pending Activation" until the owner sets their own PIN — this
 * panel never sets or sees a PIN). Reset just invalidates the existing PIN
 * and forces re-activation; it can never reveal the old one.
 */
export function PortalAccessPanel({ ownerType, ownerId, linkedUser }: PortalAccessPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [showReset, setShowReset] = useState(false);
  const [reason, setReason] = useState("");

  function handleGrant() {
    setError(undefined);
    startTransition(async () => {
      const result = await grantPortalAccess(ownerType, ownerId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleReset() {
    if (!linkedUser) return;
    setError(undefined);
    startTransition(async () => {
      const result = await resetOwnerPortalAccess(linkedUser.id, reason.trim() || undefined);
      if (result.error) setError(result.error);
      else {
        setShowReset(false);
        setReason("");
        router.refresh();
      }
    });
  }

  return (
    <section className="border-border bg-surface-raised flex flex-col gap-4 rounded-lg border p-4">
      <h2 className="text-label text-fg-subtle uppercase">Portal Access</h2>

      {error && (
        <div role="alert" className="bg-error-soft text-error flex items-start gap-2.5 rounded-md px-3.5 py-3">
          <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p className="text-body-sm">{error}</p>
        </div>
      )}

      {!linkedUser ? (
        <>
          <p className="text-body-sm text-fg-muted">This owner doesn&apos;t have a portal account yet.</p>
          <Button type="button" onClick={handleGrant} loading={isPending} className="w-fit">
            <KeyRound aria-hidden className="size-4" />
            Grant Portal Access
          </Button>
        </>
      ) : (
        <>
          <div>
            <p className="text-caption text-fg-subtle uppercase">Status</p>
            <p className="text-body-sm text-fg mt-0.5 font-medium">{STATUS_LABEL[linkedUser.status]}</p>
          </div>

          {!showReset ? (
            <Button type="button" variant="outline" onClick={() => setShowReset(true)} className="w-fit">
              Reset Owner Access
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-body-sm text-fg-muted">
                This invalidates the owner&apos;s current PIN and requires them to reactivate with a new one. Their existing PIN can never be viewed or
                restored.
              </p>
              <Textarea
                label="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Owner reported a forgotten PIN"
                rows={2}
              />
              <div className="flex gap-2.5">
                <Button type="button" variant="destructive" onClick={handleReset} loading={isPending}>
                  Confirm Reset
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowReset(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
