import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  let expenses: any[] = [];
  let vehicles: any[] = [];
  let payments: any[] = [];
  let totalCollection = 0;

  try {
    const fetchExpenses = (prisma as any).expense
      ? prisma.expense.findMany({
          include: {
            vehicle: { select: { registrationNumber: true } },
          },
          orderBy: { date: "desc" },
        })
      : Promise.resolve([]);

    const [expData, vehData, colData, payData] = await Promise.all([
      fetchExpenses,
      prisma.vehicle.findMany({
        select: { id: true, registrationNumber: true },
        orderBy: { registrationNumber: "asc" },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        select: {
          amount: true,
          challan: { select: { month: true } },
        },
      }),
    ]);

    expenses = expData;
    vehicles = vehData;
    totalCollection = colData._sum.amount || 0;
    payments = payData;
  } catch (err) {
    console.error("Expenses DB fetch warning:", err);
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Expenses & Profitability...</div>}>
      <ExpensesClient
        initialExpenses={expenses}
        availableVehicles={vehicles}
        totalCollection={totalCollection}
        allPayments={payments}
      />
    </Suspense>
  );
}
