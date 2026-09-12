/** Prompt 6 §2 defaults — suggestions only (the `category` field stays free text, same as before), not a fixed enum, so a project can use a category not in this list. */
export const DEFAULT_EXPENSE_CATEGORIES = [
  "Construction",
  "Labour",
  "Contractor",
  "Material",
  "Equipment",
  "Machinery",
  "Transport",
  "Site Work",
  "Utilities",
  "Office",
  "Staff",
  "Travel",
  "Professional",
  "Legal/Government",
  "Miscellaneous",
];

/** Prompt 6 §6. */
export const PAYMENT_METHODS: { value: string; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

/** Prompt 6 §6. */
export const TRANSACTION_STATUSES: { value: string; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "verified", label: "Verified" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];
