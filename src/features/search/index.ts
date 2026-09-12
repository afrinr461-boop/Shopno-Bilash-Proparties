import "server-only";
import { projectRepository } from "@/features/projects/repository";
import { buildingRepository } from "@/features/buildings/repository";
import { floorRepository } from "@/features/floors/repository";
import { unitRepository } from "@/features/units/repository";
import { parkingRepository } from "@/features/parking/repository";
import { customerRepository } from "@/features/customers/repository";
import { shareholderRepository } from "@/features/shareholders/repository";
import { landownerRepository } from "@/features/landowners/repository";
import { leadRepository } from "@/features/crm/repository";
import { bookingRepository, saleRepository } from "@/features/sales/repository";
import { customerPaymentRepository } from "@/features/finance/repository";
import { goalInstallmentRepository } from "@/features/costAllocations/repository";
import { materialRepository, vendorRepository } from "@/features/procurement/repository";
import { documentRepository } from "@/features/documents/repository";
import { constructionTaskRepository } from "@/features/construction/repository";
import { contractorRepository } from "@/features/contractors/repository";
import { canAccessProjectOptional } from "@/lib/projectScope";
import { hasPermission } from "@/lib/permissions";
import type { User } from "@/types/user";

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  projectName?: string;
  href: string;
}

const PER_TYPE_LIMIT = 5;
const TOTAL_LIMIT = 30;

function matchRank(query: string, ...fields: (string | undefined)[]): number {
  const q = query.toLowerCase();
  let best = -1;
  for (const field of fields) {
    if (!field) continue;
    const f = field.toLowerCase();
    if (f === q) return 3;
    if (f.startsWith(q)) best = Math.max(best, 2);
    else if (f.includes(q)) best = Math.max(best, 1);
  }
  return best;
}

/**
 * Prompt 10 — the ONE universal search system across every domain (never
 * duplicated per-page). Plain in-memory substring matching over the same
 * `.list()` calls every admin list page already makes — no separate index,
 * no separate source of truth; a record here is only ever as current as
 * its own repository. Results carry their project context explicitly
 * (Prompt 10's own example: two projects can both have a "2A") and are
 * scoped through the same `canAccessProjectOptional`/visible-project rules
 * every other admin page already respects.
 */
export async function searchAdmin(user: User, rawQuery: string): Promise<SearchResult[]> {
  const query = rawQuery.trim();
  if (query.length < 2) return [];

  const [
    projects,
    buildings,
    floors,
    units,
    parkingSpaces,
    customers,
    shareholders,
    landowners,
    leads,
    bookings,
    sales,
    payments,
    installments,
    materials,
    vendors,
    documents,
    tasks,
    contractors,
  ] = await Promise.all([
    projectRepository.list(),
    buildingRepository.list(),
    floorRepository.list(),
    unitRepository.list(),
    parkingRepository.list(),
    customerRepository.list(),
    shareholderRepository.list(),
    landownerRepository.list(),
    leadRepository.list(),
    bookingRepository.list(),
    saleRepository.list(),
    customerPaymentRepository.list(),
    goalInstallmentRepository.list(),
    materialRepository.list(),
    vendorRepository.list(),
    documentRepository.list(),
    constructionTaskRepository.list(),
    contractorRepository.list(),
  ]);

  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const customersById = new Map(customers.map((c) => [c.id, c]));
  const unitsById = new Map(units.map((u) => [u.id, u]));

  const results: (SearchResult & { rank: number })[] = [];

  function add(
    type: string,
    id: string,
    title: string,
    subtitle: string,
    href: string,
    projectId: string | undefined,
    rank: number,
    counts: Map<string, number>,
  ) {
    if (rank < 0) return;
    if (projectId !== undefined && !canAccessProjectOptional(user, projectId)) return;
    const count = counts.get(type) ?? 0;
    if (count >= PER_TYPE_LIMIT) return;
    counts.set(type, count + 1);
    results.push({ type, id, title, subtitle, projectName: projectId ? projectsById.get(projectId)?.name : undefined, href, rank });
  }

  const counts = new Map<string, number>();

  // Each category is gated behind the same permission its dedicated admin
  // page already requires — global search must never surface a domain the
  // signed-in role can't otherwise see (it was previously gated only by
  // project scope, letting e.g. a procurement_manager search up customer
  // payment amounts they have no `finance.view`/`sales.view` for).
  if (hasPermission(user.role, "project.view")) {
    for (const p of projects) {
      add("Project", p.id, p.name, p.code, `/admin/projects/${p.id}`, p.id, matchRank(query, p.name, p.code), counts);
    }
    for (const b of buildings) {
      add("Building", b.id, b.name, b.status, `/admin/projects/${b.projectId}`, b.projectId, matchRank(query, b.name, b.code), counts);
    }
    for (const f of floors) {
      add("Floor", f.id, f.label, `Floor ${f.floorNumber}`, `/admin/projects/${f.projectId}`, f.projectId, matchRank(query, f.label), counts);
    }
  }
  if (hasPermission(user.role, "unit.view")) {
    for (const u of units) {
      add(
        "Unit",
        u.id,
        u.unitNumber,
        u.status,
        `/admin/properties/${u.id}`,
        u.projectId,
        matchRank(query, u.unitNumber),
        counts,
      );
    }
  }
  if (hasPermission(user.role, "parking.view")) {
    for (const p of parkingSpaces) {
      add(
        "Parking",
        p.id,
        p.parkingNumber,
        p.status,
        `/admin/parking/${p.id}`,
        p.projectId,
        matchRank(query, p.parkingNumber),
        counts,
      );
    }
  }
  if (hasPermission(user.role, "customer.view")) {
    for (const c of customers) {
      add("Owner / Customer", c.id, c.name, c.phone || c.email, `/admin/customers/${c.id}`, undefined, matchRank(query, c.name, c.phone, c.email), counts);
    }
  }
  if (hasPermission(user.role, "shareholder.view")) {
    for (const s of shareholders) {
      add("Owner / Shareholder", s.id, s.name, s.phone, `/admin/shareholders/${s.id}`, undefined, matchRank(query, s.name, s.phone), counts);
    }
  }
  if (hasPermission(user.role, "landowner.view")) {
    for (const l of landowners) {
      add("Owner / Landowner", l.id, l.name, l.phone, `/admin/landowners/${l.id}`, undefined, matchRank(query, l.name, l.phone), counts);
    }
  }
  if (hasPermission(user.role, "lead.view")) {
    for (const l of leads) {
      add(
        "Lead",
        l.id,
        l.name,
        l.phone,
        `/admin/leads/${l.id}`,
        l.interestedProjectId,
        matchRank(query, l.name, l.phone, l.email),
        counts,
      );
    }
  }
  if (hasPermission(user.role, "sales.view")) {
    for (const b of bookings) {
      const unit = unitsById.get(b.unitId);
      const customer = customersById.get(b.customerId);
      add(
        "Booking",
        b.id,
        `${unit?.unitNumber ?? "Unit"} — ${customer?.name ?? "Customer"}`,
        b.status,
        `/admin/sales/bookings/${b.id}/edit`,
        b.projectId,
        matchRank(query, unit?.unitNumber, customer?.name, b.reference),
        counts,
      );
    }
    for (const s of sales) {
      const unit = unitsById.get(s.unitId);
      const customer = customersById.get(s.customerId);
      add(
        "Sale",
        s.id,
        `${unit?.unitNumber ?? "Unit"} — ${customer?.name ?? "Customer"}`,
        s.status,
        `/admin/sales/${s.id}`,
        s.projectId,
        matchRank(query, unit?.unitNumber, customer?.name),
        counts,
      );
    }
    for (const i of installments) {
      add(
        "Installment",
        i.id,
        i.label,
        `Due ${i.dueDate.slice(0, 10)}`,
        `/admin/finance/cost-allocations/${i.costAllocationId}`,
        i.projectId,
        matchRank(query, i.label),
        counts,
      );
    }
  }
  if (hasPermission(user.role, "finance.view")) {
    for (const p of payments) {
      const customer = customersById.get(p.customerId);
      add(
        "Payment",
        p.id,
        `${customer?.name ?? "Customer"} — ${p.amount.amount.toLocaleString()} BDT`,
        p.reference ?? "—",
        `/admin/sales/payments/${p.id}`,
        p.projectId,
        matchRank(query, customer?.name, p.reference),
        counts,
      );
    }
  }
  if (hasPermission(user.role, "procurement.view")) {
    for (const m of materials) {
      add("Material", m.id, m.name, m.brand ?? m.unit, `/admin/procurement/materials/${m.id}`, undefined, matchRank(query, m.name, m.brand), counts);
    }
    for (const v of vendors) {
      add("Supplier", v.id, v.name, v.phone, `/admin/procurement/${v.id}`, undefined, matchRank(query, v.name, v.phone), counts);
    }
  }
  if (hasPermission(user.role, "documents.view")) {
    for (const d of documents) {
      add("Document", d.id, d.name, d.category, `/admin/documents/${d.id}`, undefined, matchRank(query, d.name, d.category), counts);
    }
  }
  if (hasPermission(user.role, "construction.view")) {
    for (const t of tasks) {
      add(
        "Task",
        t.id,
        t.title,
        t.status,
        `/admin/construction/${t.phaseId}`,
        t.projectId,
        matchRank(query, t.title),
        counts,
      );
    }
    for (const c of contractors) {
      add("Contractor", c.id, c.name, c.specialty ?? c.phone, `/admin/construction/contractors/${c.id}`, undefined, matchRank(query, c.name, c.specialty, c.phone), counts);
    }
  }

  return results
    .sort((a, b) => b.rank - a.rank)
    .slice(0, TOTAL_LIMIT)
    .map((r): SearchResult => ({ type: r.type, id: r.id, title: r.title, subtitle: r.subtitle, projectName: r.projectName, href: r.href }));
}
