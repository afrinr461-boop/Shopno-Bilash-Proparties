import { Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/ui/Reveal";

const TIPS = [
  "There's no wrong enquiry type to pick — choose the closest one, and our team will redirect you if needed.",
  "The more detail you share — a project name, a budget range, a land size — the faster we can actually help.",
  "You can switch the enquiry type above at any time before sending; nothing you've typed will be lost.",
];

/**
 * Fills the space the sticky form leaves open beside the (usually taller)
 * type selector, rather than leaving it blank — a few honest, generic tips
 * about using the form itself, not a claim about response times or
 * capabilities that don't exist yet.
 */
export function EnquiryTips() {
  return (
    <Reveal delay={120} className="mt-10">
      <p className="text-label text-fg-subtle mb-4 uppercase">Worth Knowing</p>
      <Divider />
      {TIPS.map((tip) => (
        <div key={tip}>
          <p className="text-body-sm text-fg-muted py-4">{tip}</p>
          <Divider />
        </div>
      ))}
    </Reveal>
  );
}
