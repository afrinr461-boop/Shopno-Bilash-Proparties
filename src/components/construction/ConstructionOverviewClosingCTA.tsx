import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SkylineBars } from "@/components/ui/SkylineBars";
import { cn } from "@/lib/utils";

export function ConstructionOverviewClosingCTA() {
  return (
    <section className="bg-fg relative overflow-hidden py-24 text-center sm:py-32 lg:py-40">
      <SkylineBars className="pointer-events-none absolute inset-0 hidden h-full w-full text-white/10 sm:block" />
      <Container className="relative">
        <Reveal delay={80}>
          <p className="text-display-l mx-auto max-w-3xl text-balance text-white">
            Have a project in mind, or want to check on one already underway?
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/projects" className={buttonVariants({ size: "lg" })}>
              Explore Projects
            </Link>
            <Link
              href="/contact?type=construction"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/35 text-white hover:border-white/70 hover:bg-white/10",
              )}
            >
              Discuss a Project
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
