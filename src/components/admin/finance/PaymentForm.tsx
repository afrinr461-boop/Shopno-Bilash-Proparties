"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { CustomerPayment, PaymentMethod } from "@/types/finance/customer";
import type { Customer } from "@/types/customer";
import type { Project } from "@/types/project";
import type { PaymentFormState } from "@/features/finance/paymentActions";

export interface PaymentFormProps {
  action: (state: PaymentFormState, formData: FormData) => Promise<PaymentFormState>;
  payment?: CustomerPayment;
  customers: Customer[];
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

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "mobile-banking", label: "Mobile Banking" },
  { value: "card", label: "Card" },
];

export function PaymentForm({ action, payment, customers, projects, submitLabel }: PaymentFormProps) {
  const [state, formAction] = useActionState(action, {});

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
          label="Customer"
          name="customerId"
          required
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
          defaultValue={payment?.customerId}
          placeholder={customers.length > 0 ? "Choose a customer" : "No customers yet — add one first"}
        />
        <Select
          label="Project (optional)"
          name="projectId"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          defaultValue={payment?.projectId}
          placeholder={projects.length > 0 ? "Not linked to a project" : "No projects yet"}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Amount (BDT)" name="amount" type="number" required defaultValue={payment?.amount.amount} />
        <Select label="Method" name="method" required options={METHOD_OPTIONS} defaultValue={payment?.method} placeholder="Choose a method" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Category" name="category" required defaultValue={payment?.category} placeholder="e.g. Down Payment, Installment" />
        <Input label="Date" name="date" type="date" required defaultValue={payment?.date} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Receipt # (optional)" name="receiptNumber" defaultValue={payment?.receiptNumber} />
        <Input label="Reference (optional)" name="reference" defaultValue={payment?.reference} />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
