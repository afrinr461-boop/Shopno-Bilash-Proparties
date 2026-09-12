ProjectCard and related development-listing/detail components.

- **Step 7**: `ProjectCard` — one flexible component, four variants (`featured` / `editorial` / `horizontal` / `minimal`), sharing the `Project` data shape (`src/content/projects.ts`) and hover/tap interaction. `ProjectStatus` — the deliberately subtle dot + label status treatment (not the loud admin `StatusBadge`).
- **Step 8**: `ProjectFilters` / `ProjectResults` — client-side search + Type/Status/City filtering with URL state, used on `app/(public)/projects/page.tsx`.
- **Step 8 redesign**: `ProjectsIntro`, `ProjectsBridge`, `ProjectsEmptyState` — the /projects page shell (editorial split intro, full-bleed dark statement, asymmetric empty state).
- **Step 9**: the Project Details page (`app/(public)/projects/[slug]/page.tsx`) — `ProjectHero`, `ProjectIntroduction`, `ProjectFacts`, `ProjectDesignStory`, `ProjectLocation`, `ProjectGallery` (asymmetric grid + keyboard-navigable lightbox), `ProjectStatusAndAvailability`, `ProjectEnquiryCTA`.

`content/projects.ts`'s `projects` array is empty on purpose — no real developments are published yet, so `/projects` shows an honest "catalog being prepared" state and `/projects/[slug]` 404s for any slug (there being none to link to). Every component above was built and visually/functionally verified against temporary sample data (covering every optional field, a 6-image gallery, lightbox keyboard nav, mobile) before being reverted to empty — see the Step 7/8/9 reports for details.

Not yet built: full Unit/Property explorer (Step 10), Construction Progress system (Step 11).
