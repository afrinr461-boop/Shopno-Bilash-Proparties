import { Container } from "@/components/ui/Container";
import { FrameStack } from "@/components/ui/FrameStack";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Same editorial-split family as Projects/Services/Contact — large layered
 * headline on one side, an architectural visual breaking to the edge on
 * the other. Here it's a fanned stack of photo frames (drawn in on scroll)
 * rather than a skyline: a gallery's subject is the photographs
 * themselves, not another building silhouette.
 */
export function GalleryIntro() {
  return (
    <section className="relative overflow-hidden">
      <Reveal
        as="div"
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] items-center lg:flex"
      >
        <FrameStack className="text-border-strong h-auto w-full opacity-70" />
        <div className="from-bg absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
      </Reveal>

      <Container className="relative">
        <div className="max-w-2xl py-24 sm:py-32 lg:max-w-xl lg:py-40">
          <Reveal as="p" className="text-label text-fg-subtle mb-4 uppercase">
            Gallery
          </Reveal>
          <h1 className="flex flex-col">
            <Reveal as="span" className="text-display-xl">
              A visual record of
            </Reveal>
            <Reveal as="span" delay={100} className="text-display-xl text-fg-subtle">
              what we build.
            </Reveal>
          </h1>
          <Reveal delay={220}>
            <p className="text-body-lg text-fg-muted mt-8 max-w-xl">
              Architecture, construction and the projects behind them — a running collection, organized by category.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
