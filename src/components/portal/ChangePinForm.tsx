"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PinInput } from "@/components/auth/PinInput";
import { changeOwnerPinAction, type ChangeOwnerPinState } from "@/lib/auth/ownerActions";

const INITIAL: ChangeOwnerPinState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full sm:w-auto">
      Update PIN
    </Button>
  );
}

export function ChangePinForm() {
  const [state, formAction] = useActionState(changeOwnerPinAction, INITIAL);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-body-sm text-accent hover:text-accent-strong font-medium transition-colors">
        Change PIN
      </button>
    );
  }

  return (
    <form action={formAction} key={state.success ? "reset" : "form"} className="flex flex-col gap-4">
      {state.error && (
        <div role="alert" className="bg-error-soft text-error flex items-start gap-2.5 rounded-md px-3.5 py-3">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p className="text-body-sm">{state.error}</p>
        </div>
      )}
      {state.success && (
        <div className="bg-success-soft text-success flex items-start gap-2.5 rounded-md px-3.5 py-3">
          <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p className="text-body-sm">Your PIN has been updated.</p>
        </div>
      )}
      <PinInput name="currentPin" label="Current PIN" autoFocus />
      <PinInput name="newPin" label="New PIN" />
      <PinInput name="confirmPin" label="Confirm New PIN" />
      <div className="flex gap-2.5">
        <SubmitButton />
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
