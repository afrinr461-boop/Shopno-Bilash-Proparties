/**
 * Runs once against the real database (`npx prisma db seed`, or
 * automatically after `prisma migrate reset`) to insert the handful of
 * records that used to be constructor arguments on an `InMemoryRepository`
 * — the bootstrap admin account, and the real (not invented) demo content
 * for News/Projects/Properties and the one Company Settings row. Every
 * other domain intentionally starts with an empty table, same "start
 * empty, never invent records" rule the rest of the codebase follows.
 *
 * Idempotent: each section checks `count() === 0` first, so running this
 * again against an already-seeded database is a safe no-op, not a
 * duplicate-data bug.
 *
 * Run via plain Node (through `tsx`), not through Next.js — so this file
 * deliberately does NOT import anything marked `import "server-only"`
 * (that guard throws unconditionally outside a Next.js Server Component
 * build; see `src/lib/auth/credentials.ts`, `src/lib/db.ts`). The two
 * bootstrap env vars are read directly here for that reason, not imported
 * from `credentials.ts`.
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import process from "node:process";
import { newsArticles } from "../src/content/news";
import { projects } from "../src/content/projects";
import { units } from "../src/content/units";
import { galleryItems } from "../src/content/gallery";
import { privacyPolicy, termsAndConditions, propertyDisclaimer, cookiePolicy } from "../src/content/legal";
import type { PageContentId } from "../src/content/legal";

// The Prisma CLI only auto-loads `.env` — the bootstrap admin credentials
// live in `.env.local` (Next.js's own convention for machine-specific
// secrets, see `.env.example`), which Prisma never touches. Without this,
// `seedBootstrapAccount()` below silently skips every time, and nobody
// can sign in. `loadEnvFile` (Node 20.6+) never overwrites a variable the
// shell or `.env` already set — same precedence Next.js itself uses.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local in this environment (e.g. CI) — nothing to load.
}

const prisma = new PrismaClient();

async function seedBootstrapAccount() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const passwordHash = process.env.ADMIN_BOOTSTRAP_PASSWORD_HASH;
  if (!email || !passwordHash) {
    console.log("No ADMIN_BOOTSTRAP_EMAIL/ADMIN_BOOTSTRAP_PASSWORD_HASH set — skipping bootstrap account.");
    return;
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.credential.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    console.log("Bootstrap account already seeded — skipping.");
    return;
  }

  const userId = randomUUID();
  const now = new Date().toISOString();

  await prisma.user.create({
    data: {
      id: userId,
      data: {
        id: userId,
        name: "Super Admin",
        email: normalizedEmail,
        role: "super_admin",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
    },
  });

  await prisma.credential.create({
    data: { userId, email: normalizedEmail, passwordHash },
  });

  console.log(`Seeded bootstrap account (${normalizedEmail}).`);
}

async function seedNews() {
  const count = await prisma.newsArticle.count();
  if (count > 0) return;

  await prisma.newsArticle.createMany({
    data: newsArticles.map((article) => ({ id: article.id, data: article as unknown as Prisma.InputJsonValue })),
  });
  console.log(`Seeded ${newsArticles.length} news articles.`);
}

async function seedProjects() {
  const count = await prisma.projectContent.count();
  if (count > 0) return;

  await prisma.projectContent.createMany({
    data: projects.map((project) => ({ id: project.id, data: project as unknown as Prisma.InputJsonValue })),
  });
  console.log(`Seeded ${projects.length} projects.`);
}

async function seedUnits() {
  const count = await prisma.unitContent.count();
  if (count > 0) return;

  await prisma.unitContent.createMany({
    data: units.map((unit) => ({ id: unit.id, data: unit as unknown as Prisma.InputJsonValue })),
  });
  console.log(`Seeded ${units.length} units.`);
}

async function seedGallery() {
  const count = await prisma.galleryImage.count();
  if (count > 0) return;

  await prisma.galleryImage.createMany({
    data: galleryItems.map((item) => ({ id: item.id, data: item as unknown as Prisma.InputJsonValue })),
  });
  console.log(`Seeded ${galleryItems.length} gallery images.`);
}

async function seedPages() {
  const count = await prisma.pageContent.count();
  if (count > 0) return;

  const pages: Array<{ id: PageContentId; content: typeof privacyPolicy }> = [
    { id: "privacy", content: privacyPolicy },
    { id: "terms", content: termsAndConditions },
    { id: "disclaimer", content: propertyDisclaimer },
    { id: "cookies", content: cookiePolicy },
  ];

  await prisma.pageContent.createMany({
    data: pages.map(({ id, content }) => ({
      id,
      data: { id, ...content } as unknown as Prisma.InputJsonValue,
    })),
  });
  console.log(`Seeded ${pages.length} legal pages.`);
}

async function seedCompanySettings() {
  const count = await prisma.companySettings.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  const id = "company";

  await prisma.companySettings.create({
    data: {
      id,
      data: {
        id,
        legalName: "Shopno Bilash Properties Ltd.",
        displayName: "Shopno Bilash Properties",
        createdBy: "system",
        createdAt: now,
        updatedAt: now,
      },
    },
  });
  console.log("Seeded company settings.");
}

async function seedFounderProfile() {
  const count = await prisma.founderProfile.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  const id = "founder";

  // Placeholder copy, obviously unfinished rather than an invented
  // biography — same honesty rule as `seedCompanySettings`'s unset contact
  // fields. Replace via Admin → Website → Founder Profile → Edit.
  await prisma.founderProfile.create({
    data: {
      id,
      data: {
        id,
        name: "Add Your Name",
        title: "Founder & Managing Director",
        bio: "This is placeholder text. Replace it from Admin → Website → Founder Profile → Edit with the owner's real background and story.",
        principles: [],
        highlights: [],
        gallery: [],
        createdBy: "system",
        createdAt: now,
        updatedAt: now,
      },
    },
  });
  console.log("Seeded founder profile.");
}

async function main() {
  await seedBootstrapAccount();
  await seedNews();
  await seedProjects();
  await seedUnits();
  await seedGallery();
  await seedPages();
  await seedCompanySettings();
  await seedFounderProfile();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
