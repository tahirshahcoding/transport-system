import { prisma } from "@/lib/prisma";
import { FinanceClient } from "@/components/finance/FinanceClient";

export default async function FinancePage() {
  const [allChallans, allPayments, collections, pendingAmounts] = await Promise.all([
    prisma.challan.findMany({
      include: {
        student: {
          select: {
            name: true,
            fatherName: true,
            mobileNumber: true,
            class: true,
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
        student: { select: { name: true, class: true, route: { select: { name: true } } } },
        challan: { select: { month: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.challan.aggregate({
      _sum: { amount: true, arrears: true },
      where: { status: { in: ["UNPAID", "PARTIAL"] } },
    }),
  ]);

  // Compute unique months for filter dropdown
  const uniqueMonths = [...new Set(allChallans.map(c => c.month))];

  return (
    <FinanceClient
      allChallans={allChallans}
      allPayments={allPayments}
      uniqueMonths={uniqueMonths}
      totalCollection={collections._sum.amount || 0}
      totalPending={(pendingAmounts._sum.amount || 0) + (pendingAmounts._sum.arrears || 0)}
    />
  );
}
