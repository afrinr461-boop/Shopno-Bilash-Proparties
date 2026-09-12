# Shopno Bilash Properties — Platform Architecture

Status: **architecture phase**. This document, plus the domain types (`src/types/`), permission/navigation config (`src/config/`), and the route-boundary scaffolding under `src/app/`, are the deliverable. Most pages are still placeholders — implementation is later work. Builds on [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md); nothing here introduces new colors, fonts, or components outside that system.

No real financial records, customers, or shareholders exist anywhere in this codebase. `getCurrentUser()` (`src/lib/auth.ts`) always resolves to signed-out, so every authenticated route currently renders its genuine "not signed in" state rather than a faked one.

---

## 1. Product architecture — three layers

```
LAYER A — Public Website        (src/app/(public)/...)     no auth
LAYER B — Authenticated Portal  (src/app/portal/...)        customer | shareholder | landowner
LAYER C — Admin Platform        (src/app/admin/...)         staff roles only
```

A single `/login` is the shared entry point for all three portal roles and staff — the route the user lands on after signing in depends on their role, not on which login form they used. See §3 for how each layer's layout enforces its own boundary.

---

## 2. Complete sitemap / route map

Legend: ✅ scaffolded (layout + placeholder page exists and builds) · 📋 documented only (not yet created).

### Public website (Layer A)

| Route | Status |
|---|---|
| `/` | ✅ (design-system scratch page, not the real Home) |
| `/about` | 📋 |
| `/projects`, `/projects/[project-slug]` | 📋 |
| `/properties`, `/properties/[property-slug]` | 📋 |
| `/services`, `/services/[service-slug]` | 📋 |
| `/landowners`, `/landowners/partnership`, `/landowners/submit-property` | 📋 |
| `/insights`, `/insights/[article-slug]` | 📋 |
| `/gallery` | 📋 |
| `/contact` | 📋 |
| `/careers` | 📋 |
| `/faq` | 📋 |
| `/privacy`, `/terms` | 📋 |
| `/login` | ✅ (form UI only, not connected) |
| `/forgot-password`, `/reset-password`, `/verify-account` | 📋 |

### Customer portal (Layer B)

| Route | Status |
|---|---|
| `/portal` | ✅ (auth-gated shell + overview placeholder) |
| `/portal/profile`, `/portal/settings` | 📋 |
| `/portal/projects`, `/portal/projects/[project-id]` | 📋 |
| `/portal/units` | 📋 |
| `/portal/payments`, `/portal/payment-history` | 📋 |
| `/portal/documents` | 📋 |
| `/portal/construction-updates` | 📋 |
| `/portal/notifications` | 📋 |
| `/portal/support` | 📋 |

### Shareholder portal

| Route | Status |
|---|---|
| `/portal/shareholder` | ✅ (overview placeholder) |
| `/portal/shareholder/projects`, `/portal/shareholder/projects/[project-id]` | 📋 |
| `/portal/shareholder/units` | 📋 |
| `/portal/shareholder/contributions` | 📋 |
| `/portal/shareholder/payments` | 📋 |
| `/portal/shareholder/project-financials` | 📋 |
| `/portal/shareholder/documents` | 📋 |
| `/portal/shareholder/updates` | 📋 |
| `/portal/shareholder/reports` | 📋 |

### Landowner portal

| Route | Status |
|---|---|
| `/portal/landowner` | ✅ (overview placeholder) |
| `/portal/landowner/properties` | 📋 |
| `/portal/landowner/proposals` | 📋 |
| `/portal/landowner/agreements` | 📋 |
| `/portal/landowner/projects` | 📋 |
| `/portal/landowner/allocations` | 📋 |
| `/portal/landowner/documents` | 📋 |
| `/portal/landowner/payments` | 📋 |
| `/portal/landowner/updates` | 📋 |
| `/portal/landowner/support` | 📋 |

### Admin platform (Layer C)

| Area | Routes | Status |
|---|---|---|
| Overview | `/admin`, `/admin/overview` | ✅ (`/admin` placeholder; `/admin/overview` not yet aliased) |
| Projects | `/admin/projects`, `/new`, `/[id]`, `/[id]/overview\|units\|floors\|construction\|expenses\|procurement\|sales\|shareholders\|documents\|reports` | 📋 |
| Properties | `/admin/properties`, `/new`, `/[id]` | 📋 |
| Units | `/admin/units`, `/[id]` | 📋 |
| Customers | `/admin/customers`, `/[id]` | 📋 |
| CRM | `/admin/leads`, `/[id]`, `/admin/follow-ups`, `/admin/site-visits` | 📋 |
| Sales | `/admin/sales`, `/bookings`, `/reservations`, `/contracts`, `/installments` | 📋 |
| Finance | `/admin/finance`, `/income`, `/expenses`, `/payments`, `/receivables`, `/payables`, `/project-costs`, `/reports` | 📋 |
| Procurement | `/admin/procurement`, `/purchases`, `/purchase-orders`, `/vendors`, `/invoices` | 📋 |
| Construction | `/admin/construction`, `/progress`, `/milestones`, `/tasks`, `/materials` | 📋 |
| Documents | `/admin/documents`, `/admin/document-templates` | 📋 |
| Users | `/admin/users`, `/admin/roles`, `/admin/permissions` | 📋 |
| Settings | `/admin/settings`, `/company`, `/branding`, `/notifications`, `/localization` | 📋 |

Every 📋 route above is committed to as the eventual URL structure — implement it under its documented path rather than improvising a different one.

---

## 3. Public / Portal / Admin separation

Each layer's boundary is a **layout**, not a convention developers have to remember:

- `src/app/(public)/layout.tsx` — a route group (no URL segment). Thin passthrough today; will host the shared header/footer.
- `src/app/portal/layout.tsx` — calls `getCurrentUser()`. No user → renders `PermissionDeniedState` (nothing under `/portal/*` renders). Signed in → picks the sidebar for the user's actual role (customer/shareholder/landowner) via `SidebarShell`.
- `src/app/admin/layout.tsx` — same pattern, but additionally requires `STAFF_ROLES.includes(user.role)` — a customer/shareholder/landowner account authenticated elsewhere still cannot reach `/admin/*`.

Because the gate lives in the layout, every current and future page under `/portal/*` or `/admin/*` inherits it automatically — a new page cannot accidentally ship without the check.

---

## 4. User-role matrix

| # | Role | Layer | Notes |
|---|---|---|---|
| 1 | Super Admin | C | Full permission set (`ROLE_PERMISSIONS.super_admin` = all) |
| 2 | Managing Director / Owner | C | Full set except `roles.manage` / `permissions.manage` |
| 3 | Finance Manager | C | Finance + reports + read access to project/unit/customer |
| 4 | Project Manager | C | Project + unit + construction management |
| 5 | Sales Manager | C | Leads, sales, customers, properties |
| 6 | Sales Executive | C | Same domains as Sales Manager, narrower (no property create beyond viewing existing) |
| 7 | Procurement Manager | C | Procurement + project read |
| 8 | Construction Manager | C | Construction + project/unit read |
| 9 | Document / Legal Manager | C | Documents across project/customer/shareholder/landowner |
| 10 | Customer | B | `/portal/*` — own units/payments/documents only |
| 11 | Shareholder | B | `/portal/shareholder/*` — own shareholdings only |
| 12 | Landowner | B | `/portal/landowner/*` — own agreements only |

Defined in [`src/config/roles.ts`](./src/config/roles.ts). Adding a 13th role means adding one entry there plus one entry in `ROLE_PERMISSIONS` — no component changes required.

---

## 5. Permission architecture

Permission identifiers (`domain.action`) live in [`src/config/permissions.ts`](./src/config/permissions.ts), grouped by domain:

`project` · `property` · `unit` · `customer` · `lead` · `sales` · `finance` · `shareholder` · `landowner` · `procurement` · `construction` · `documents` · `reports` · `users` · `roles` · `permissions` · `settings` · `audit`

Each domain has `view`/`create`/`update`/`delete`/`manage`/`export` actions as appropriate (see the file for the exact list — e.g. `finance.view`, `finance.manage`, `finance.export`). `ROLE_PERMISSIONS` maps every role to its permission set, and the module throws at import time if a role is ever left out of the matrix.

**Centralized check:** [`src/lib/permissions.ts`](./src/lib/permissions.ts) exports `hasPermission(role, permission)` — the only place a permission is ever evaluated. UI components (`SidebarShell`) and API route handlers (`/api/admin/projects`) both call it; neither hardcodes a role name.

**Important limit:** role → permission answers *"can this role ever see this kind of data"*, not *"can this specific user see this specific record."* Record-level scoping (a shareholder's own `Shareholding`, a customer's own `Unit`) is a second, separate check the API layer must still perform — see §13.

---

## 6. Major entity / domain map

| Domain | Entities | Types file |
|---|---|---|
| Identity | User | `types/user.ts` |
| Project | Project, Building, Floor | `types/project.ts` |
| Unit | Unit | `types/unit.ts` |
| Property (standalone listings) | Property | `types/property.ts` |
| Customer | Customer | `types/customer.ts` |
| CRM | Lead, LeadActivity | `types/crm.ts` |
| Shareholder | Shareholder, Shareholding | `types/shareholder.ts` |
| Landowner | Landowner, Agreement, LandownerAllocation | `types/landowner.ts` |
| Sales | Booking, Sale, Contract, Installment | `types/sales.ts` |
| Finance — Project | ProjectBudget, ProjectExpense | `types/finance/project.ts` |
| Finance — Customer | CustomerPayment, CustomerInvoice, CustomerReceivable | `types/finance/customer.ts` |
| Finance — Shareholder | ShareholderContribution, ShareholderPayment | `types/finance/shareholder.ts` |
| Finance — Company | CompanyIncome, CompanyExpense, CompanyAdjustment | `types/finance/company.ts` |
| Procurement | Vendor, MaterialCategory, Material, PurchaseOrder, Purchase | `types/procurement.ts` |
| Construction | ConstructionPhase, ConstructionTask | `types/construction.ts` |
| Documents | Document | `types/document.ts` |
| Notifications | Notification, NotificationProvider | `types/notification.ts` |
| Audit | AuditLog | `types/audit-log.ts` |

These TypeScript interfaces **are** the database entity proposal for this phase (deliverable #9) — precise or field-level DB/ORM decisions (Postgres schema, migrations) are left for the implementation phase so this stays reviewable as plain types rather than tied to one ORM's syntax. Key relationships:

- `Project 1—N Building 1—N Floor 1—N Unit`
- `Unit N—1 Customer` (sold/booked) **or** `Unit N—1 Shareholder` (via `Shareholding.allocatedUnitIds`) **or** `Unit N—1 LandownerAllocation` — mutually exclusive per unit at a given time
- `Shareholder 1—N Shareholding N—1 Project`
- `Landowner 1—N Agreement`, `Agreement 1—N LandownerAllocation N—1 Unit`
- `Lead N—1 Project` (interested), `Lead N—1 Unit` (interested), `Lead N—1 User` (assigned salesperson)
- `Booking/Sale/Contract N—1 Unit`, `Contract 1—N Installment`
- Every finance record carries an optional `projectId` (scoping) and required `date`/`amount`/`category`/audit fields — never a shared generic "transactions" table across the four finance domains (§11 of the brief; enforced today only by keeping them separate TypeScript hierarchies under `types/finance/`)
- `PurchaseOrder N—1 Vendor`, `PurchaseOrder 1—N PurchaseOrderLine N—1 Material N—1 MaterialCategory`
- `ConstructionPhase N—1 Project`, `ConstructionPhase 1—N ConstructionTask`
- `Document` polymorphically owned via `ownerType` + `ownerId` (Company/Project/Unit/Customer/Shareholder/Landowner/Vendor/Transaction)
- `AuditLog` references any entity via `entityType` + `entityId`, append-only

Avoid one giant table: each domain above is its own entity family with its own foreign keys — nothing is modeled as a single generic "record" table with a type discriminator.

---

## 7. Data visibility classification

| Class | Examples | Enforcement today |
|---|---|---|
| **Public** | Project name/location/public images, published Property listings | `Project.isPublished` / `Property.isPublished`; `/api/public/*` only ever queries published rows |
| **Private** | Customer payment history, customer documents, customer PII (`Customer.nidOrPassportNumber`) | `/api/portal/*` requires `getCurrentUser()`; record-level scoping still required (§13) |
| **Internal** | Company expenses, vendor pricing, internal project costing (`ProjectBudget`, `Purchase.total`) | `/api/admin/*` requires `hasPermission(role, "finance.view"/"procurement.view")` |
| **Restricted** | Shareholder financial data, sensitive legal documents, user/role/permission management | Requires `shareholder.view`/`documents.view` **plus** record ownership, or `users.manage`/`roles.manage` (super admin only for the latter two) |

`Document.visibility` and the conceptual `DataVisibility` type (`types/common.ts`) exist so a future serializer can assert "this field/record may only leave the server for a caller cleared to this level" — this is a server-side contract, never a frontend `if`.

---

## 8. API boundary proposal

Three boundaries, matching the three layers. Representative handlers are implemented; the rest are documented paths to implement the same way.

| Boundary | Example (implemented) | Auth | Other planned endpoints |
|---|---|---|---|
| `/api/public/*` | `GET /api/public/projects` ✅ | none | `/api/public/properties` |
| `/api/portal/*` | `GET /api/portal/me` ✅ (401 if signed out) | session required | `/api/portal/projects`, `/api/portal/payments`, `/api/portal/documents` |
| `/api/admin/*` | `GET /api/admin/projects` ✅ (401 signed out / 403 missing permission) | session + permission | `/api/admin/units`, `/api/admin/finance`, `/api/admin/procurement`, … |

Pattern every handler follows: **authenticate → authorize → act**. Authorization is always `hasPermission()` (plus record-scoping where relevant) evaluated inside the handler — never inferred from which button was clicked in the UI.

---

## 9. Database entity proposal

See §6 for the entity list and relationships. No ORM/schema file is introduced this phase — the `src/types/*.ts` interfaces are the reviewable proposal. When implementation starts, these interfaces should map close to 1:1 onto whatever ORM/schema is chosen, so the choice of ORM doesn't need to re-derive the data model from scratch.

---

## 10. Navigation architecture

Defined in [`src/config/navigation.ts`](./src/config/navigation.ts):

- `PUBLIC_NAV` + `PUBLIC_PRIMARY_CTA` ("Explore Projects") — public header
- `PORTAL_NAV` — customer sidebar (Overview, My Projects, My Units, Payments, Documents, Construction Updates, Notifications, Support, Profile, Settings)
- `SHAREHOLDER_NAV` — shareholder sidebar
- `LANDOWNER_NAV` — landowner sidebar
- `ADMIN_NAV` — admin sidebar, every item beyond Overview gated by a permission (e.g. Finance requires `finance.view`)

`SidebarShell` (`src/components/navigation/SidebarShell.tsx`) renders whichever nav array it's given and filters out any item whose `permission` the current role lacks. Collapsible/mobile-drawer behavior is not built yet — flagged in the component's README, matching Prompt 01's "not yet implemented" convention.

---

## 11. Component / layout architecture

New this phase, on top of Prompt 01's `components/ui/*`:

| Component | Purpose |
|---|---|
| `components/navigation/SidebarShell` | Shared authenticated-area shell (see §10) |
| `components/feedback/EmptyState` | "No X found." |
| `components/feedback/ErrorState` | Generic failure state |
| `components/feedback/PermissionDeniedState` | "You don't have permission to view this information." |
| `components/feedback/LoadingState` | Spinner + label |
| `components/feedback/Alert` | Inline success/warning/error/info banner |

These five feedback components are the concrete answer to §12 (Error + Empty States): every future list/detail page should reach for one of them rather than inventing a new blank-screen behavior.

---

## 12. Folder structure

```
src/
  app/
    (public)/            Layer A — layout.tsx (thin) + page.tsx (home placeholder)
    login/
    portal/              Layer B — layout.tsx (auth gate + role-based sidebar)
      shareholder/
      landowner/
    admin/               Layer C — layout.tsx (auth + staff-role gate)
    api/
      public/projects/
      portal/me/
      admin/projects/
  components/
    ui/                  Prompt 01 primitives (Button, Card, Input, Badge, Container)
    navigation/          SidebarShell
    feedback/            EmptyState, ErrorState, PermissionDeniedState, LoadingState, Alert
    forms/ property/ project/ dashboard/ finance/ documents/ charts/   (Prompt 01 — still placeholders)
  features/              Business logic per domain (NOT presentation — that's components/*)
    projects/ properties/ units/ customers/ crm/ sales/ finance/
    procurement/ construction/ documents/ notifications/ users/       (all placeholders — READMEs only)
  services/               Typed API client wrappers (placeholder)
  hooks/                  Cross-cutting hooks (placeholder)
  types/                  Domain types — see §6
  config/
    roles.ts              RoleName, ROLES, ROLE_LABELS, STAFF_ROLES, PORTAL_ROLES
    permissions.ts         PERMISSIONS, ROLE_PERMISSIONS, ALL_PERMISSIONS
    navigation.ts          PUBLIC_NAV / PORTAL_NAV / SHAREHOLDER_NAV / LANDOWNER_NAV / ADMIN_NAV
  lib/
    auth.ts                getCurrentUser() — session extension point
    permissions.ts          hasPermission / hasAnyPermission / hasAllPermissions
    format.ts, status.ts, i18n.ts, utils.ts   (Prompt 01)
  locales/                 (Prompt 01)
```

`components/<domain>` (presentation) and `features/<domain>` (logic) intentionally overlap in name — this is deliberate ("keep business logic separate from presentation," development rule §5), not duplication. A `ProjectCard` lives in `components/project/`; the hook that fetches the data it renders will live in `features/projects/`.

`styles/` from the brief's suggested tree is intentionally omitted — Prompt 01 already centralized all tokens in `src/app/globals.css`, and a second styles directory would just split the source of truth.

---

## 13. Security architecture

| Concern | Status |
|---|---|
| Authentication | Extension point only — `src/lib/auth.ts:getCurrentUser()` always returns `null`. Swap in a real session provider without touching call sites. |
| Authorization / RBAC | Implemented — `hasPermission()` + `ROLE_PERMISSIONS` (§5) |
| Record-level scoping | **Not implemented — required before any real shareholder/customer data is wired up.** A shareholder's `shareholder.view` permission must still be combined with `WHERE shareholderId = currentUser.linkedShareholderId` (or equivalent) at the query layer. Documented here so it isn't dropped when the finance/shareholder features are built. |
| Session management | Deferred to whichever auth provider is chosen |
| Password handling | N/A yet — never store plaintext when implemented; use the provider's hashing |
| Rate limiting | Not implemented — extension point at the API route layer |
| Input validation | Not implemented — recommend a schema validator (e.g. zod) at every API route boundary once routes have real bodies |
| File validation / secure file access | Not implemented — `Document.fileUrl` retrieval must go through a permission check server-side, never a public bucket URL |
| CSRF | Next.js Server Actions/Route Handlers + same-site cookies once a session exists; revisit when auth lands |
| XSS | React escapes by default; avoid `dangerouslySetInnerHTML` on any user-supplied content |
| SQL injection | N/A yet (no DB layer); use parameterized queries/an ORM when added, never string-built SQL |
| Secrets management | `.env*` is git-ignored by the Next.js template default; never commit keys, never reference secrets from client components |
| Audit logs | See §14 |

**Never** (unchanged from the brief): plaintext passwords, API keys in frontend code, private financial data through `/api/public/*`.

---

## 14. Audit-log architecture

`AuditLog` (`types/audit-log.ts`) captures `actorUserId`, `action`, `entityType` + `entityId`, `previousValue`/`newValue`, `occurredAt`, optional `ipAddress`. It's modeled as append-only by convention — the type has no update/delete-oriented fields (no `updatedAt`), signaling that nothing should ever expose an edit path for it.

Domains that must write an audit entry on every mutation once implemented: **Finance, Payments, Unit status, Sales, Shareholders, Documents, Permissions.** This is a rule for the implementation phase, not something enforced by code yet (there are no mutations to audit until the domains themselves are built).

---

## 15. Responsive architecture

- **Public site** — mobile-first (unchanged from Prompt 01).
- **Portal** — responsive; `SidebarShell` already collapses its sidebar below `md` (the nav disappears rather than becoming unusable — a mobile drawer is a follow-up, noted in the component's README).
- **Admin** — desktop-first but must stay usable on tablet; dense financial tables should become horizontally-scrolling or stacked cards on narrow viewports rather than shrinking text (Prompt 01 §15/§10 — no `DataTable` exists yet to apply this to).

---

## 16. Future integration plan (extension points, not implemented)

| Integration | Extension point |
|---|---|
| Google Maps | `Project.latitude/longitude`, `Address` (`types/common.ts`) already carry the fields a map component would need |
| Payment gateway | `CustomerPayment.method` includes `"card"`/`"mobile-banking"`; gateway webhook would write a `CustomerPayment` + emit a `payment.received` notification |
| Email / SMS / WhatsApp | `NotificationProvider` interface (`types/notification.ts`) — implement one per channel, register with a dispatcher |
| Cloud storage | `Document.fileUrl` is provider-agnostic; swap the storage backend without changing the type |
| Analytics | Not modeled yet — add at the page-view layer once real pages exist |
| Accounting software / CRM integrations | Would consume the `finance/*` and `crm.ts` types as an export/sync contract |
| Digital signatures | `Contract.documentId` / `Agreement.documentIds` are where a signed artifact would attach |
| AI assistant | No extension point defined yet — out of scope until a concrete use case exists |

---

## 17. Supporting architecture notes

- **CRM pipeline** (`types/crm.ts`): New → Contacted → Qualified → Interested → Site Visit → Negotiation → Booking → Won/Lost, via `LeadStatus`.
- **Procurement categories** are data (`MaterialCategory`), not a hardcoded union — admins can add categories without a code change.
- **Construction phases** are data (`ConstructionPhase.name`/`.order` per project), not a hardcoded union — same reasoning.
- **Search** (public + admin global search) and **Reporting** (project/finance/sales/procurement/shareholder reports) are documented requirements from the brief with no code yet — both depend on real data existing first. When built: search must run permission-aware queries (never search across `/api/admin/*` data from a `/api/public/*` caller), and reports need date/project filters plus CSV/PDF export.
- **URL/SEO**: public routes use human-readable slugs (`Project.slug`, `Property.slug`) already modeled — never a raw ID in a public URL path.
- **State management**: no global store introduced. Server state will live in whatever data-fetching layer is chosen (React Query/SWR/RSC fetches); UI state (modals/drawers/filters/tabs) stays component-local; auth state is `getCurrentUser()`'s result, read once per request server-side rather than duplicated into a client store.

---

## 18. Chapter 2 — Admin Step 1 (this phase)

Chapter 1 (the full public marketing website — Home, About, Projects, Properties, Services, Construction, Landowners & JV, Gallery, News, Enquire, global search, saved properties, legal pages, footer, SEO) was built entirely under `src/app/(public)/*` in the phases between this document's original writing and now, without touching anything under this section. This phase re-audited the whole repository before adding anything, confirmed the architecture above still matches what's on disk (it does — no drift), and made exactly one addition: the data-access abstraction §9 deferred.

**What was audited and confirmed still accurate:** the three-layer route boundary (§1/§3), the 12-role/18-domain RBAC system (§4/§5, unchanged in `src/config/roles.ts` and `src/config/permissions.ts`), all 19 domain-type files under `src/types/` (§6), the three placeholder API routes (§8), `getCurrentUser()` still a genuine signed-out stub (§13), and the folder structure (§12) — all exactly as documented, nothing renamed or moved.

**What was added:**
- `src/lib/repository.ts` — a generic `Repository<T>` interface (`list`/`findById`/`create`/`update`/`remove`) plus an `InMemoryRepository<T>` implementation. This is the "data/repository abstraction" §9 said would come "when implementation starts" — it lets `src/features/*` and `src/app/api/**/route.ts` code against a stable interface now, so swapping in a real database later changes one file per domain, never the API routes or UI.
- `src/features/projects/repository.ts` — one reference implementation (`projectRepository`, an empty `InMemoryRepository<Project>`) so the other 11 `features/*` domains have a concrete pattern to copy when their turn comes, rather than each guessing independently.
- `src/app/api/admin/projects/route.ts` now calls `projectRepository.list()` instead of returning a hardcoded `projects: []` — same response shape, but the plumbing is real. `src/app/api/public/projects/route.ts` was deliberately **not** wired the same way: the internal `Project` type (`types/project.ts`) carries internal-only fields (`budget`, `ownershipStructure`, `landownerId`, `salesStatus`, …), and returning repository rows through a "public, no auth" boundary without a public-safe mapper would violate §7's own data-visibility rule. That mapper is a follow-up decision, not a Step 1 item — see Remaining Decisions below.

**Data-layer recommendation (§19 of the Chapter 2 brief — a recommendation, not implemented):** PostgreSQL, accessed via Prisma. Reasoning: the domain model (§6) is relational with real referential integrity needs (`Unit.projectId`, `Sale.customerId`, `Installment` chains, finance records that must never silently orphan), which is exactly Postgres/an ORM's strength over a document store; Prisma's generated types map closely to the existing hand-written interfaces in `src/types/`, so migrating is closer to "add `@prisma/client` and swap each feature's repository implementation" than "redesign the data model." File storage, when `Document.fileUrl` needs a real backend: an S3-compatible bucket (AWS S3 or Cloudflare R2) — `fileUrl` is already provider-agnostic (§16). Auth, when `getCurrentUser()` is implemented for real: a session-cookie-based provider (Auth.js/NextAuth or a hand-rolled equivalent) backed by the same Postgres database, since staff + three portal roles all need first-party credentialed sign-in, not just OAuth.

**Remaining decisions (unresolved, intentionally deferred):**
- Exact ORM/schema migration strategy (Prisma schema authoring, initial migration) — deferred until a real environment/database exists to point it at.
- The public-safe serialization mapper for `Project`/`Property`/etc. (internal type → public API shape) needed before `/api/public/*` can be backed by the same repositories as `/api/admin/*`.
- Session/auth provider choice is a recommendation only (above) — no library was added to `package.json` this phase.
- Record-level scoping (§13) is still not implemented — still correctly blocked on real auth existing first.

---

## 19. Chapter 2 — Admin Step 2 (shell + design system)

Added `src/components/admin/{AdminShell,AdminSidebar,AdminMobileSidebar,AdminSidebarNav,AdminHeader,AdminPageHeader}` — a dedicated shell for `/admin/*` (grouped, collapsible sidebar; header with a disabled search/notification/user-menu shell; the reusable per-page `AdminPageHeader`). `SidebarShell` (§10/§11) is unchanged and still backs `/portal/*`. No new design tokens — Admin reuses the exact same `globals.css` palette/type scale as the public site, just in a denser, restrained layout. Also added the UI primitives §11's component list didn't yet have (`IconButton`, `Checkbox`, `Switch`, `Tooltip`, `Breadcrumb`, `Drawer`, `Modal`, `DataTable`, `Pagination`) — `Drawer` backs `AdminMobileSidebar`. `src/lib/status.ts` gained `planning`/`active`/`paused`/`not-started`/`delayed`/`partial`/`due` alongside the statuses already there. Full report in that step's chat response; not duplicated here to keep this document current-state-focused rather than a changelog.

---

## 20. Chapter 2 — Admin Step 3 (authentication & security)

**This is the phase that made §13 (Security architecture) real.** Before this step, `getCurrentUser()` always returned `null` and no credential-checking, hashing, or session code existed anywhere — confirmed again by a fresh audit at the start of this step (nothing had drifted from §13's own status table). Case C of that step's brief applied: no backend/database exists, so a full multi-user auth system backed by a real `users` table isn't possible yet without inventing fake accounts, which is explicitly disallowed. The architecture below is the smallest foundation that is nonetheless **real** — genuine server-side verification, genuine password hashing, genuine signed sessions — not a frontend-only check.

**New dependencies (both used specifically because they're Edge/Node-portable and minimal):**
- `jose` — signs/verifies the session token. Chosen over a Node-only JWT library because `src/proxy.ts` runs on the Edge runtime, where `node:crypto` isn't available; `jose` works in both.
- `server-only` — a zero-logic guard import added to every module that must never reach a client bundle (`lib/auth/credentials.ts`, `lib/auth.ts`, the `features/*/repository.ts` files that touch credentials). Turns an accidental client-side import into a build error, not a silent leak.

**Password hashing:** `src/lib/auth/password.ts`, Node's built-in `scrypt` (memory-hard KDF) with a random 16-byte salt per password and a timing-safe comparison on verify — no new dependency needed for this half.

**The "no database yet" answer — one bootstrap account:** `src/lib/auth/credentials.ts` reads exactly one account's email + pre-hashed password from `ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD_HASH` (`.env.local`, never committed — see `.env.example`). `src/features/users/repository.ts` exposes its public `User` record through the same `Repository<T>` pattern Admin Step 1 established. `findCredentialsByEmail`/`findUserById` are the two functions to swap for real database queries once a `users` table exists — nothing above them (`getCurrentUser`, the login action, middleware) changes shape when that happens, matching the promise Step 1's `lib/auth.ts` comment made.

**Session strategy:** a signed, stateless JWT (`src/lib/auth/session.ts`) in an `httpOnly`, `sameSite=lax` cookie (`secure` in production only, so local `http://localhost` still works), 7-day expiry, carrying only `{ sub: userId, role }` — never a name, email, or the password hash. `AUTH_SECRET` has no hardcoded fallback; a missing/short one throws rather than silently running with a weak or (worse) literally-committed key.

**Route protection is two layers, not one:** `src/proxy.ts` (Next.js 16.3's current name for what was `middleware.ts`; requires the `src/` path specifically since this project uses a `src` directory) verifies the cookie's signature on every `/admin/*`/`/portal/*` request and redirects signed-out visitors to `/login` before any page component runs, and redirects a signed-in-but-wrong-role visitor away from `/admin/*` without forcing a re-login. `AdminLayout`/`PortalLayout`'s own `getCurrentUser()` checks (§3, unchanged in shape) still run underneath as a second, independent check — this is deliberate defense-in-depth, not redundant code to delete.

**Login/logout:** both are Next.js Server Actions (`src/lib/auth/actions.ts`), which get the framework's built-in same-origin/CSRF protection for free — no hand-rolled token. `loginAction` returns one identical "Invalid email or password" message for every failure branch (unknown email, wrong password, disabled account) and always runs a real `scrypt` computation even when the email doesn't match anything (a dummy hash, computed once at module load) specifically so a timing side-channel can't be used to enumerate valid emails. `logoutAction` deletes the cookie server-side (a stale value can never be replayed) and records an audit entry before redirecting.

**Rate limiting:** `src/lib/auth/rateLimiter.ts`, an in-memory sliding window (5 attempts / 15 minutes, keyed by submitted email). Explicitly documented in the file itself as **not** sufficient alone in a real multi-instance/serverless production deployment — it resets on every restart and isn't shared across processes. Stops accidental rapid retries and casual abuse today; a shared store (Redis/Upstash) is the production-grade version of this, not yet added.

**Audit log:** `src/features/audit/repository.ts` — append-only by construction (only exports `recordAuditEvent`, no update/delete), in-memory like every other repository this phase. `auth.login`/`auth.logout` are the first two real events it ever records — §14's own note that "there are no mutations to audit until the domains themselves are built" no longer applies to authentication.

**Security headers:** `next.config.ts` now sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` site-wide. A real Content-Security-Policy was deliberately left out — the public site loads Google Fonts and optimized `next/image` assets, and getting a CSP right for that needs dedicated testing this step didn't have scope for.

**What this is not:** production-hardened, multi-user authentication. It is real (server-verified, properly hashed, properly signed) for exactly one account. See Remaining Decisions below for what a real `users` table changes.

**Remaining decisions / production requirements (honestly incomplete, not silently glossed over):**
- No real `users` table — only the one env-configured bootstrap account can sign in. Admin user management (§16 of the brief) has nothing to manage yet.
- Rate limiting is in-memory only (above) — needs a shared store before a multi-instance deployment.
- No password-reset flow exists (brief §18) — the architecture (signed, time-limited tokens via the same `jose`/session pattern) is compatible, but building it needs an email-sending provider that doesn't exist in this project yet.
- No email verification (brief §19) — same blocker, no email provider configured.
- CSP header intentionally not added yet (above).
- Record-level scoping (§13, still open from Step 1) — a portal user's `role` permission answers "can this role ever see this kind of data," not "can this specific user see this specific record"; that still needs a real per-record ownership check once portal data exists.
- `AUTH_SECRET`/`ADMIN_BOOTSTRAP_*` in this environment's `.env.local` are test-only values generated for this step's own verification (via `scripts/hash-password.mjs`) — rotate them (and generate a real password) before this is ever deployed anywhere reachable.

---

## Verification

- ✅ `npm run build` — compiles, type-checks clean (all new routes: `/`, `/login`, `/portal`, `/portal/shareholder`, `/portal/landowner`, `/admin`, plus the three API routes)
- ✅ `npm run lint` — passes
- ✅ Verified in-browser: `/portal` and `/admin` correctly render `PermissionDeniedState` (no session exists); `/login` renders its placeholder form; `GET /api/public/projects` returns data, `GET /api/portal/me` correctly 401s
- No fake customers, shareholders, or financial records were created anywhere in this phase
- **Admin Step 1 (Chapter 2) re-verification:** `npx tsc --noEmit`, `npx eslint src`, and `npm run build` all re-run clean after adding the repository abstraction; the full Chapter 1 public site was spot-checked in-browser afterward to confirm nothing regressed (see the Admin Step 1 report for exact routes checked)
