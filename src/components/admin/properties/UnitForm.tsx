"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Unit } from "@/types/unit";
import type { Building, Floor, Project } from "@/types/project";
import type { UnitFormState } from "@/features/units/actions";

export interface UnitFormProps {
  action: (state: UnitFormState, formData: FormData) => Promise<UnitFormState>;
  unit?: Unit;
  projects: Project[];
  buildings: Building[];
  floors: Floor[];
  submitLabel: string;
  /** Presets the project when arriving from a specific project's workspace (e.g. the bulk generator or "Add Unit" CTA). */
  defaultProjectId?: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {label}
    </Button>
  );
}

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "booked", label: "Booked" },
  { value: "sold", label: "Sold" },
  { value: "allocated", label: "Allocated" },
  { value: "on-hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

const FACING_OPTIONS = [
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "north-east", label: "North-East" },
  { value: "north-west", label: "North-West" },
  { value: "south-east", label: "South-East" },
  { value: "south-west", label: "South-West" },
];

/** Cascading Project → Building → Floor — Building/Floor are now real entities (Chapter 2 Prompt 2), no more free-text identifiers. */
export function UnitForm({ action, unit, projects, buildings, floors, submitLabel, defaultProjectId }: UnitFormProps) {
  const [state, formAction] = useActionState(action, {});
  const [projectId, setProjectId] = useState(unit?.projectId ?? defaultProjectId ?? "");
  const [buildingId, setBuildingId] = useState(unit?.buildingId ?? "");

  const buildingsForProject = useMemo(() => buildings.filter((b) => b.projectId === projectId), [buildings, projectId]);
  const floorsForBuilding = useMemo(() => floors.filter((f) => f.buildingId === buildingId), [floors, buildingId]);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state.error && (
        <div role="alert" className="bg-error-soft text-error flex items-start gap-2.5 rounded-md px-3.5 py-3">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p className="text-body-sm">{state.error}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Project"
          name="projectId"
          required
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            setBuildingId("");
          }}
          placeholder="Choose a project"
        />
        <Input label="Unit Number" name="unitNumber" required defaultValue={unit?.unitNumber} placeholder="e.g. A-502" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {buildingsForProject.length === 0 ? (
          <p className="text-body-sm text-fg-subtle sm:col-span-2">
            {projectId ? "This project has no buildings yet — add one from its workspace's Units tab first." : "Choose a project first."}
          </p>
        ) : (
          <>
            <Select
              label="Building"
              name="buildingId"
              required
              options={buildingsForProject.map((b) => ({ value: b.id, label: b.name }))}
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              placeholder="Choose a building"
            />
            {buildingId && floorsForBuilding.length === 0 ? (
              <p className="text-body-sm text-fg-subtle self-end">This building has no floors yet — add one first.</p>
            ) : (
              <Select
                label="Floor"
                name="floorId"
                required
                options={floorsForBuilding.map((f) => ({ value: f.id, label: f.label }))}
                defaultValue={unit?.floorId}
                placeholder="Choose a floor"
              />
            )}
          </>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Status" name="status" required options={STATUS_OPTIONS} defaultValue={unit?.status} placeholder="Choose a status" />
        <Select label="Facing (optional)" name="facing" options={FACING_OPTIONS} defaultValue={unit?.facing} placeholder="Not set" />
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <Input label="Size (sqft)" name="sizeSqft" type="number" required defaultValue={unit?.sizeSqft} />
        <Input
          label="Allocation Ratio (optional override)"
          name="allocationRatio"
          type="number"
          step="0.0001"
          defaultValue={unit?.allocationRatio}
          helperText="Leave blank to use an area-proportional share."
        />
        <Input label="Bedrooms" name="bedrooms" type="number" defaultValue={unit?.bedrooms} />
        <Input label="Bathrooms" name="bathrooms" type="number" defaultValue={unit?.bathrooms} />
        <Input label="Balconies" name="balconies" type="number" defaultValue={unit?.balconies} />
      </div>

      <Input label="Parking Spaces" name="parkingSpaces" type="number" defaultValue={unit?.parkingSpaces} />

      <h2 className="text-label text-fg-subtle -mb-2 uppercase">Design</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Floor Plan / Layout Image"
          name="layoutImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          helperText={unit?.layoutImage ? "Leave empty to keep the current floor plan." : "JPG, PNG or WEBP, up to 15MB."}
        />
        <Input
          label="Gallery Images"
          name="gallery"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          helperText={
            unit && (unit.galleryImages?.length ?? 0) > 0
              ? `${unit.galleryImages!.length} image(s) already in the gallery — new ones are added, not replaced.`
              : "This unit's own design may differ from others — add its specific photos here."
          }
        />
      </div>

      <h2 className="text-label text-fg-subtle -mb-2 uppercase">Pricing (BDT)</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        <Input label="Base Price" name="basePrice" type="number" required defaultValue={unit?.basePrice.amount} />
        <Input label="Additional Charges" name="additionalCharges" type="number" defaultValue={unit?.additionalCharges.amount} />
        <Input label="Discount" name="discount" type="number" defaultValue={unit?.discount.amount} />
      </div>
      <p className="text-caption text-fg-subtle -mt-3">Final price is calculated automatically (base + additional − discount).</p>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
