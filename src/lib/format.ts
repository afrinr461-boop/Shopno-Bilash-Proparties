/**
 * Centralized number/currency/date formatting. Components must use these
 * instead of formatting values inline, so BDT amounts, percentages, and
 * dates stay consistent across the whole platform.
 */

// en-IN grouping produces the lakh/crore digit grouping Bangladesh uses
// (1,25,000 / 12,50,000 / 1,25,00,000) — verified against Node's ICU data.
const GROUPING_LOCALE = "en-IN";

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(GROUPING_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatBDT(value: number, fractionDigits = 0): string {
  return `৳${formatNumber(value, fractionDigits)}`;
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Formats a date as "05 Sep 2026" (DD MMM YYYY), the platform-wide date format. */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = SHORT_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/** `formatDate` plus a 24h time — for logs (Audit Log, Activity Feed) where same-day entries need to stay distinguishable and orderable, not just dated. */
export function formatDateTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(date)}, ${hours}:${minutes}`;
}
