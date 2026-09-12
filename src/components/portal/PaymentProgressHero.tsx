"use client";

import { AnimatedNumber } from "@/components/portal/AnimatedNumber";
import { AnimatedProgressLine } from "@/components/portal/AnimatedProgressLine";

export interface PaymentProgressHeroProps {
  totalPayable: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount?: number;
}

/**
 * Chapter 3 Prompt 3 §6/§7 — the financial hero. Deliberately three plain
 * figures and one thin progress line, not a dashboard of cards — the
 * brief is explicit that this should read as "private property wealth,"
 * not an accounting summary.
 */
export function PaymentProgressHero({ totalPayable, totalPaid, totalOutstanding, overdueAmount }: PaymentProgressHeroProps) {
  const percentPaid = totalPayable > 0 ? Math.round((totalPaid / totalPayable) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-caption text-fg-subtle uppercase">Total Payable</p>
        <p className="text-display-xl text-fg mt-1">
          <AnimatedNumber value={totalPayable} prefix="৳" />
        </p>
      </div>

      <div className="border-premium/30 grid grid-cols-2 gap-8 border-t pt-6">
        <div>
          <p className="text-caption text-fg-subtle uppercase">Paid</p>
          <p className="text-h2 text-fg mt-1">
            <AnimatedNumber value={totalPaid} prefix="৳" />
          </p>
        </div>
        <div>
          <p className="text-caption text-fg-subtle uppercase">Remaining</p>
          <p className="text-h2 text-fg mt-1">
            <AnimatedNumber value={totalOutstanding} prefix="৳" />
          </p>
        </div>
      </div>

      <div>
        <AnimatedProgressLine percent={percentPaid} />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-caption text-fg-subtle">{percentPaid}% Paid</p>
          {!!overdueAmount && overdueAmount > 0 && (
            <p className="text-caption text-error">
              ৳{overdueAmount.toLocaleString("en-IN")} overdue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
