"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { NEWS_CATEGORIES, type NewsArticle } from "@/content/news";

/**
 * Deliberately mixed: one large image-led story, then a compact text-led
 * list — not a repeated grid of identical cards. A simple category filter,
 * kept minimal per the brief.
 */
export function StoryDiscovery({ articles }: { articles: NewsArticle[] }) {
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...NEWS_CATEGORIES.filter((c) => articles.some((a) => a.category === c))],
    [articles],
  );
  const filtered = useMemo(
    () => (category === "All" ? articles : articles.filter((a) => a.category === category)),
    [articles, category],
  );

  if (articles.length === 0) return null;

  const [lead, ...rest] = filtered;

  return (
    <Section spacing="md" background="surface">
      <Container>
        {categories.length > 2 && (
          <div
            role="tablist"
            aria-label="Filter stories by category"
            className="mb-12 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-6"
          >
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={cn(
                  "text-nav pb-1 transition-colors duration-150",
                  category === c ? "text-fg border-fg border-b-2" : "text-fg-subtle hover:text-fg",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-body text-fg-muted">No stories in this category yet.</p>
        ) : (
          <>
            {lead && (
              <Reveal>
                <Link
                  href={`/news/${lead.slug}`}
                  className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10"
                >
                  <Media
                    ratio="standard"
                    radius="md"
                    src={lead.coverImage.src}
                    alt={lead.coverImage.alt}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="transition-transform duration-500 ease-[var(--ease-standard)] group-hover:scale-105 lg:col-span-7"
                  />
                  <div className="lg:col-span-5">
                    <p className="text-label text-fg-subtle uppercase">
                      {lead.category} · {lead.date}
                    </p>
                    <h2 className="text-h1 mt-3 group-hover:text-accent transition-colors duration-200">
                      {lead.title}
                    </h2>
                    <p className="text-body text-fg-muted mt-3 max-w-md">{lead.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            )}

            {rest.length > 0 && (
              <div className="mt-16">
                <Divider />
                {rest.map((article, i) => (
                  <Reveal key={article.id} delay={i * 50}>
                    <Link
                      href={`/news/${article.slug}`}
                      className="group flex items-center justify-between gap-6 py-6 transition-[padding] duration-300 ease-[var(--ease-standard)] hover:pl-3"
                    >
                      <span>
                        <span className="text-label text-fg-subtle uppercase">
                          {article.category} · {article.date}
                        </span>
                        <span className="text-h3 mt-1 block transition-colors duration-200 group-hover:text-accent">
                          {article.title}
                        </span>
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="text-fg-subtle size-5 shrink-0 transition-transform duration-200 ease-[var(--ease-standard)] group-hover:translate-x-1 group-hover:text-accent"
                      />
                    </Link>
                    <Divider />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  );
}
