import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import type { ConstructionProgress } from "@/content/construction";

/**
 * The strongest section on the page, per the brief — one large photograph
 * per update with date/phase and a short note, alternating sides for
 * rhythm. Not a tiny thumbnail grid. Omits itself with no updates.
 */
export function ConstructionJournal({ progress }: { progress: ConstructionProgress }) {
  const updates = progress.updates;
  if (updates.length === 0) return null;

  return (
    <Section spacing="lg" background="surface">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-14 uppercase">
          Progress Journal
        </Reveal>

        <div className="flex flex-col gap-20 lg:gap-28">
          {updates.map((update, i) => {
            const image = update.images[0];
            const reverse = i % 2 === 1;
            return (
              <div
                key={`${update.date}-${update.title}`}
                className={cn(
                  "grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10",
                )}
              >
                {image && (
                  <Reveal className={cn("lg:col-span-7", reverse && "lg:order-2")}>
                    <Media
                      ratio="wide"
                      radius="md"
                      src={image.src}
                      alt={image.alt}
                      sizes="(min-width: 1024px) 58vw, 100vw"
                    />
                  </Reveal>
                )}
                <Reveal
                  delay={100}
                  className={cn(image ? "lg:col-span-5" : "lg:col-span-12", reverse && "lg:order-1")}
                >
                  <p className="text-label text-fg-subtle uppercase">
                    {update.date} · {update.phase}
                  </p>
                  <h3 className="text-h2 mt-3">{update.title}</h3>
                  <p className="text-body text-fg-muted mt-4 max-w-md">{update.description}</p>
                  {update.progress !== undefined && (
                    <p className="text-numeric text-accent mt-4">{update.progress}% complete</p>
                  )}
                </Reveal>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
