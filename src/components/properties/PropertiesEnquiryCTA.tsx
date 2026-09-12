import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SkylineBars } from "@/components/ui/SkylineBars";
import { cn } from "@/lib/utils";

/** Same dark closing-beat family as <ProjectEnquiryCTA>/<UnitEnquiryCTA> — the generic "didn't find the right unit" case, without a specific property in context. */
export function PropertiesEnquiryCTA() {
  return (
    <section className="bg-fg relative overflow-hidden py-24 text-center sm:py-32 lg:py-40">
      <SkylineBars className="pointer-events-none absolute inset-0 hidden h-full w-full text-white/10 sm:block" />
      <Container className="relative">
        <Reveal as="p" className="text-label mb-6 text-white/60 uppercase">
          Didn&rsquo;t find the right one?
        </Reveal>
        <Reveal delay={80}>
          <p className="text-display-l mx-auto max-w-3xl text-balance text-white">
            Tell us what you&rsquo;re looking for.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/contact?type=property" className={buttonVariants({ size: "lg" })}>
              Talk to Our Team
            </Link>
            <Link
              href="/projects"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/35 text-white hover:border-white/70 hover:bg-white/10",
              )}
            >
              Browse All Developments
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
