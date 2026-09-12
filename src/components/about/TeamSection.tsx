import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { team } from "@/content/about";

/**
 * Not rendered on the live page yet — `content/about.ts`'s `team` array is
 * empty because no real leadership bios exist, and this page will never
 * show invented names. Fully built and ready: once real people are added
 * to that array, render <TeamSection /> from the About page and this
 * works with no further changes.
 */
export function TeamSection() {
  if (team.length === 0) return null;

  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-12 uppercase">
          Leadership
        </Reveal>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <Reveal key={member.name} delay={i * 60}>
              {member.photo && (
                <div className="bg-surface relative mb-5 aspect-[4/5] w-full overflow-hidden rounded-md">
                  <Image
                    src={member.photo.src}
                    alt={member.photo.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
              )}
              <h3 className="text-h4">{member.name}</h3>
              <p className="text-label text-accent mt-1 mb-3 uppercase">{member.role}</p>
              <p className="text-body-sm text-fg-muted">{member.bio}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
