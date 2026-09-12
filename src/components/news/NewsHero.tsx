import { Container } from "@/components/ui/Container";
import { NewsTimeline } from "@/components/ui/NewsTimeline";
import { Reveal } from "@/components/ui/Reveal";

/**
 * A proper opener for News — same editorial-split family as
 * Projects/Services/Contact/Gallery/Properties, with a chronological-feed
 * motif standing in for "updates over time." Replaces what used to be a
 * single small label and nothing else.
 */
export function NewsHero() {
  return (
    <section className="relative overflow-hidden">
      <Reveal
        as="div"
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] items-center lg:flex"
      >
        <NewsTimeline className="text-border-strong h-auto w-full opacity-70" />
        <div className="from-bg absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
      </Reveal>

      <Container className="relative">
        <div className="max-w-2xl py-24 sm:py-32 lg:max-w-xl lg:py-36">
          <Reveal as="p" className="text-label text-fg-subtle mb-6 uppercase">
            News &amp; Updates
          </Reveal>
          <h1 className="flex flex-col">
            <Reveal as="span" className="text-display-xl">
              What&rsquo;s happening,
            </Reveal>
            <Reveal as="span" delay={100} className="text-display-xl text-fg-subtle">
              as it happens.
            </Reveal>
          </h1>
          <Reveal delay={220}>
            <p className="text-body-lg text-fg-muted mt-8 max-w-xl">
              Project updates, construction milestones and company news from Shopno Bilash Properties.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
