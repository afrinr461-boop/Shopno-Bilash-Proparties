import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/**
 * A proper confirmation moment (brief §11), not a one-line toast — and not
 * a promised response time, since no such policy actually exists. Three
 * ways forward so the visitor isn't just left staring at a checkmark.
 */
export function EnquirySuccessState() {
  return (
    <Reveal className="border-border-strong bg-surface-raised rounded-md border p-8 sm:p-10">
      <span className="bg-accent-soft text-accent flex size-11 items-center justify-center rounded-full">
        <Check aria-hidden className="size-5" />
      </span>
      <p className="text-label text-fg-subtle mt-6 uppercase">Enquiry Received</p>
      <p className="text-h2 mt-2">Thank you for getting in touch.</p>
      <p className="text-body text-fg-muted mt-4 max-w-md">
        Your enquiry has been received, and our team can follow up through the contact information you provided.
      </p>

      <div className="mt-8 flex flex-col flex-wrap gap-3 sm:flex-row">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to Home
        </Link>
        <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
          Explore Projects
        </Link>
        <Link href="/properties" className={buttonVariants({ variant: "outline" })}>
          View Properties
        </Link>
      </div>
    </Reveal>
  );
}
