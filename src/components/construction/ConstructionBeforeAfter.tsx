"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { ConstructionProgress } from "@/content/construction";

function BeforeAfterSlider({
  label,
  before,
  current,
}: {
  label: string;
  before: { src: string; alt: string };
  current: { src: string; alt: string };
}) {
  const [value, setValue] = useState(50);
  const id = useId();

  return (
    <div>
      <p className="text-label text-fg-subtle mb-4 uppercase">{label}</p>
      <div className="bg-surface relative aspect-[16/9] w-full overflow-hidden">
        <Image src={before.src} alt={before.alt} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
          <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-cover" />
        </div>

        <div
          aria-hidden
          className="absolute inset-y-0 w-px bg-white"
          style={{ left: `${value}%` }}
        />

        <span className="text-caption absolute top-4 left-4 rounded-sm bg-black/50 px-2 py-1 text-white">
          Before
        </span>
        <span className="text-caption absolute top-4 right-4 rounded-sm bg-black/50 px-2 py-1 text-white">
          Current
        </span>

        <label htmlFor={id} className="sr-only">
          {label} — drag to compare before and current
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent [&::-moz-range-thumb]:size-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-white/80 [&::-webkit-slider-thumb]:size-8 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-white/80"
        />
      </div>
    </div>
  );
}

/**
 * Native range input as the drag handle — keyboard-accessible (arrow keys
 * move it) for free, no custom pointer-event drag logic needed. Renders
 * nothing when the project has no genuine before/current image pairs.
 */
export function ConstructionBeforeAfter({ progress }: { progress: ConstructionProgress }) {
  const pairs = progress.beforeAfter ?? [];
  if (pairs.length === 0) return null;

  return (
    <Section spacing="lg">
      <Container>
        <Reveal as="p" className="text-label text-fg-subtle mb-10 uppercase">
          Before &amp; Current
        </Reveal>
        <div className="flex flex-col gap-16">
          {pairs.map((pair, i) => (
            <Reveal key={pair.label} delay={i * 80}>
              <BeforeAfterSlider label={pair.label} before={pair.before} current={pair.current} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
