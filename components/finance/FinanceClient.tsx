"use client";

import { useState, useTransition } from "react";
import { FileText, CreditCard, Printer, ArrowUpRight, CheckCircle, Loader2, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrintableChallan } from "./PrintableChallan";
import { PrintablePaymentReceipt } from "./PrintablePaymentReceipt";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { cn } from "@/lib/utils";
import { generateChallans, receivePayment } from "@/app/actions";

type Challan = {
  id: string;
  studentId: string;
  month: string;
  amount: number;
  arrears: number;
  status: string;
  student: {
    name: string;
    fatherName: string;
    mobileNumber: string;
    class: string;
    route: { name: string } | null;
  };
};

type Payment = {
  id: string;
  amount: number;
  date: Date;
  method: string;
  student: { 
    name: string;
    class: string;
    route: { name: string } | null;
  };
  challan: { month: string };
};

const tabs = ["Overview", "Challans", "Payments", "Due"] as const;

export function FinanceClient({
  initialChallans,
  recentPayments,
  totalCollection,
  totalPending,
}: {
  initialChallans: Challan[];
  recentPayments: Payment[];
  totalCollection: number;
  totalPending: number;
}) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Overview");
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePrintChallan = (challan: Challan) => {
    setSelectedPayment(null);
    setSelectedChallan(challan);
    setTimeout(() => window.print(), 100);
  };

  const handlePrintReceipt = (payment: Payment) => {
    setSelectedChallan(null);
    setSelectedPayment(payment);
    setTimeout(() => window.print(), 100);
  };

  const handleGenerateChallans = () => {
    if (confirm("Generate new challans for all assigned students for next month?")) {
      startTransition(async () => {
        await generateChallans();
        alert("Challans generated successfully.");
      });
    }
  };

  const handleWhatsAppReminder = (challan: Challan) => {
    const totalDue = challan.amount + challan.arrears;
    const message = `Assalam o Alaikum ${challan.student.fatherName || challan.student.name},\n\nThis is a fee reminder from the Transport Department.\n\nStudent: ${challan.student.name}\nClass: ${challan.student.class}\nMonth: ${challan.month}\nAmount Due: Rs ${totalDue.toLocaleString()}\n\nPlease clear the pending dues at your earliest convenience. JazakAllah.`;
    const url = `https://wa.me/${challan.student.mobileNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleReceivePayment = (challanId: string, fullAmount: number, arrears: number) => {
    const totalDue = fullAmount + arrears;
    const input = prompt(`Enter payment amount (Total Due: Rs ${totalDue})`, totalDue.toString());
    
    if (input === null) return; // cancelled
    
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount entered.");
      return;
    }

    startTransition(async () => {
      await receivePayment(challanId, amount, "Cash");
    });
  };

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8 print:max-w-none print:p-0">
      {/* Header */}
      <div className="mb-5 print:hidden">
        <h2 className="text-lg font-bold font-outfit text-slate-900">Finance / Accounts</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-5 print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 text-xs font-semibold py-3 text-center transition-colors border-b-2",
              activeTab === tab
                ? "text-blue-600 border-blue-600"
                : "text-slate-400 border-transparent hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="print:hidden">
        {activeTab === "Overview" && (
          <div className="space-y-5">
            {/* This Month Overview */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-700 mb-1">This Month Overview</p>
              <p className="text-[10px] text-slate-400">Total Collection</p>
              <p className="text-2xl font-bold text-slate-900 font-outfit mt-1">Rs {totalCollection.toLocaleString()}</p>
              <div className="flex items-center text-[10px] mt-1 text-slate-500">
                <span className="flex items-center text-emerald-500 bg-emerald-50 px-1 rounded mr-1">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" /> 16%
                </span>
                from last month
              </div>
              <div className="mt-4 -mx-1">
                <OverviewChart />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-700 mb-4">Quick Actions</p>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={handleGenerateChallans} 
                  disabled={isPending}
                  className="flex flex-col items-center gap-2 group disabled:opacity-50"
                >
                  <div className="bg-blue-50 p-4 rounded-2xl group-hover:bg-blue-100 transition-colors">
                    {isPending ? <Loader2 className="h-6 w-6 text-blue-600 animate-spin" /> : <FileText className="h-6 w-6 text-blue-600" />}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">Generate<br />Challan</span>
                </button>
                <button onClick={() => setActiveTab("Challans")} className="flex flex-col items-center gap-2 group">
                  <div className="bg-green-50 p-4 rounded-2xl group-hover:bg-green-100 transition-colors">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">Record<br />Payment</span>
                </button>
                <button onClick={() => setActiveTab("Payments")} className="flex flex-col items-center gap-2 group">
                  <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-orange-100 transition-colors">
                    <Printer className="h-6 w-6 text-orange-500" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">Print<br />Receipt</span>
                </button>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-slate-700">Recent Payments</p>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">View All</span>
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
          <div className="space-y-3">
            {initialChallans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="bg-slate-100 p-4 rounded-2xl mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No challans</p>
                <p className="text-xs text-slate-400 mt-1">Generate challans to see them here.</p>
              </div>
            ) : (
              initialChallans.map((challan) => (
                <div key={challan.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{challan.student.name}</p>
                      <p className="text-[11px] text-slate-400">
                        Class {challan.student.class} · {challan.student.route?.name || "N/A"}
                      </p>
                    </div>
                    <Badge className="bg-red-50 text-red-500 border-red-100 shadow-none text-[9px]">
                      {challan.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900 font-outfit">Rs {(challan.amount + challan.arrears).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">{challan.month} {challan.arrears > 0 && <span className="text-red-500">(Includes Rs {challan.arrears} Arrears)</span>}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePrintChallan(challan)} className="rounded-lg border-slate-200 text-[10px] h-7 gap-1 px-2">
                        <Printer className="w-3 h-3" /> Print
                      </Button>
                      {challan.student.mobileNumber && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleWhatsAppReminder(challan)}
                          className="rounded-lg border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 text-[10px] h-7 gap-1 px-2"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        onClick={() => handleReceivePayment(challan.id, challan.amount, challan.arrears)}
                        disabled={isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] h-7 gap-1 px-2 disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Receive
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "Payments" && (
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="bg-slate-100 p-4 rounded-2xl mb-4">
                  <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No payments</p>
                <p className="text-xs text-slate-400 mt-1">Payments will appear here.</p>
              </div>
            ) : (
              recentPayments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{payment.student.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(payment.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-sm font-bold text-slate-900 font-outfit">Rs {payment.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                          {payment.method || "Cash"}
                        </span>
                        <button onClick={() => handlePrintReceipt(payment)} className="text-slate-400 hover:text-blue-600 transition-colors">
                          <Printer className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "Due" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
            <p className="text-lg font-bold text-red-500 font-outfit mb-1">Rs {totalPending.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Total pending dues across all students.</p>
          </div>
        )}
      </div>

      {/* Print container */}
      <div className="hidden print:block absolute top-0 left-0">
        {selectedChallan && (
          <PrintableChallan
            studentName={selectedChallan.student.name}
            className={selectedChallan.student.class}
            route={selectedChallan.student.route?.name || "N/A"}
            month={selectedChallan.month}
            fee={selectedChallan.amount + selectedChallan.arrears}
            status={selectedChallan.status}
          />
        )}
        {selectedPayment && (
          <PrintablePaymentReceipt
            studentName={selectedPayment.student.name}
            className={selectedPayment.student.class}
            route={selectedPayment.student.route?.name || "N/A"}
            month={selectedPayment.challan.month}
            amountPaid={selectedPayment.amount}
            date={new Date(selectedPayment.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            method={selectedPayment.method || "Cash"}
          />
        )}
      </div>
    </div>
  );
}
