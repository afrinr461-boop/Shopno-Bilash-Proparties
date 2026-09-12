"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Tabs } from "@/components/ui/Tabs";

export interface UnitDetailTabsProps {
  overview: ReactNode;
  design: ReactNode;
  ownership: ReactNode;
  sales: ReactNode;
  parking: ReactNode;
  documents: ReactNode;
  financial: ReactNode;
}

const ITEMS = [
  { value: "overview", label: "Overview" },
  { value: "design", label: "Design" },
  { value: "ownership", label: "Ownership" },
  { value: "sales", label: "Sales & Bookings" },
  { value: "parking", label: "Parking" },
  { value: "documents", label: "Documents" },
  { value: "financial", label: "Financial" },
];

/** Server-rendered content per section, passed through as children — this component only owns which tab is active. */
export function UnitDetailTabs({ overview, design, ownership, sales, parking, documents, financial }: UnitDetailTabsProps) {
  const [value, setValue] = useState("overview");

  const content: Record<string, ReactNode> = { overview, design, ownership, sales, parking, documents, financial };

  return (
    <div className="flex flex-col gap-6">
      <Tabs items={ITEMS} value={value} onChange={setValue} />
      <div>{content[value]}</div>
    </div>
  );
}
