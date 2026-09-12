"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/types/project";
import type { CostAllocationFormState } from "@/features/costAllocations/actions";
import type { AllocationMethod } from "@/types/finance/costAllocation";

export interface CostAllocationFormProps {
  action: (state: CostAllocationFormState, formData: FormData) => Promise<CostAllocationFormState>;
  projects: Project[];
  submitLabel: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {label}
    </Button>
  );
}

const FINE_TYPE_OPTIONS = [
  { value: "flat", label: "Flat amount (BDT)" },
  { value: "percentage", label: "Percentage of outstanding" },
];

const ALLOCATION_METHOD_OPTIONS: { value: AllocationMethod; label: string }[] = [
  { value: "sqft", label: "Area / Square Feet" },
  { value: "unit-ratio", label: "Predefined Unit Ratio" },
  { value: "fixed-unit", label: "Fixed Amount per Unit" },
  { value: "custom", label: "Fully Custom per Unit" },
  { value: "tier", label: "Tiered Groups (Custom)" },
];

/** Creates a `CostAllocation` in "draft" status — contributions are generated separately, on the detail page, after a preview. */
export function CostAllocationForm({ action, projects, submitLabel }: CostAllocationFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>("sqft");
  const parkingEligible = allocationMethod === "fixed-unit" || allocationMethod === "custom" || allocationMethod === "tier";

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state.error && (
        <div role="alert" className="bg-error-soft text-error flex items-start gap-2.5 rounded-md px-3.5 py-3">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p className="text-body-sm">{state.error}</p>
        </div>
      )}

      <Select
        label="Project"
        name="projectId"
        required
        options={projects.map((p) => ({ value: p.id, label: p.name }))}
        placeholder={projects.length > 0 ? "Choose a project" : "No projects yet — add one first"}
      />

      <Input label="Title" name="title" required placeholder="e.g. Piling — Phase 1" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Category" name="category" required placeholder="e.g. Piling, Foundation" />
        <Input label="Total Amount (BDT)" name="totalAmount" type="number" required />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Allocation Date" name="allocationDate" type="date" required />
        <Input label="Due Date" name="dueDate" type="date" required />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Fine Type" name="fineType" required options={FINE_TYPE_OPTIONS} defaultValue="percentage" />
        <Input
          label="Fine Value"
          name="fineValue"
          type="number"
          required
          helperText="A taka amount if Flat, or a percentage (e.g. 5) if Percentage."
        />
      </div>

      <h2 className="text-label text-fg-subtle -mb-2 uppercase">Allocation</h2>
      <Select
        label="Allocation Method"
        name="allocationMethod"
        required
        options={ALLOCATION_METHOD_OPTIONS}
        value={allocationMethod}
        onChange={(e) => setAllocationMethod(e.target.value as AllocationMethod)}
        helperText={
          allocationMethod === "sqft"
            ? "Each owner's share is proportional to their units' total area."
            : allocationMethod === "unit-ratio"
              ? "Each unit's own allocation ratio decides its owner's share (falls back to area when a unit has no ratio set)."
              : allocationMethod === "tier"
                ? "Every unit starts at an equal baseline share; you'll group units into named tiers and adjust each tier's share up or down in the next step."
                : "You'll enter each applicable unit's exact amount before confirming — no automatic formula."
        }
      />
      {parkingEligible && (
        <Switch
          name="includeParkingInAllocation"
          label="Include Parking"
          description="Parking has no area basis, so this only applies with a fixed/custom amount you set per parking space in the next step."
        />
      )}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
