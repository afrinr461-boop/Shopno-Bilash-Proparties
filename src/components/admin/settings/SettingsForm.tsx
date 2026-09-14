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
      <p className="text-caption text-fg-subtle -mt-3">Shown in the public site&rsquo;s footer, under &ldquo;Contact&rdquo; — each field is hidden there individually while empty, nothing is ever shown as a placeholder.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Address (optional)" name="address" defaultValue={settings.address} />
        <Input label="Phone (optional)" name="phone" defaultValue={settings.phone} />
        <Input
          label="WhatsApp Number (optional)"
          name="whatsapp"
          defaultValue={settings.whatsapp}
          placeholder="e.g. 8801XXXXXXXXX"
          helperText="With country code, digits only — becomes a tap-to-chat link in the footer."
        />
        <Input label="Email (optional)" name="email" type="email" defaultValue={settings.email} />
        <Input label="Website (optional)" name="website" defaultValue={settings.website} />
        <div className="sm:col-span-2">
          <Input
            label="Hours (optional)"
            name="hours"
            defaultValue={settings.hours}
            placeholder="e.g. Sat–Thu, 10am–7pm (GMT+6)"
          />
        </div>
      </div>

      <h2 className="text-label text-fg-subtle mt-2 uppercase">Social Media</h2>
      <p className="text-caption text-fg-subtle -mt-3">
        Full profile URLs (e.g. https://instagram.com/yourpage). Shown as an icon in the public footer&rsquo;s &ldquo;Follow&rdquo;
        column — only for the platforms you fill in here, never an invented or dead link.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Instagram (optional)" name="socialInstagram" type="url" defaultValue={settings.socialInstagram} placeholder="https://instagram.com/…" />
        <Input label="Facebook (optional)" name="socialFacebook" type="url" defaultValue={settings.socialFacebook} placeholder="https://facebook.com/…" />
        <Input label="TikTok (optional)" name="socialTiktok" type="url" defaultValue={settings.socialTiktok} placeholder="https://tiktok.com/@…" />
        <Input label="X (optional)" name="socialX" type="url" defaultValue={settings.socialX} placeholder="https://x.com/…" />
        <Input label="Threads (optional)" name="socialThreads" type="url" defaultValue={settings.socialThreads} placeholder="https://threads.net/@…" />
        <Input label="Pinterest (optional)" name="socialPinterest" type="url" defaultValue={settings.socialPinterest} placeholder="https://pinterest.com/…" />
        <Input label="YouTube (optional)" name="socialYoutube" type="url" defaultValue={settings.socialYoutube} placeholder="https://youtube.com/@…" />
        <Input label="LinkedIn (optional)" name="socialLinkedin" type="url" defaultValue={settings.socialLinkedin} placeholder="https://linkedin.com/company/…" />
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

      <h2 className="text-label text-fg-subtle mt-2 uppercase">Public &ldquo;Our Impact&rdquo; Stats</h2>
      <p className="text-caption text-fg-subtle -mt-3">Shown on the public About page. Leave any of these empty and the site shows a placeholder instead of a made-up number.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Ongoing Developments" name="impactOngoingDevelopments" type="number" defaultValue={settings.impactOngoingDevelopments} />
        <Input label="Development Area (acres)" name="impactDevelopmentAreaAcres" type="number" defaultValue={settings.impactDevelopmentAreaAcres} />
        <Input label="Locations" name="impactLocations" type="number" defaultValue={settings.impactLocations} />
        <Input label="Landowner Partnerships" name="impactLandownerPartnerships" type="number" defaultValue={settings.impactLandownerPartnerships} />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
      </div>
    </form>
  );
}
