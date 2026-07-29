import { prisma } from "@/lib/prisma";
import { Users, Bus, Map, Wallet, Bell, Menu, ArrowUpRight, UserPlus, FileText, Receipt } from "lucide-react";
import { CircularProgress } from "@/components/dashboard/CircularProgress";
import Link from "next/link";

export default async function Dashboard() {
  const [
    studentCount,
    vehicleCount,
    routeCount,
    collections,
    pendingAmounts,
    recentChallans,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.vehicle.count(),
    prisma.route.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.challan.aggregate({ _sum: { amount: true }, where: { status: "UNPAID" } }),
    prisma.challan.findMany({
      where: { status: "UNPAID" },
      include: { student: { select: { name: true } } },
      orderBy: { id: "desc" },
      take: 3,
    }),
  ]);

  const totalCollected = collections._sum.amount || 0;
  const totalPending = pendingAmounts._sum.amount || 0;
  const totalInvoiced = totalCollected + totalPending;
  const pendingPercentage = totalInvoiced > 0 ? Math.round((totalPending / totalInvoiced) * 100) : 0;
  const pendingStudentCount = await prisma.challan.groupBy({ by: ["studentId"], where: { status: "UNPAID" } }).then(r => r.length);

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5 md:hidden">
        <div className="w-6 h-6" /> {/* Placeholder to keep Dashboard text centered */}
        <span className="text-base font-bold font-outfit text-slate-900">Dashboard</span>
        <div className="relative">
          <Bell className="w-6 h-6 text-slate-700" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">3</span>
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight font-outfit text-slate-900">
          Good Morning, Admin! 👋
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
              <Map className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Routes</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-outfit">{routeCount}</p>
          <span className="text-[10px] text-green-600 font-semibold">Active</span>
        </div>

        {/* Today's Collection */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-purple-50 p-2 rounded-xl">
              <Wallet className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Today&apos;s Collection</span>
          </div>
          <p className="text-xl font-bold text-slate-900 font-outfit">Rs {totalCollected.toLocaleString()}</p>
          <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> 12%
          </span>
        </div>
      </div>

      {/* Pending Amount */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-1">Pending Amount</p>
          <p className="text-2xl font-bold text-red-500 font-outfit">Rs {totalPending.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">From {pendingStudentCount} Students</p>
        </div>
        <CircularProgress value={pendingPercentage} size={85} strokeWidth={8} />
      </div>

      {/* Recent Challans */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-700">Recent Challans</p>
          <Link href="/finance" className="text-[10px] text-blue-600 font-semibold cursor-pointer">View All</Link>
        </div>
        {recentChallans.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No challans yet.</p>
        ) : (
          <div className="space-y-3">
            {recentChallans.map((challan) => (
              <div key={challan.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-blue-600 font-semibold">
                    CH-{challan.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-700 font-medium">{challan.student.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-900">Rs {challan.amount.toLocaleString()}</span>
                  <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-semibold">
                    Unpaid
                  </span>
                </div>
              </div>
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
          <Link href="/students" className="flex flex-col items-center gap-2 group">
            <div className="bg-blue-50/80 p-4 rounded-2xl group-hover:bg-blue-100 transition-colors w-full flex items-center justify-center aspect-square">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Add<br/>Student</span>
          </Link>
          <Link href="/finance" className="flex flex-col items-center gap-2 group">
            <div className="bg-green-50/80 p-4 rounded-2xl group-hover:bg-green-100 transition-colors w-full flex items-center justify-center aspect-square">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Challan</span>
          </Link>
          <Link href="/finance" className="flex flex-col items-center gap-2 group">
            <div className="bg-orange-50/80 p-4 rounded-2xl group-hover:bg-orange-100 transition-colors w-full flex items-center justify-center aspect-square">
              <Receipt className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Payment</span>
          </Link>
          <Link href="/vehicles" className="flex flex-col items-center gap-2 group">
            <div className="bg-purple-50/80 p-4 rounded-2xl group-hover:bg-purple-100 transition-colors w-full flex items-center justify-center aspect-square">
              <Bus className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-600">Add<br/>Vehicle</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
