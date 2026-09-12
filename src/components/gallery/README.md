Gallery experience — `/gallery`. Data: `src/content/gallery.ts` (`GalleryItem`, linked to a project via `projectSlug`).

**Step 13**: `GalleryIntro` (large layered editorial intro, same treatment as the Projects page), `GalleryExplorer` (client — category tabs, asymmetric grid, opens the shared `ui/Lightbox` with a caption + "View Project" link per image). Empty state ("More photography is coming") built in, currently masked by ⚠ demo data in `content/gallery.ts`.

`ui/Lightbox.tsx` was extended in this step to support an optional `caption`/`meta` per image, used here and available to any other gallery.
