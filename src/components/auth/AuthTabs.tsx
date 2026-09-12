"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { OwnerLoginFlow } from "@/components/auth/OwnerLoginFlow";

const ITEMS = [
  { value: "owner", label: "Property Owner" },
  { value: "staff", label: "Staff" },
];

/** One shared entry point (`/login`), two credential types — phone+PIN for owners/shareholders/landowners, email+password for staff. The post-auth redirect (`lib/auth/actions.ts` / `lib/auth/ownerActions.ts`) sends each to the right area by role. */
export function AuthTabs() {
  const [tab, setTab] = useState("owner");

  return (
    <div className="flex flex-col gap-6">
      <Tabs items={ITEMS} value={tab} onChange={setTab} />
      {tab === "owner" ? <OwnerLoginFlow /> : <LoginForm />}
    </div>
  );
}
