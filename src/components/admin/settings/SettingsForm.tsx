"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CompanySettings } from "@/types/settings";
import type { SettingsFormState } from "@/features/settings/actions";

export interface SettingsFormProps {
  action: (state: SettingsFormState, formData: FormData) => Promise<SettingsFormState>;
  settings: CompanySettings;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Save Changes
    </Button>
  );
}

export function SettingsForm({ action, settings }: SettingsFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state.error && (
        <div role="alert" className="bg-error-soft text-error flex items-start gap-2.5 rounded-md px-3.5 py-3">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p className="text-body-sm">{state.error}</p>
        </div>
      )}

      <h2 className="text-label text-fg-subtle uppercase">Company</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Legal Name" name="legalName" required defaultValue={settings.legalName} />
        <Input label="Display Name" name="displayName" required defaultValue={settings.displayName} />
      </div>

      <h2 className="text-label text-fg-subtle mt-2 uppercase">Contact</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Address (optional)" name="address" defaultValue={settings.address} />
        <Input label="Phone (optional)" name="phone" defaultValue={settings.phone} />
        <Input label="Email (optional)" name="email" type="email" defaultValue={settings.email} />
        <Input label="Website (optional)" name="website" defaultValue={settings.website} />
      </div>

      <h2 className="text-label text-fg-subtle mt-2 uppercase">Regional & Defaults</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Date Format (optional)" name="dateFormat" defaultValue={settings.dateFormat} placeholder="e.g. DD MMM YYYY" />
        <Input label="Time Zone (optional)" name="timeZone" defaultValue={settings.timeZone} placeholder="e.g. Asia/Dhaka" />
        <Input
          label="Default Low-Stock Threshold (optional)"
          name="defaultLowStockThreshold"
          type="number"
          defaultValue={settings.defaultLowStockThreshold}
          helperText="Used when a material has no threshold of its own set."
        />
        <Input
          label="Reminder Lead Days (optional)"
          name="reminderLeadDays"
          type="number"
          defaultValue={settings.reminderLeadDays}
          helperText="How many days ahead documents/bookings expiring soon are surfaced."
        />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
      </div>
    </form>
  );
}
