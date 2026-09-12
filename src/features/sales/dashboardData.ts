import { leadRepository } from "@/features/crm/repository";
import { bookingRepository, saleRepository } from "@/features/sales/repository";
import { unitRepository } from "@/features/units/repository";
import { customerRepository } from "@/features/customers/repository";
import { filterToVisibleProjects, canAccessProjectOptional } from "@/lib/projectScope";
import type { User } from "@/types/user";
import type { Lead } from "@/types/crm";

export interface RecentActivityRow {
  id: string;
  kind: "sale" | "booking";
  label: string;
  date: string;
  href: string;
}

export interface SalesDashboardData {
  activeLeads: number;
  todaysFollowUps: Lead[];
  overdueFollowUps: Lead[];
  upcomingFollowUps: Lead[];
  siteVisits: number;
  activeBookings: number;
  availableUnits: number;
  soldUnits: number;
  pendingSales: number;
  totalSalesValue: number;
  conversionRatePct: number | null;
  recentActivity: RecentActivityRow[];
}

const LOST_OR_WON: Lead["status"][] = ["won", "lost"];
const ACTIVE_BOOKING_STATUSES = new Set(["reserved", "booked", "confirmed"]);

/**
 * Prompt 8 §9 — every number here is a live aggregate over real leads/
 * bookings/sales/units, scoped to `user`'s visible projects (same
 * `filterToVisibleProjects`/`canAccessProjectOptional` every other report
 * in this app already uses). Never a stored "Dashboard" record.
 */
export async function getSalesDashboard(user: User): Promise<SalesDashboardData> {
  const [allLeads, allBookings, allSales, allUnits, allCustomers] = await Promise.all([
    leadRepository.list(),
    bookingRepository.list(),
    saleRepository.list(),
    unitRepository.list(),
    customerRepository.list(),
  ]);

  const units = filterToVisibleProjects(user, allUnits);
  const visibleUnitIds = new Set(units.map((u) => u.id));
  const leads = allLeads.filter((l) => canAccessProjectOptional(user, l.interestedProjectId));
  const bookings = allBookings.filter((b) => canAccessProjectOptional(user, b.projectId));
  const sales = allSales.filter((s) => visibleUnitIds.has(s.unitId));
  const customersById = new Map(allCustomers.map((c) => [c.id, c]));

  const todayStr = new Date().toISOString().slice(0, 10);
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const in7DaysStr = in7Days.toISOString().slice(0, 10);

  const activeLeads = leads.filter((l) => !LOST_OR_WON.includes(l.status));
  const withFollowUp = leads.filter((l) => l.nextFollowUpAt && !LOST_OR_WON.includes(l.status));
  const todaysFollowUps = withFollowUp.filter((l) => l.nextFollowUpAt!.slice(0, 10) === todayStr);
  const overdueFollowUps = withFollowUp.filter((l) => l.nextFollowUpAt!.slice(0, 10) < todayStr);
  const upcomingFollowUps = withFollowUp.filter((l) => {
    const d = l.nextFollowUpAt!.slice(0, 10);
    return d > todayStr && d <= in7DaysStr;
  });

  const siteVisits = leads.filter((l) => l.status === "site-visit").length;
  const activeBookings = bookings.filter((b) => ACTIVE_BOOKING_STATUSES.has(b.status)).length;
  const availableUnits = units.filter((u) => u.status === "available").length;
  const soldUnits = units.filter((u) => u.status === "sold").length;
  const pendingSales = sales.filter((s) => s.status === "pending" || s.status === "confirmed").length;
  const totalSalesValue = sales.filter((s) => s.status !== "cancelled").reduce((sum, s) => sum + s.salePrice.amount, 0);

  const closedLeads = leads.filter((l) => LOST_OR_WON.includes(l.status));
  const wonLeads = leads.filter((l) => l.status === "won");
  const conversionRatePct = closedLeads.length > 0 ? Math.round((100 * wonLeads.length) / closedLeads.length) : null;

  const unitsById = new Map(units.map((u) => [u.id, u]));
  const recentSales: RecentActivityRow[] = sales
    .slice()
    .sort((a, b) => b.saleDate.localeCompare(a.saleDate))
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      kind: "sale",
      label: `${unitsById.get(s.unitId)?.unitNumber ?? "Unit"} sold to ${customersById.get(s.customerId)?.name ?? "customer"}`,
      date: s.saleDate,
      href: `/admin/sales/${s.id}`,
    }));
  const recentBookings: RecentActivityRow[] = bookings
    .slice()
    .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate))
    .slice(0, 5)
    .map((b) => ({
      id: b.id,
      kind: "booking",
      label: `${unitsById.get(b.unitId)?.unitNumber ?? "Unit"} booked by ${customersById.get(b.customerId)?.name ?? "customer"}`,
      date: b.bookingDate,
      href: "/admin/sales/bookings",
    }));
  const recentActivity = [...recentSales, ...recentBookings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  return {
    activeLeads: activeLeads.length,
    todaysFollowUps,
    overdueFollowUps,
    upcomingFollowUps,
    siteVisits,
    activeBookings,
    availableUnits,
    soldUnits,
    pendingSales,
    totalSalesValue,
    conversionRatePct,
    recentActivity,
  };
}
