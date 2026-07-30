import { prisma } from "@/lib/prisma";
import { Users, Bus, Map as MapIcon, Wallet, ArrowUpRight, UserPlus, FileText, Receipt, Calendar, CheckCircle2 } from "lucide-react";
import { CircularProgress } from "@/components/dashboard/CircularProgress";
import { DashboardChallanItem } from "@/components/dashboard/DashboardChallanItem";
import Link from "next/link";

export default async function Dashboard() {
  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const [
    studentCount,
    vehicleCount,
    routeCount,
    thisMonthCollections,
    pendingAmounts,
    recentChallans,
    pendingStudents,
    allChallansWithPayments,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.vehicle.count(),
    prisma.route.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { challan: { month: currentMonthStr } }
    }),
    prisma.challan.aggregate({ _sum: { amount: true, arrears: true }, where: { status: { in: ["UNPAID", "PARTIAL"] } } }),
    prisma.challan.findMany({
      where: { status: { in: ["UNPAID", "PARTIAL"] } },
      include: {
        student: {
          select: {
            name: true,
            fatherName: true,
            mobileNumber: true,
            class: true,
          },
        },
      },
      orderBy: { id: "desc" },
      take: 4,
    }),
    prisma.challan.groupBy({ by: ["studentId"], where: { status: { in: ["UNPAID", "PARTIAL"] } } }),
    prisma.challan.findMany({
      include: {
        payments: { select: { amount: true } }
      },
      orderBy: { id: "desc" }
    })
  ]);

  const monthCollected = thisMonthCollections._sum.amount || 0;
  const totalPending = (pendingAmounts._sum.amount || 0) + (pendingAmounts._sum.arrears || 0);
  const pendingStudentCount = pendingStudents.length;

  // Build Monthwise Billing & Collection Stats
  const monthStatsMap = new Map<string, { billed: number; collected: number; count: number }>();
  for (const c of allChallansWithPayments) {
    const m = c.month;
    const billed = c.amount + c.arrears;
    const collected = c.payments.reduce((sum, p) => sum + p.amount, 0);

    if (!monthStatsMap.has(m)) {
      monthStatsMap.set(m, { billed: 0, collected: 0, count: 0 });
    }
    const curr = monthStatsMap.get(m)!;
    curr.billed += billed;
    curr.collected += collected;
    curr.count += 1;
  }

  const monthStatsList = Array.from(monthStatsMap.entries()).slice(0, 6);

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5 md:hidden">
        <div className="w-6 h-6" />
        <span className="text-base font-bold font-outfit text-slate-900">Dashboard</span>
        <div className="w-6 h-6" />
      </div>

      {/* Dynamic Greeting */}
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight font-outfit text-slate-900">
          {getTimeGreeting()}, Rahim Ullah 👋
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* 2×2 KPI Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Students */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-blue-50 p-2 rounded-xl">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Students</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-outfit">{studentCount}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Active</span>
        </div>

        {/* Vehicles */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-green-50 p-2 rounded-xl">
              <Bus className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Vehicles</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-outfit">{vehicleCount}</p>
          <span className="text-[10px] text-green-600 font-semibold">Active</span>
        </div>

        {/* Routes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-orange-50 p-2 rounded-xl">
              <MapIcon className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Routes</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-outfit">{routeCount}</p>
          <span className="text-[10px] text-green-600 font-semibold">Active</span>
        </div>

        {/* Collected This Month */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-purple-50 p-2 rounded-xl">
              <Wallet className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Collected This Month</span>
          </div>
          <p className="text-xl font-bold text-slate-900 font-outfit">Rs {monthCollected.toLocaleString()}</p>
          <span className="text-[10px] text-purple-600 font-semibold flex items-center gap-0.5">
            {currentMonthStr}
          </span>
        </div>
      </div>

      {/* Monthwise Billing & Collection Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 font-outfit">Monthwise Billing & Collection</h3>
          </div>
          <Link href="/finance?tab=Challans" className="text-[10px] text-blue-600 font-semibold">View Details</Link>
        </div>

        {monthStatsList.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No monthly billing records found.</p>
        ) : (
          <div className="space-y-3">
            {monthStatsList.map(([monthName, stats]) => {
              const pending = Math.max(0, stats.billed - stats.collected);
              const collectRate = stats.billed > 0 ? Math.min(100, Math.round((stats.collected / stats.billed) * 100)) : 0;

              return (
                <div key={monthName} className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 font-outfit">{monthName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {collectRate}% Collected
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-white rounded-lg p-2 border border-slate-100 mb-2">
                    <div>
                      <p className="text-[9px] text-slate-400 font-medium">Billed</p>
                      <p className="font-bold text-slate-900">Rs {stats.billed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-medium">Collected</p>
                      <p className="font-bold text-emerald-600">Rs {stats.collected.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-medium">Pending</p>
                      <p className="font-bold text-red-500">Rs {pending.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${collectRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Amount */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-1">Total Pending Dues</p>
          <p className="text-2xl font-bold text-red-500 font-outfit">Rs {totalPending.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">From {pendingStudentCount} Students</p>
        </div>
        <CircularProgress value={statsProgress(totalPending, monthCollected)} size={85} strokeWidth={8} />
      </div>

      {/* Recent Challans */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-700">Recent Pending Challans</p>
          <Link href="/finance?tab=Challans" className="text-[10px] text-blue-600 font-semibold cursor-pointer">View All</Link>
        </div>
        {recentChallans.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No unpaid challans.</p>
        ) : (
          <div className="space-y-3">
            {recentChallans.map((challan) => (
              <DashboardChallanItem key={challan.id} challan={challan} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-5">
        <div className="p-5 pb-3">
          <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
        </div>
        <div className="p-5 pt-0 grid grid-cols-4 gap-2 text-center">
          <Link href="/students?action=add" className="flex flex-col items-center gap-2 group">
            <div className="bg-blue-50/80 p-4 rounded-2xl group-hover:bg-blue-100 transition-colors w-full flex items-center justify-center aspect-square">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Add<br />Student</span>
          </Link>
          <Link href="/finance?tab=Challans" className="flex flex-col items-center gap-2 group">
            <div className="bg-green-50/80 p-4 rounded-2xl group-hover:bg-green-100 transition-colors w-full flex items-center justify-center aspect-square">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Challans</span>
          </Link>
          <Link href="/finance?tab=Payments" className="flex flex-col items-center gap-2 group">
            <div className="bg-orange-50/80 p-4 rounded-2xl group-hover:bg-orange-100 transition-colors w-full flex items-center justify-center aspect-square">
              <Receipt className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Payments</span>
          </Link>
          <Link href="/vehicles?action=add" className="flex flex-col items-center gap-2 group">
            <div className="bg-purple-50/80 p-4 rounded-2xl group-hover:bg-purple-100 transition-colors w-full flex items-center justify-center aspect-square">
              <Bus className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Add<br />Vehicle</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function statsProgress(pending: number, collected: number) {
  const total = pending + collected;
  if (total === 0) return 0;
  return Math.round((pending / total) * 100);
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
