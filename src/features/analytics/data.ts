import { unitRepository } from "@/features/units/repository";
import { leadRepository } from "@/features/crm/repository";
import { customerRepository } from "@/features/customers/repository";
import { saleRepository, bookingRepository } from "@/features/sales/repository";
import { constructionPhaseRepository } from "@/features/construction/repository";
import { parkingRepository } from "@/features/parking/repository";
import { canAccessProjectOptional, filterToVisibleProjects } from "@/lib/projectScope";
import type { UnitStatus } from "@/types/unit";
import type { LeadStatus } from "@/types/crm";
import type { CustomerStatus } from "@/types/customer";
import type { SaleStatus, BookingStatus } from "@/types/sales";
import type { ConstructionStatus } from "@/types/construction";
import type { ParkingStatus } from "@/types/parking";
import type { User } from "@/types/user";

export interface DistributionEntry<K extends string> {
  key: K;
  count: number;
}

export interface AnalyticsBreakdown {
  unitsByStatus: DistributionEntry<UnitStatus>[];
  leadsByStatus: DistributionEntry<LeadStatus>[];
  customersByStatus: DistributionEntry<CustomerStatus>[];
  salesByStatus: DistributionEntry<SaleStatus>[];
  bookingsByStatus: DistributionEntry<BookingStatus>[];
  constructionPhasesByStatus: DistributionEntry<ConstructionStatus>[];
  parkingByStatus: DistributionEntry<ParkingStatus>[];
}

function countBy<T extends string>(values: T[]): DistributionEntry<T>[] {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Admin Step 19 — Analytics Foundation. Real distributions over existing
 * repositories (Unit/Lead/Customer status), never a fabricated trend or
 * web-traffic number — there is no page-view tracking in this project,
 * so "site analytics" isn't attempted, only the business breakdowns
 * these repositories can actually answer. Empty arrays (not zero-filled
 * placeholders) when a repository has no records yet.
 */
/** Scoped to `user`'s visible projects — same reasoning as `getDashboardData`. */
export async function getAnalyticsBreakdown(user: User): Promise<AnalyticsBreakdown> {
  const [allUnits, allLeads, customers, allSales, allBookings, allPhases, allParking] = await Promise.all([
    unitRepository.list(),
    leadRepository.list(),
    customerRepository.list(),
    saleRepository.list(),
    bookingRepository.list(),
    constructionPhaseRepository.list(),
    parkingRepository.list(),
  ]);

  const units = filterToVisibleProjects(user, allUnits);
  const leads = allLeads.filter((l) => canAccessProjectOptional(user, l.interestedProjectId));
  const sales = allSales.filter((s) => canAccessProjectOptional(user, s.projectId));
  const bookings = allBookings.filter((b) => canAccessProjectOptional(user, b.projectId));
  const phases = filterToVisibleProjects(user, allPhases);
  const parking = filterToVisibleProjects(user, allParking);

  return {
    unitsByStatus: countBy(units.map((u) => u.status)),
    leadsByStatus: countBy(leads.map((l) => l.status)),
    customersByStatus: countBy(customers.map((c) => c.status)),
    salesByStatus: countBy(sales.map((s) => s.status)),
    bookingsByStatus: countBy(bookings.map((b) => b.status)),
    constructionPhasesByStatus: countBy(phases.map((p) => p.status)),
    parkingByStatus: countBy(parking.map((p) => p.status)),
  };
}
