# Shopno Bilash Properties

Digital platform for Shopno Bilash Properties — real estate development, property sales, and landowner joint-venture management.

This repository currently contains the **brand/design-system foundation** ([DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)) and the **platform architecture** ([ARCHITECTURE.md](./ARCHITECTURE.md)) — sitemap, roles/permissions, domain types, and the public/portal/admin route boundaries. Most pages are still placeholders; both documents are what future feature work builds on.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 (CSS-first `@theme` tokens, see `src/app/globals.css`)
- `next/font` — Manrope (display/headings), Inter (body/UI/numeric), Noto Sans Bengali (Bangla)
- `lucide-react` for iconography
- `clsx` + `tailwind-merge` for class composition (`src/lib/utils.ts`)

## Getting started

```bash
npm run dev
```

Open http://localhost:3000.

## Structure

See [ARCHITECTURE.md §12](./ARCHITECTURE.md#12-folder-structure) for the full annotated tree (`app/(public)`, `app/portal`, `app/admin`, `features/`, `services/`, `hooks/`, `types/`, `config/`). Quick orientation:

```
src/
  app/                Routes (App Router) — (public)/, login/, portal/, admin/, api/
  components/         Presentation only. ui/ (Prompt 01) + navigation/ + feedback/ built so far.
  features/           Per-domain business logic (not presentation) — placeholders only so far.
  types/              Domain types — the database entity proposal (ARCHITECTURE.md §9)
  config/             roles.ts, permissions.ts, navigation.ts
  lib/
    auth.ts           getCurrentUser() — session extension point, always signed-out for now
    permissions.ts    hasPermission() — the one place a permission is ever checked
    utils.ts, format.ts, status.ts, i18n.ts   (Prompt 01)
  locales/            en/, bn/ i18n dictionary scaffolding
```

## Design tokens

All colors, typography, spacing, radius, shadow, and container tokens are centralized as CSS custom properties in `src/app/globals.css`, mapped into Tailwind's theme via `@theme`. Never hardcode colors, fonts, or spacing values in components — use the tokens (Tailwind utility classes backed by these variables).
