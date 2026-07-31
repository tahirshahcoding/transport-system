import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FinanceClient } from "@/components/finance/FinanceClient";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [allChallans, allPayments, collections] = await Promise.all([
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
        challan: { select: { month: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
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

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Finance...</div>}>
      <FinanceClient
        allChallans={allChallans}
        allPayments={allPayments}
        uniqueMonths={uniqueMonths}
        totalCollection={collections._sum.amount || 0}
        totalPending={totalPending}
      />
    </Suspense>
  );
}
