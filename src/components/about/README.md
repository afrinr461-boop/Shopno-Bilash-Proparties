About-page sections (not reused by other routes). Content/copy lives in `src/content/about.ts`, same pattern as `content/home.ts`, so it can later become Admin-managed without touching these components.

Implemented (in page order): `Intro`, `OurStory`, `Vision`, `Process`, `Values`, `Expertise`, `Impact` (Step 6).

`TeamSection` is fully built but intentionally **not** rendered on the page yet — `content/about.ts`'s `team` array is empty (no real leadership bios exist), and this page never shows invented people. Add real entries to `team` and render `<TeamSection />` from `about/page.tsx` when that data exists.

`Closing` is the final CTA section, also Step 6.
