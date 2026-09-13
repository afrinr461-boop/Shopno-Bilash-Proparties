"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PinInput } from "@/components/auth/PinInput";
import { identifyOwnerAction, ownerPinLoginAction, activateOwnerPinAction, devOwnerLogin, type OwnerAuthState } from "@/lib/auth/ownerActions";

const INITIAL: OwnerAuthState = { step: "phone" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      {label}
    </Button>
  );
}

function DevOwnerButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" loading={pending} className="w-full">
      Continue as Owner (dev)
    </Button>
  );
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="bg-error-soft text-error flex items-start gap-2.5 rounded-md px-3.5 py-3">
      <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p className="text-body-sm">{message}</p>
    </div>
  );
}

/**
 * The owner portal's phone+PIN sign-in — three server actions
 * (`lib/auth/ownerActions.ts`) chained by a small client-side `phase`
 * state. Each step is its own `useActionState`, so the server always
 * re-validates everything (phone status, PIN correctness) rather than the
 * client just trusting whatever the previous step returned.
 */
export function OwnerLoginFlow() {
  const [identifyState, identifyFormAction] = useActionState(identifyOwnerAction, INITIAL);
  const [pinState, pinFormAction] = useActionState(ownerPinLoginAction, INITIAL);
  const [activateState, activateFormAction] = useActionState(activateOwnerPinAction, INITIAL);
  const [showForgot, setShowForgot] = useState(false);

  const [phase, setPhase] = useState<OwnerAuthState["step"]>("phone");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState<string | undefined>();

  // Adjust local state during render (not in an effect) when the identify
  // action produces a new result — React's documented pattern for state
  // that must react to another piece of state while still allowing a local
  // override (the "Use a different number" back-link below).
  const [processedIdentifyState, setProcessedIdentifyState] = useState(identifyState);
  if (identifyState !== processedIdentifyState) {
    setProcessedIdentifyState(identifyState);
    if (identifyState.step !== "phone") {
      setPhase(identifyState.step);
      setPhone(identifyState.phone ?? "");
      setFirstName(identifyState.firstName);
    }
  }

  function goBack() {
    setPhase("phone");
    setShowForgot(false);
  }

  if (phase === "pin") {
    return (
      <div className="flex flex-col gap-4">
        <button type="button" onClick={goBack} className="text-caption text-fg-subtle hover:text-fg flex items-center gap-1 transition-colors">
          <ArrowLeft aria-hidden className="size-3.5" /> Use a different number
        </button>
        <div>
          <p className="text-label text-fg-subtle uppercase">Welcome back{firstName ? `, ${firstName}` : ""}</p>
          <p className="text-body-sm text-fg-muted mt-1">Enter your 4-digit PIN to continue.</p>
        </div>
        <form action={pinFormAction} className="flex flex-col gap-4">
          <ErrorBanner message={pinState.error} />
          <input type="hidden" name="phone" value={phone} />
          <PinInput name="pin" label="PIN" autoFocus />
          <SubmitButton label="Sign in" />
        </form>
        {!showForgot ? (
          <button type="button" onClick={() => setShowForgot(true)} className="text-caption text-accent hover:text-accent-strong self-start transition-colors">
            Forgot PIN?
          </button>
        ) : (
          <p className="text-caption text-fg-subtle border-border rounded-md border p-3">
            For your security, PIN resets are handled by our team. Please contact Shopno Bilash Properties Ltd. with your registered phone number, and
            we&apos;ll reset your access.
          </p>
        )}
      </div>
    );
  }

  if (phase === "activate") {
    return (
      <div className="flex flex-col gap-4">
        <button type="button" onClick={goBack} className="text-caption text-fg-subtle hover:text-fg flex items-center gap-1 transition-colors">
          <ArrowLeft aria-hidden className="size-3.5" /> Use a different number
        </button>
        <div>
          <p className="text-label text-fg-subtle uppercase">Welcome{firstName ? `, ${firstName}` : ""}</p>
          <p className="text-body-sm text-fg-muted mt-1">This is your first time here — set a 4-digit PIN to secure your portal.</p>
        </div>
        <form action={activateFormAction} className="flex flex-col gap-5">
          <ErrorBanner message={activateState.error} />
          <input type="hidden" name="phone" value={phone} />
          <PinInput name="pin" label="Create PIN" autoFocus />
          <PinInput name="confirmPin" label="Confirm PIN" />
          <SubmitButton label="Activate & Sign in" />
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={identifyFormAction} className="flex flex-col gap-4">
        <ErrorBanner message={identifyState.error} />
        <Input label="Phone Number" name="phone" type="tel" autoComplete="tel" required placeholder="01XXXXXXXXX" />
        <SubmitButton label="Continue" />
      </form>
      {process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true" && (
        <form action={devOwnerLogin} className="border-border border-t pt-4">
          <DevOwnerButton />
        </form>
      )}
    </div>
  );
}
