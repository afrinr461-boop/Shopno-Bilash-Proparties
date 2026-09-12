Header, footer, mobile menu drawer, language switcher — built on ui/Button, ui/Container.

Implemented so far:
- `SidebarShell` — shared shell for portal/admin sidebars, permission-filtered.
- `Header` / `DesktopNav` / `MobileNav` / `NavigationGroup` / `MenuButton` / `Logo` — public site header (Step 3). `Header`'s transparent-vs-solid treatment is driven by `HeaderVariantContext`, not a prop, so a future full-bleed hero page can request the "overlay" look via `usePageHeaderVariant("overlay")` without the header hard-coding per-route logic.
- `PageContent` — the `<main>` wrapper `(public)/layout.tsx` uses; reserves space under the fixed header and applies the route-change entrance transition.
- `Footer` — structural foundation only (brand/nav columns + legal bar). Real content (offices, licenses, social, newsletter) is a later task.
- `Breadcrumbs` — minimal, for deep pages only, not used on the homepage.

Not yet built: language switcher.
