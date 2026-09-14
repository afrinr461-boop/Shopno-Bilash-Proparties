import "server-only";
import { prisma } from "@/lib/db";
import { COMPANY_SETTINGS_ID } from "@/features/settings/repository";

/**
 * Powers the small red "you haven't filled this in yet" dot on the admin
 * sidebar. Deliberately narrow: only nav items where "empty" genuinely
 * means "you probably forgot to set this up" get a check — read-only
 * views (Dashboard, Reports, Analytics, Audit Log), naturally-often-empty
 * queues (Alerts, Approvals, Reminders, Notifications, Activity Feed,
 * Documents), and system config that's always "complete" by definition
 * (Users, Roles, Pages, Backup & Restore) are left out on purpose — an
 * empty Alerts page is good news, not a missing-info warning.
 */
type CompletenessCheck = () => Promise<boolean>;

function countIsZero(model: keyof typeof prisma): CompletenessCheck {
  return async () => {
    const delegate = prisma[model] as unknown as { count: () => Promise<number> };
    return (await delegate.count()) === 0;
  };
}

const CHECKS: Record<string, CompletenessCheck> = {
  "/admin/projects": countIsZero("project"),
  "/admin/properties": countIsZero("unit"),
  "/admin/parking": countIsZero("parking"),
  "/admin/construction": countIsZero("constructionPhase"),
  "/admin/construction/contractors": countIsZero("contractor"),

  "/admin/customers": countIsZero("customer"),
  "/admin/sales/bookings": countIsZero("booking"),
  "/admin/sales": countIsZero("sale"),
  "/admin/sales/payments": countIsZero("customerPayment"),
  "/admin/sales/installments": countIsZero("installment"),

  "/admin/finance/expenses": countIsZero("projectExpense"),
  "/admin/finance/project-costs": countIsZero("projectBudget"),
  "/admin/finance/cost-allocations": countIsZero("costAllocation"),
  "/admin/finance/accounts": countIsZero("cashAccount"),
  "/admin/procurement": countIsZero("vendor"),
  "/admin/procurement/purchases": countIsZero("purchase"),
  "/admin/procurement/materials": countIsZero("material"),
  "/admin/procurement/stock": countIsZero("stockMovement"),

  "/admin/shareholders": countIsZero("shareholder"),
  "/admin/landowners": countIsZero("landowner"),

  "/admin/leads": countIsZero("lead"),

  "/admin/content/projects": countIsZero("projectContent"),
  "/admin/content/properties": countIsZero("unitContent"),
  "/admin/content/news": countIsZero("newsArticle"),
  "/admin/content/gallery": countIsZero("galleryImage"),
  "/admin/content/story": countIsZero("companyMilestone"),
  "/admin/content/policy": countIsZero("policyRule"),

  // The user's own example: the public "Our Impact" stat row (Settings →
  // Public "Our Impact" Stats) is easy to forget since it's four optional
  // number fields buried in a bigger form — flagged only when ALL four
  // are still empty, not just one, so filling in even a single stat
  // clears it.
  "/admin/settings": async () => {
    const row = await prisma.companySettings.findUnique({ where: { id: COMPANY_SETTINGS_ID } });
    const data = row?.data as Record<string, unknown> | undefined;
    if (!data) return false;
    return (
      data.impactOngoingDevelopments == null &&
      data.impactDevelopmentAreaAcres == null &&
      data.impactLocations == null &&
      data.impactLandownerPartnerships == null
    );
  },
};

/** Runs every registered check in parallel and returns the hrefs that came back "incomplete" — safe to call once per admin page load (each check is a cheap `count()`/single-row lookup, never a full `findMany`). */
export async function getIncompleteNavHrefs(): Promise<string[]> {
  const entries = Object.entries(CHECKS);
  const results = await Promise.all(
    entries.map(async ([href, check]) => {
      try {
        return (await check()) ? href : null;
      } catch {
        return null; // A check failing to run is not itself "incomplete" — fail quiet, never block the sidebar from rendering.
      }
    }),
  );
  return results.filter((href): href is string => href !== null);
}
