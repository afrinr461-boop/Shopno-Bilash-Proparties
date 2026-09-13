"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrustEmblem } from "@/components/ui/TrustEmblem";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Check } from "lucide-react";
import { brandBlurb, footerGroups, footerHighlights, legalQuickLinks, socialLinks, statement } from "@/content/footer";
import { Logo } from "./Logo";

/**
 * The final architectural signature of the site: one large dark statement
 * band (echoing the Hero/Bridge/PartnershipHero dark family one last
 * time), then a calm, minimal nav on the usual light surface tone, then a
 * quiet legal/copyright bar. Only routes that actually resolve are listed
 * (content/footer.ts) — no dead links. `socialLinks` stays empty (and this
 * renders nothing for it) until real, verified company accounts exist.
 * The dark statement band is skipped on pages that already end on their
 * own dark full-bleed moment right above the footer (`/founder`'s
 * `FounderStatement`, `/services`'s `ServicesEnquiryCTA`) — a second dark
 * band immediately after read as one dark section too many, back to back.
 */
const HIDE_STATEMENT_BAND_ON = new Set(["/founder", "/services"]);

export function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  // Strip a trailing slash before matching — an internal `<Link>` never
  // produces one, but a bookmarked/externally-linked "/founder/" shouldn't
  // fall through to showing the dark band this set exists to prevent.
  const normalizedPathname = (pathname ?? "").replace(/\/$/, "") || "/";
  const showStatementBand = !HIDE_STATEMENT_BAND_ON.has(normalizedPathname);

  return (
    <footer>
      {showStatementBand && (
        <section className="bg-fg relative overflow-hidden py-20 sm:py-28 lg:py-32">
          <TrustEmblem
            fit="cover"
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-[72%] w-full -translate-y-1/2 text-white/10 sm:block"
          />
          <Container className="relative">
            <Reveal>
              <p className="text-display-l max-w-3xl text-balance text-white">{statement}</p>
            </Reveal>
          </Container>
        </section>
      )}

      <Section spacing="sm" background="surface">
        <Container>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <Reveal>
              <Logo />
              <p className="text-body-sm text-fg-subtle mt-4 max-w-xs">{brandBlurb}</p>
              <ul className="mt-6 flex flex-col gap-3">
                {footerHighlights.map((highlight) => (
                  <li key={highlight} className="text-body-sm text-fg-muted flex items-start gap-2.5">
                    <Check aria-hidden className="text-accent mt-0.5 size-4 shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
              {socialLinks.length > 0 && (
                <ul className="mt-6 flex items-center gap-4">
                  {socialLinks.map((social) => (
                    <li key={social.href}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-sm text-fg-subtle hover:text-fg transition-colors"
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>

            {footerGroups.map((group, i) => (
              <Reveal key={group.title} delay={(i + 1) * 60}>
                <p className="text-label text-fg-subtle mb-4 uppercase">{group.title}</p>
                <ul className="flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-body-sm text-fg-muted hover:text-fg transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <div className="border-border mt-16 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption text-fg-subtle">
              © {year} Shopno Bilash Properties Ltd. All rights reserved.
            </p>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {legalQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-caption text-fg-subtle hover:text-fg transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    </footer>
  );
}
