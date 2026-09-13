"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction, devSuperAdminLogin, type LoginState } from "@/lib/auth/actions";

const INITIAL_STATE: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="mt-2 w-full">
      Sign in
    </Button>
  );
}

function DevSuperAdminButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" loading={pending} className="w-full">
      Continue as Super Admin (dev)
    </Button>
  );
}

/**
 * Client boundary kept as small as possible — just the form and its
 * pending/error state via React 19's `useActionState`/`useFormStatus`.
 * `loginAction` runs entirely server-side (Server Action); this component
 * never sees a password hash, a session secret, or the verification logic.
 */
export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {state.error && (
          <div role="alert" className="bg-error-soft text-error flex items-start gap-2.5 rounded-md px-3.5 py-3">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <p className="text-body-sm">{state.error}</p>
          </div>
        )}
        <Input label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
        <SubmitButton />
      </form>
      {process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true" && (
        <form action={devSuperAdminLogin} className="border-border border-t pt-4">
          <DevSuperAdminButton />
        </form>
      )}
    </div>
  );
}
