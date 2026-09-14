import { Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import type { FounderProfile } from "@/types/founderProfile";

export interface FounderStatementProps {
  profile: FounderProfile;
}

/**
 * The page's dedicated highlight moment — a large editorial quote on the
 * dark family of sections (same `bg-fg` charcoal treatment as `Footer`/
 * `ProjectsBridge`), a deliberate rhythm break either side of the lighter
 * Story/Vision sections. The portrait doubles as a heavily-darkened
 * backdrop when one exists (never a second invented image) — texture, not
 * a repeat of the hero. Only renders when a real statement has been
 * entered.
 */
export function FounderStatement({ profile }: FounderStatementProps) {
  if (!profile.statement) return null;

  return (
    <section data-header-tone="dark" className="bg-fg relative overflow-hidden py-24 sm:py-32">
      {profile.photo && (
        <>
          <Media
            ratio="auto"
            src={profile.photo}
            alt=""
            containerClassName="absolute inset-0 h-full w-full"
            sizes="100vw"
            className="opacity-25 grayscale"
          />
          <div aria-hidden className="bg-fg/85 absolute inset-0" />
        </>
      )}

      <Container size="narrow" className="relative">
        <Reveal>
          <Quote aria-hidden className="text-premium mb-8 size-10" strokeWidth={1.5} />
        </Reveal>
        <Reveal delay={80}>
          <p className="text-display-l text-balance whitespace-pre-line text-white">{profile.statement}</p>
        </Reveal>
        <Reveal delay={180}>
          <p className="text-label mt-10 text-white/60 uppercase">
            {profile.name} · {profile.title}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
