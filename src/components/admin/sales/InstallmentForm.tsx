"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Installment } from "@/types/sales";
import type { InstallmentFormState } from "@/features/sales/installmentActions";

export interface InstallmentFormProps {
  action: (state: InstallmentFormState, formData: FormData) => Promise<InstallmentFormState>;
  installment?: Installment;
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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "due-soon", label: "Due Soon" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

/** `contractId` is a plain text field — no Contract module exists yet to pick one from, same honesty as the read-only detail page already shows. */
export function InstallmentForm({ action, installment, submitLabel }: InstallmentFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state.error && (
        <div role="alert" className="bg-error-soft text-error flex items-start gap-2.5 rounded-md px-3.5 py-3">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p className="text-body-sm">{state.error}</p>
        </div>
      )}

      <Input label="Contract ID" name="contractId" required defaultValue={installment?.contractId} placeholder="No Contract module yet — enter a reference id" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Installment Number" name="installmentNumber" type="number" required defaultValue={installment?.installmentNumber} />
        <Input label="Amount (BDT)" name="amount" type="number" required defaultValue={installment?.amount.amount} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Due Date" name="dueDate" type="date" required defaultValue={installment?.dueDate} />
        <Select label="Status" name="status" required options={STATUS_OPTIONS} defaultValue={installment?.status} placeholder="Choose a status" />
      </div>

      <Input label="Paid Date (optional)" name="paidDate" type="date" defaultValue={installment?.paidDate} />

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
