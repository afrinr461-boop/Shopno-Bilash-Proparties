News / Updates experience — `/news` (landing) and `/news/[slug]` (article). Data: `src/content/news.ts` (`NewsArticle`, linked to a project via `projectSlug`). Nav item renamed from "Insights" to "News" in this step.

**Step 13**: `FeaturedStory` (the dominant top story — large image, never a card), `StoryDiscovery` (one large image-led story + a compact text-led list, with a minimal category filter — deliberately not a repeated card grid). The article detail page is built directly in `app/(public)/news/[slug]/page.tsx` (header, content paragraphs, article images, related project link, related stories, back-to-News).

⚠ `content/news.ts` currently holds demo articles — every date/figure in them mirrors the same demo data already used elsewhere (Meridian Residences' construction progress, etc.), never invented separately. Empty the array for an honest "more stories are coming" empty state.
