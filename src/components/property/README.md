Unit/property components — the individual sellable item inside a project (an apartment, a house, a commercial unit, …). Data model: `src/content/units.ts` (`Unit`), same lean-public-shape philosophy as `content/projects.ts`.

**Step 10**: the Unit Details page (`app/(public)/projects/[slug]/units/[unitSlug]/page.tsx`) — `UnitHero` (text-above-image, deliberately different from the Project Hero's full-bleed overlay), `UnitSpecifications` (spec-sheet, only existing fields), `UnitFloorPlan` (own section, full-screen viewable via the shared `ui/Lightbox`, omits itself with no floor plan), `UnitDescription`, `UnitProjectContext` (links back to the parent project without duplicating its page), `UnitAvailabilityPrice` (price only shown when it exists), `UnitEnquiryCTA`, `UnitRelated` (editorial link-list to other units in the same project), `UnitStatusTag` (dot + label, same restrained treatment as `ProjectStatus`).

The Project Details page cross-links here too: `ProjectStatusAndAvailability` accepts a `units` prop and lists real unit links (from `content/units.ts`, filtered by `projectSlug`) when any exist for that project.

`content/units.ts`'s `units` array is empty on purpose — same honesty policy as `projects`: no real units are published yet, so every unit route 404s rather than showing invented properties. Fully built and verified (all fields, floor-plan lightbox, graceful omission of missing sections, related-units list, mobile) against temporary sample data before being reverted to empty — see Step 10's report.

Not yet built: the full Property Explorer/listing page, booking/payment, customer accounts.
