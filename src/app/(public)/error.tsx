"use client";

import { ErrorContent } from "@/components/errors/ErrorContent";

/** Route-segment error boundary for the whole public site — Next.js requires this file to be a Client Component. */
export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorContent error={error} reset={reset} />;
}
