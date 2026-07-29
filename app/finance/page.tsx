import { prisma } from "@/lib/prisma";
import { FinanceClient } from "@/components/finance/FinanceClient";

export default async function FinancePage() {
  const [pendingChallans, payments, collections, pendingAmounts] = await Promise.all([
    prisma.challan.findMany({
      where: { status: "UNPAID" },
      include: {
        student: {
          select: {
            name: true,
            class: true,
            route: { select: { name: true } },
          },
        },
        arrears: true,
      },
      orderBy: { id: "desc" },
    }),
    prisma.payment.findMany({
      include: {
        student: { select: { name: true, class: true, route: { select: { name: true } } } },
        challan: { select: { month: true } },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.challan.aggregate({ _sum: { amount: true }, where: { status: "UNPAID" } }),
  ]);

  return (
    <FinanceClient
      initialChallans={pendingChallans}
      recentPayments={payments}
      totalCollection={collections._sum.amount || 0}
      totalPending={pendingAmounts._sum.amount || 0}
    />
  );
}
