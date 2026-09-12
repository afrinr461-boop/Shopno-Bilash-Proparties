/**
 * Rounds a set of proportional shares to whole taka and reconciles the
 * result against the exact total — a currency amount must never silently
 * lose or gain money to independent per-share rounding. The difference
 * (usually ±1 to a few taka) is applied to whichever share is LARGEST, a
 * deterministic, standard accounting convention. Reused identically for
 * owner-level allocation, unit-level sub-splits within an owner, and
 * installment-level splits within an owner — one rounding rule everywhere,
 * not several near-duplicates.
 */
export function reconcileRounding<T extends { key: string; amount: number }>(rawShares: T[], total: number): Map<string, number> {
  const rounded = rawShares.map((s) => ({ key: s.key, amount: Math.round(s.amount) }));
  const sum = rounded.reduce((s, r) => s + r.amount, 0);
  const difference = total - sum;

  if (difference !== 0 && rounded.length > 0) {
    const largest = rounded.reduce((a, b) => (b.amount > a.amount ? b : a));
    largest.amount += difference;
  }

  return new Map(rounded.map((r) => [r.key, r.amount]));
}
