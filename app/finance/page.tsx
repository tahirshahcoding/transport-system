import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FinanceClient } from "@/components/finance/FinanceClient";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [allChallans, allPayments] = await Promise.all([
    prisma.challan.findMany({
      include: {
        student: {
          select: {
            name: true,
            fatherName: true,
            mobileNumber: true,
            class: true,
            institute: { select: { name: true } },
            route: { select: { name: true } },
          },
        },
        payments: {
          select: { amount: true },
        },
      },
      orderBy: { id: "desc" },
    }),
    prisma.payment.findMany({
      include: {
        student: { select: { name: true, fatherName: true, class: true, institute: { select: { name: true } }, route: { select: { name: true } } } },
        challan: { select: { id: true, month: true } },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  // Compute unique months for filter dropdown
  const uniqueMonths = [...new Set(allChallans.map(c => c.month))];

  // Calculate exact pending dues deducting partial payments
  const totalPending = allChallans
    .filter(c => c.status === "UNPAID" || c.status === "PARTIAL")
    .reduce((sum, c) => {
      const totalPaid = c.payments.reduce((pSum, p) => pSum + p.amount, 0);
      const remaining = (c.amount + c.arrears) - totalPaid;
      return sum + Math.max(0, remaining);
    }, 0);

  const totalCollection = allPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Finance...</div>}>
      <FinanceClient
        allChallans={allChallans}
        allPayments={allPayments}
        uniqueMonths={uniqueMonths}
        totalCollection={totalCollection}
        totalPending={totalPending}
      />
    </Suspense>
  );
}
