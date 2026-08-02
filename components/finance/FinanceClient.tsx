"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FileText, CreditCard, Printer, ArrowUpRight, CheckCircle, Loader2, MessageCircle, Send, Calendar, Search, Trash2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PrintableChallan } from "./PrintableChallan";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { cn, printImage } from "@/lib/utils";
import { generateChallans, receivePayment, deleteChallan } from "@/app/actions";
import { useAppDialog } from "@/components/ui/app-dialog";

type Challan = {
  id: string;
  studentId: string;
  month: string;
  amount: number;
  arrears: number;
  status: string;
  dueDate: Date | null;
  student: {
    name: string;
    fatherName: string;
    mobileNumber: string;
    class: string;
    institute?: { name: string } | null;
    route: { name: string } | null;
  };
  payments: { amount: number }[];
};

type Payment = {
  id: string;
  amount: number;
  date: Date;
  method: string;
  student: { 
    name: string;
    fatherName?: string;
    class: string;
    institute?: { name: string } | null;
    route: { name: string } | null;
  };
  challan: { id: string; month: string };
};

const tabs = ["Overview", "Challans", "Payments"] as const;

export function FinanceClient({
  allChallans,
  allPayments,
  uniqueMonths,
  totalCollection,
  totalPending,
}: {
  allChallans: Challan[];
  allPayments: Payment[];
  uniqueMonths: string[];
  totalCollection: number;
  totalPending: number;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as typeof tabs[number];
  const initialTab = tabParam && tabs.includes(tabParam) ? tabParam : "Overview";
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>(initialTab);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentModalChallan, setPaymentModalChallan] = useState<Challan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [pendingChallanId, setPendingChallanId] = useState<string | null>(null);
  const [printingChallanId, setPrintingChallanId] = useState<string | null>(null);
  const [printingPaymentId, setPrintingPaymentId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialog = useAppDialog();
  const handlePrintChallan = async (challan: Challan) => {
    setSelectedPayment(null);
    setSelectedChallan(challan);
    setPrintingChallanId(challan.id);
    try {
      await printImage(`/api/print/challan?id=${challan.id}`, `challan-${challan.id}.png`);
    } finally {
      setPrintingChallanId(null);
    }
  };

  const handlePrintReceipt = async (payment: Payment) => {
    setSelectedChallan(null);
    setSelectedPayment(payment);
    setPrintingPaymentId(payment.id);
    try {
      await printImage(`/api/print/challan?id=${payment.challan.id}`, `receipt-${payment.id}.png`);
    } finally {
      setPrintingPaymentId(null);
    }
  };

  const handleDeleteChallan = async (challan: Challan) => {
    const confirmed = await dialog.showConfirm(
      "Delete Fee Challan",
      `Are you sure you want to delete this challan for ${challan.student.name} (${challan.month})? All recorded payments for it will also be deleted.`
    );
    if (confirmed) {
      setPendingChallanId(challan.id);
      startTransition(async () => {
        try {
          await deleteChallan(challan.id);
        } finally {
          setPendingChallanId(null);
        }
      });
    }
  };

  // Filters
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredChallans = allChallans.filter(c => {
    const q = search.trim().toLowerCase();
    const matchesSearch = q ? (c.student.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) : true;
    const matchesMonth = filterMonth ? c.month === filterMonth : true;
    const matchesStatus = filterStatus ? c.status === filterStatus : true;
    return matchesSearch && matchesMonth && matchesStatus;
  });

  const filteredPayments = allPayments.filter(p => {
    const q = search.trim().toLowerCase();
    return q ? (p.student.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) : true;
  });

  const recentPayments = allPayments.slice(0, 5);

  const MONTHS_LIST = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const nowObj = new Date();
  const currentMonthName = nowObj.toLocaleString('default', { month: 'long' });
  const currentYearNum = nowObj.getFullYear().toString();

  // Generate Challan Modal State
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [genMonth, setGenMonth] = useState(currentMonthName);
  const [genYear, setGenYear] = useState(currentYearNum);

  // Group filtered challans by month
  const groupedChallans = filteredChallans.reduce((acc, challan) => {
    const m = challan.month;
    if (!acc[m]) acc[m] = [];
    acc[m].push(challan);
    return acc;
  }, {} as Record<string, Challan[]>);

  const handleOpenGenerateModal = () => {
    setIsGenModalOpen(true);
  };

  const handleConfirmGenerate = () => {
    const monthYear = `${genMonth} ${genYear}`;
    startTransition(async () => {
      const res = await generateChallans(monthYear);
      setIsGenModalOpen(false);
      await dialog.showSuccess(
        "Challans Generated",
        `Challans generated for ${monthYear}! ${res.created} created, ${res.skipped} skipped (already existing).`
      );
    });
  };

  const handleWhatsAppReminder = async (challan: Challan) => {
    let phone = challan.student.mobileNumber;
    if (!phone) {
      const input = await dialog.showPrompt(
        "Enter WhatsApp Number",
        "This student has no mobile number saved.",
        "E.g. 923001234567"
      );
      if (!input) return;
      phone = input.trim();
    }

    // Clean phone number format for WhatsApp API
    phone = phone.replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) {
      phone = "92" + phone.slice(1);
    }
    const amount = challan.amount;
    const arrears = challan.arrears;
    const totalPaid = challan.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDue = amount + arrears;
    const remaining = totalDue - totalPaid;

    let breakdownText = `• Monthly Fee: Rs ${amount.toLocaleString()}`;
    if (arrears > 0) {
      breakdownText += `\n• Previous Arrears: Rs ${arrears.toLocaleString()}`;
    }
    if (totalPaid > 0) {
      breakdownText += `\n• Amount Paid: Rs ${totalPaid.toLocaleString()}`;
    }

    const message = `Assalam o Alaikum ${challan.student.fatherName || challan.student.name},\n\nThis is a fee reminder from the Transport Department.\n\nStudent: ${challan.student.name}\nClass: ${challan.student.class}\nMonth: ${challan.month}\n\n${breakdownText}\n━━━━━━━━━━━━━━━━━━\nRemaining Balance: Rs ${remaining.toLocaleString()}\n\nPlease clear the pending dues at your earliest convenience. JazakAllah.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const openPaymentModal = (challan: Challan) => {
    const totalPaid = challan.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = challan.amount + challan.arrears - totalPaid;
    setPaymentModalChallan(challan);
    setPaymentAmount(remaining.toString());
    setPaymentMethod("Cash");
  };

  const handleConfirmPayment = () => {
    if (!paymentModalChallan) return;
    const amount = parseFloat(paymentAmount);
    const totalPaid = paymentModalChallan.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = paymentModalChallan.amount + paymentModalChallan.arrears - totalPaid;

    if (isNaN(amount) || amount <= 0) {
      dialog.showAlert("Invalid Amount", "Please enter a valid amount greater than zero.");
      return;
    }

    if (amount > remaining) {
      dialog.showAlert("Amount Too High", `Payment of Rs ${amount} exceeds remaining due of Rs ${remaining}.`);
      return;
    }

    startTransition(async () => {
      await receivePayment(paymentModalChallan.id, amount, paymentMethod);
      setPaymentModalChallan(null);
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-50 text-green-600 border-green-100 shadow-none text-[9px]">PAID</Badge>;
      case "PARTIAL":
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 shadow-none text-[9px]">PARTIAL</Badge>;
      default:
        return <Badge className="bg-red-50 text-red-500 border-red-100 shadow-none text-[9px]">UNPAID</Badge>;
    }
  };

  // Summary counts
  const unpaidCount = allChallans.filter(c => c.status === "UNPAID").length;
  const partialCount = allChallans.filter(c => c.status === "PARTIAL").length;
  const paidCount = allChallans.filter(c => c.status === "PAID").length;

  return (
    <>
      <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8 print:hidden">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold font-outfit text-slate-900">Finance / Accounts</h2>
        </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-5 print:hidden">
        {tabs.map((tab) => {
          let badgeCount = null;
          if (tab === "Challans") badgeCount = allChallans.length;
          if (tab === "Payments") badgeCount = allPayments.length;

          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearch("");
                setFilterMonth("");
                setFilterStatus("");
              }}
              className={cn(
                "flex-1 text-xs font-semibold py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5",
                activeTab === tab
                  ? "text-blue-600 border-blue-600"
                  : "text-slate-400 border-transparent hover:text-slate-600"
              )}
            >
              <span>{tab}</span>
              {badgeCount !== null && (
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded-full font-bold",
                  activeTab === tab ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                )}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="print:hidden">
        {activeTab === "Overview" && (
          <div className="space-y-5">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
                <p className="text-[10px] text-slate-400 mb-1">Unpaid</p>
                <p className="text-xl font-bold text-red-500 font-outfit">{unpaidCount}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
                <p className="text-[10px] text-slate-400 mb-1">Partial</p>
                <p className="text-xl font-bold text-amber-500 font-outfit">{partialCount}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
                <p className="text-[10px] text-slate-400 mb-1">Paid</p>
                <p className="text-xl font-bold text-green-500 font-outfit">{paidCount}</p>
              </div>
            </div>

            {/* This Month Overview */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-700">Collection Summary</p>
              </div>
              <p className="text-[10px] text-slate-400">Total Collected</p>
              <p className="text-2xl font-bold text-slate-900 font-outfit mt-1">Rs {totalCollection.toLocaleString()}</p>
              <div className="flex items-center text-[10px] mt-1 text-slate-500">
                <span className="text-red-500 font-semibold">Rs {totalPending.toLocaleString()}</span>
                <span className="ml-1">still pending</span>
              </div>
              <div className="mt-4 -mx-1">
                <OverviewChart data={allPayments.slice().reverse().map(p => ({
                  name: p.challan.month.split(" ")[0].slice(0, 3),
                  total: p.amount
                }))} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-700 mb-4">Quick Actions</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <button 
                  onClick={handleOpenGenerateModal} 
                  disabled={isPending}
                  className="flex flex-col items-center gap-2 group disabled:opacity-50"
                >
                  <div className="bg-blue-50 p-3.5 rounded-2xl group-hover:bg-blue-100 transition-colors w-full flex items-center justify-center aspect-square">
                    {isPending ? <Loader2 className="h-5 w-5 text-blue-600 animate-spin" /> : <FileText className="h-5 w-5 text-blue-600" />}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">Generate<br />Challans</span>
                </button>
                <button onClick={() => setActiveTab("Challans")} className="flex flex-col items-center gap-2 group">
                  <div className="bg-green-50 p-3.5 rounded-2xl group-hover:bg-green-100 transition-colors w-full flex items-center justify-center aspect-square">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">Record<br />Payment</span>
                </button>
                <button onClick={() => setActiveTab("Payments")} className="flex flex-col items-center gap-2 group">
                  <div className="bg-orange-50 p-3.5 rounded-2xl group-hover:bg-orange-100 transition-colors w-full flex items-center justify-center aspect-square">
                    <Printer className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">Payment<br />History</span>
                </button>
                <a href="/expenses" className="flex flex-col items-center gap-2 group">
                  <div className="bg-rose-50 p-3.5 rounded-2xl group-hover:bg-rose-100 transition-colors w-full flex items-center justify-center aspect-square">
                    <Receipt className="h-5 w-5 text-rose-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">Manage<br />Expenses</span>
                </a>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-slate-700">Recent Payments</p>
                <button onClick={() => setActiveTab("Payments")} className="text-[10px] text-blue-600 font-semibold cursor-pointer">View All</button>
              </div>
              {recentPayments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No payments yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between">
                      <span className="text-xs text-slate-700 font-medium">{payment.student.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-900">Rs {payment.amount.toLocaleString()}</span>
                        <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                          {payment.method || "Cash"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(payment.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Challans" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name or challan ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select 
                  className="w-full rounded-xl bg-slate-50 border-transparent h-9 px-3 text-[11px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  className="w-full rounded-xl bg-slate-50 border-transparent h-9 px-3 text-[11px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
            </div>

            {/* Challan List (Grouped Month-wise) */}
            {Object.keys(groupedChallans).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="bg-slate-100 p-4 rounded-2xl mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No challans found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or generate new challans.</p>
              </div>
            ) : (
              Object.entries(groupedChallans).map(([monthGroup, challansInMonth]) => {
                const monthTotalAmount = challansInMonth.reduce((sum, c) => sum + c.amount + c.arrears, 0);
                const monthUnpaid = challansInMonth.filter(c => c.status === "UNPAID").length;
                const monthPaid = challansInMonth.filter(c => c.status === "PAID").length;

                return (
                  <div key={monthGroup} className="space-y-3 mb-6">
                    {/* Month Group Header */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600/30 p-2 rounded-xl border border-blue-500/30">
                          <Calendar className="w-4 h-4 text-blue-300" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm font-outfit tracking-wide">{monthGroup}</h3>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {challansInMonth.length} Challan{challansInMonth.length > 1 ? "s" : ""} · Total Rs {monthTotalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {monthUnpaid > 0 && (
                          <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                            {monthUnpaid} Unpaid
                          </span>
                        )}
                        {monthPaid > 0 && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            {monthPaid} Paid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Challan Cards for this Month */}
                    <div className="space-y-3">
                      {challansInMonth.map((challan) => {
                        const totalPaid = challan.payments.reduce((sum, p) => sum + p.amount, 0);
                        const totalDue = challan.amount + challan.arrears;
                        const remaining = totalDue - totalPaid;
                        const isOverdue = challan.dueDate && new Date(challan.dueDate) < new Date() && challan.status !== "PAID";

                        return (
                          <div key={challan.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${isOverdue ? "border-red-200" : "border-slate-100"}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-bold text-sm text-slate-900">{challan.student.name}</p>
                                <p className="text-[11px] text-slate-400">
                                  S/O {challan.student.fatherName || "—"} · Class {challan.student.class} · {challan.student.route?.name || "N/A"}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {getStatusBadge(challan.status)}
                                {isOverdue && (
                                  <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">OVERDUE</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div>
                                <p className="text-lg font-bold text-slate-900 font-outfit">Rs {totalDue.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400">
                                  {challan.month}
                                  {totalPaid > 0 && <span className="text-green-600 ml-1">(Paid: Rs {totalPaid.toLocaleString()})</span>}
                                  {challan.arrears > 0 && <span className="text-red-500 ml-1">(Arrears: Rs {challan.arrears.toLocaleString()})</span>}
                                </p>
                                {challan.dueDate && (
                                  <p className="text-[10px] text-slate-400">
                                    Due: {new Date(challan.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1.5 flex-wrap justify-end">
                                <Button variant="outline" size="sm" onClick={() => handlePrintChallan(challan)} disabled={printingChallanId === challan.id} className="rounded-xl border-slate-300 text-xs font-bold h-8 gap-1.5 px-3 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 shadow-xs">
                                  {printingChallanId === challan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                                  {printingChallanId === challan.id ? "Printing..." : "Print"}
                                </Button>
                                {challan.status !== "PAID" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleWhatsAppReminder(challan)}
                                    className="rounded-lg border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 text-[10px] h-7 gap-1 px-2"
                                  >
                                    <Send className="w-3 h-3" /> WhatsApp
                                  </Button>
                                )}
                                {challan.status !== "PAID" && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => openPaymentModal(challan)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] h-7 gap-1 px-2.5 font-semibold"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Receive
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteChallan(challan)}
                                  disabled={pendingChallanId === challan.id}
                                  title="Delete Challan"
                                  className="rounded-lg border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 text-[10px] h-7 px-2 disabled:opacity-50"
                                >
                                  {pendingChallanId === challan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "Payments" && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search payment by student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="bg-slate-100 p-4 rounded-2xl mb-4">
                  <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No payments found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms.</p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{payment.student.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {payment.challan.month} · {new Date(payment.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-sm font-bold text-slate-900 font-outfit">Rs {payment.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                          {payment.method || "Cash"}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(payment)} disabled={printingPaymentId === payment.id} className="rounded-xl border-slate-300 text-xs font-bold h-8 gap-1.5 px-3 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 shadow-xs">
                          {printingPaymentId === payment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                          {printingPaymentId === payment.id ? "Printing..." : "Print Receipt"}
                        </Button>
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Receive Payment Modal */}
      <Dialog open={!!paymentModalChallan} onOpenChange={(open) => !open && setPaymentModalChallan(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="font-outfit text-lg">Record Payment</DialogTitle>
          </DialogHeader>
          {paymentModalChallan && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="font-bold text-sm text-slate-900">{paymentModalChallan.student.name}</p>
                <p className="text-xs text-slate-500">
                  Month: {paymentModalChallan.month} · Class {paymentModalChallan.student.class}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Payment Amount (Rs)</label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="rounded-xl bg-slate-50 border-slate-200 h-10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <Button
                onClick={handleConfirmPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-semibold"
                disabled={isPending}
              >
                {isPending ? "Recording..." : "Confirm & Save Payment"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>

      {/* Print container — MUST be outside the print:hidden div */}
      <div className="hidden print:block font-sans text-black">
        {selectedChallan && (
          <PrintableChallan
            studentName={selectedChallan.student.name}
            fatherName={selectedChallan.student.fatherName || "—"}
            studentClass={selectedChallan.student.class}
            instituteName={selectedChallan.student.institute?.name || "General Campus"}
            route={selectedChallan.student.route?.name || "N/A"}
            month={selectedChallan.month}
            fee={selectedChallan.amount}
            arrears={selectedChallan.arrears}
            status={selectedChallan.status}
            receiptNo={`CH-${selectedChallan.id.slice(-6).toUpperCase()}`}
          />
          />
        )}
      </div>
      {/* Generate Challans Month Selection Modal */}
      <Dialog open={isGenModalOpen} onOpenChange={setIsGenModalOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border-slate-100 p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="font-outfit text-lg flex items-center gap-2 text-slate-900">
              <Calendar className="w-5 h-5 text-blue-600" />
              Select Month for Challans
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500 leading-relaxed">
              Select the month and year you wish to generate fee challans for. Students with existing challans in the selected month will be skipped.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Month</Label>
                <select
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                >
                  {MONTHS_LIST.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Year</Label>
                <select
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={genYear}
                  onChange={(e) => setGenYear(e.target.value)}
                >
                  {["2025", "2026", "2027", "2028"].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50/70 rounded-2xl p-3 border border-blue-100 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700 font-medium">
                Challans will be created for <strong className="font-bold">{genMonth} {genYear}</strong> with due date 15th {genMonth}.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setIsGenModalOpen(false)} className="rounded-xl h-10 text-xs font-semibold px-4 border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleConfirmGenerate} disabled={isPending} className="rounded-xl h-10 text-xs font-semibold px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Generate {genMonth} Challans
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  </>
);
}
