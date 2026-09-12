import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SkylineBars } from "@/components/ui/SkylineBars";
import { cn } from "@/lib/utils";

/** Every catalog/index page ends with a real next step (brief §18) — Gallery's is the projects behind the images. */
export function GalleryClosingCTA() {
  return (
    <section className="bg-fg relative overflow-hidden py-24 text-center sm:py-32 lg:py-40">
      <SkylineBars className="pointer-events-none absolute inset-0 hidden h-full w-full text-white/10 sm:block" />
      <Container className="relative">
        <Reveal delay={80}>
          <p className="text-display-l mx-auto max-w-3xl text-balance text-white">
            See the projects behind these images.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/projects" className={buttonVariants({ size: "lg" })}>
              Explore Projects
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/35 text-white hover:border-white/70 hover:bg-white/10",
              )}
            >
              Enquire
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
