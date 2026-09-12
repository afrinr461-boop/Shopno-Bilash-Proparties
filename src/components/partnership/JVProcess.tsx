import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PlotOutline } from "@/components/ui/PlotOutline";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { jvProcess } from "@/content/partnership";

/** Same connected-line timeline language as Construction's — a process is a journey too, not a list of features. A surveyed plot on the right stands in for the land this whole process starts from. */
export function JVProcess() {
  return (
    <Section id="process" spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-14 uppercase">
          How a Partnership Works
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div className="relative">
            <div aria-hidden className="bg-border absolute top-2 bottom-2 left-[13px] w-px" />

            {jvProcess.map((step, i) => (
              <Reveal key={step.title} delay={i * 60} className="relative flex gap-8 pb-12 last:pb-0">
                <span className="text-label text-fg-subtle relative z-10 w-7 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="-mt-1 flex-1">
                  <h3 className="text-h3">{step.title}</h3>
                  <p className="text-body text-fg-muted mt-2 max-w-xl">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <PlotOutline className="text-border-strong h-auto w-full" />
            <p className="text-body-sm text-fg-subtle border-border mt-6 max-w-xs border-t pt-4">
              Every partnership starts the same way — with the land itself, surveyed and understood before anything
              is proposed.
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="border-border mt-16 border-t pt-10">
          <Link
            href="/contact?type=land-jv"
            className="text-button text-accent hover:text-accent-strong inline-flex items-center gap-2"
          >
            Discuss a Development Partnership
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
