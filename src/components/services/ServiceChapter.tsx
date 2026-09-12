import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import type { Service } from "@/content/services";

export interface ServiceChapterProps {
  service: Service;
  imagePosition?: "left" | "right";
  background?: "bg" | "surface";
}

/**
 * The full treatment for a featured service — large image, the capability's
 * own description, a concrete "what this involves" list and who it's for,
 * ending in a CTA to wherever that service actually lives on the site. Not
 * a card: id-anchored (`id={service.id}`) so <ServiceIndex> can jump here.
 */
export function ServiceChapter({ service, imagePosition = "left", background = "bg" }: ServiceChapterProps) {
  return (
    <Section id={service.id} spacing="lg" background={background}>
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className={imagePosition === "left" ? "lg:col-span-7" : "lg:order-2 lg:col-span-7"}>
            <Reveal>
              <Media
                ratio="standard"
                radius="md"
                src="/placeholder-image.png"
                alt={`${service.title} — architectural placeholder image`}
                sizes="(min-width: 1024px) 58vw, 100vw"
              />
            </Reveal>
          </div>

          <div className={imagePosition === "left" ? "lg:col-span-5" : "lg:order-1 lg:col-span-5"}>
            <Reveal as="p" className="text-label text-fg-subtle tabular-nums">
              {service.number}
            </Reveal>
            <Reveal delay={60}>
              <h2 className="text-display-m mt-3">{service.title}</h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-body-lg text-fg-muted mt-4">{service.description}</p>
            </Reveal>

            <Reveal delay={180} className="mt-8 flex flex-col gap-3">
              {service.handles.map((item) => (
                <p key={item} className="text-body-sm text-fg-muted border-border border-t pt-3">
                  {item}
                </p>
              ))}
            </Reveal>

            <Reveal delay={240}>
              <p className="text-body-sm text-fg-subtle mt-6">
                <span className="text-label text-fg-subtle uppercase">Who it&rsquo;s for — </span>
                {service.whoFor}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <Link href={service.ctaHref} className={cn(buttonVariants({ size: "lg" }), "mt-8 gap-2")}>
                {service.ctaLabel}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
