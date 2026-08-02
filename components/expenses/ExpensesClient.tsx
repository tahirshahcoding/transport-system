"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Receipt, Plus, Search, Trash2, Pencil, TrendingUp, TrendingDown, 
  Wallet, DollarSign, Bus, Calendar, Filter, Loader2, Wrench, Fuel, UserCheck, Droplet, FileText, CheckCircle2, Printer 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addExpense, updateExpense, deleteExpense } from "@/app/actions";
import { useAppDialog } from "@/components/ui/app-dialog";
import { cn, printPdf } from "@/lib/utils";
import { PrintableSalaryVoucher } from "./PrintableSalaryVoucher";

const EXPENSE_CATEGORIES = [
  { name: "Driver Salary", icon: UserCheck, color: "text-blue-600 bg-blue-50 border-blue-100" },
  { name: "Fuel", icon: Fuel, color: "text-amber-600 bg-amber-50 border-amber-100" },
  { name: "Maintenance", icon: Wrench, color: "text-purple-600 bg-purple-50 border-purple-100" },
  { name: "Oil & Filters", icon: Droplet, color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
  { name: "Repair", icon: Wrench, color: "text-rose-600 bg-rose-50 border-rose-100" },
  { name: "Office & Misc", icon: FileText, color: "text-slate-600 bg-slate-100 border-slate-200" },
] as const;

const MONTHS_LIST = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  month: string;
  date: Date;
  vehicleId: string | null;
  notes: string | null;
  vehicle: { registrationNumber: string } | null;
};

type Vehicle = {
  id: string;
  registrationNumber: string;
};

export function ExpensesClient({
  initialExpenses,
  availableVehicles = [],
  totalCollection = 0,
  allPayments = [],
}: {
  initialExpenses: Expense[];
  availableVehicles?: Vehicle[];
  totalCollection?: number;
  allPayments?: { amount: number; challan: { month: string } }[];
}) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [pendingExpenseId, setPendingExpenseId] = useState<string | null>(null);
  const [printingExpenseId, setPrintingExpenseId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialog = useAppDialog();

  const handlePrint = async (exp: Expense) => {
    setPrintingExpenseId(exp.id);
    try {
      await printPdf(`/api/pdf/expense?id=${exp.id}`, `expense-voucher-${exp.id}.pdf`);
    } finally {
      setPrintingExpenseId(null);
    }
  };

  const nowObj = new Date();
  const currentMonthName = nowObj.toLocaleString("default", { month: "long" });
  const currentYearNum = nowObj.getFullYear().toString();

  // Form states for Add/Edit
  const [expMonth, setExpMonth] = useState(currentMonthName);
  const [expYear, setExpYear] = useState(currentYearNum);

  const [editMonth, setEditMonth] = useState(currentMonthName);
  const [editYear, setEditYear] = useState(currentYearNum);

  useEffect(() => {
    if (editingExpense) {
      const parts = editingExpense.month.split(" ");
      if (parts.length === 2) {
        setEditMonth(parts[0]);
        setEditYear(parts[1]);
      } else if (parts.length === 1) {
        setEditMonth(parts[0]);
      }
    }
  }, [editingExpense]);

  const formatDateForInput = (d: Date | string) => {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return new Date().toISOString().split("T")[0];
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsOpen(true);
    }
  }, [searchParams]);

  const filteredExpenses = initialExpenses.filter((exp) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = q
      ? exp.title.toLowerCase().includes(q) ||
        (exp.notes && exp.notes.toLowerCase().includes(q)) ||
        (exp.vehicle && exp.vehicle.registrationNumber.toLowerCase().includes(q))
      : true;
    const matchesCategory = filterCategory ? exp.category === filterCategory : true;
    const matchesMonth = filterMonth ? exp.month === filterMonth : true;
    const matchesVehicle = filterVehicle ? exp.vehicleId === filterVehicle : true;
    return matchesSearch && matchesCategory && matchesMonth && matchesVehicle;
  });

  // Financial Calculations (Monthwise Aware)
  const displayRevenue = filterMonth
    ? allPayments.filter((p) => p.challan.month === filterMonth).reduce((s, p) => s + p.amount, 0)
    : totalCollection;

  const displayExpenses = filterMonth
    ? initialExpenses.filter((e) => e.month === filterMonth).reduce((s, e) => s + e.amount, 0)
    : filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const displayNetProfit = displayRevenue - displayExpenses;
  const displayIsProfit = displayNetProfit >= 0;
  const displayMarginPercent = displayRevenue > 0 ? Math.round((displayNetProfit / displayRevenue) * 100) : 0;

  const allExpensesSum = initialExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Compute category totals
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => {
    const targetSet = filterMonth ? initialExpenses.filter((e) => e.month === filterMonth) : initialExpenses;
    const sum = targetSet
      .filter((e) => e.category === cat.name)
      .reduce((acc, e) => acc + e.amount, 0);
    const count = targetSet.filter((e) => e.category === cat.name).length;
    const denominator = targetSet.reduce((acc, e) => acc + e.amount, 0);
    const percentage = denominator > 0 ? Math.round((sum / denominator) * 100) : 0;
    return { ...cat, sum, count, percentage };
  });

  // Unique months from expenses and payments
  const uniqueMonths = Array.from(
    new Set([...initialExpenses.map((e) => e.month), ...allPayments.map((p) => p.challan.month)])
  );

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const vehicleId = formData.get("vehicleId") as string;
    const notes = formData.get("notes") as string;
    const dateStr = formData.get("date") as string;
    const month = `${expMonth} ${expYear}`;

    startTransition(async () => {
      try {
        await addExpense({
          title,
          category,
          amount,
          month,
          vehicleId: vehicleId || undefined,
          notes: notes || undefined,
          date: dateStr || undefined,
        });
        setIsOpen(false);
        await dialog.showSuccess("Expense Recorded", `Added expense "${title}" (Rs ${amount.toLocaleString()}).`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to record expense.";
        await dialog.showAlert("Error", msg);
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingExpense) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const vehicleId = formData.get("vehicleId") as string;
    const notes = formData.get("notes") as string;
    const dateStr = formData.get("date") as string;

    const month = `${editMonth} ${editYear}`;

    startTransition(async () => {
      try {
        await updateExpense(editingExpense.id, {
          title,
          category,
          amount,
          month,
          vehicleId: vehicleId || undefined,
          notes: notes || undefined,
          date: dateStr || undefined,
        });
        setEditingExpense(null);
        await dialog.showSuccess("Expense Updated", `Updated "${title}".`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update expense.";
        await dialog.showAlert("Error", msg);
      }
    });
  };

  const handleDelete = async (exp: Expense) => {
    const confirmed = await dialog.showConfirm(
      "Delete Expense",
      `Are you sure you want to delete "${exp.title}" (Rs ${exp.amount.toLocaleString()})?`
    );
    if (confirmed) {
      setPendingExpenseId(exp.id);
      startTransition(async () => {
        try {
          await deleteExpense(exp.id);
        } finally {
          setPendingExpenseId(null);
        }
      });
    }
  };

  return (
    <>
      <div className="px-4 pt-4 pb-8 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8 space-y-6 print:hidden">
        {/* Top Bar Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-outfit text-slate-900">Expenses & Profitability</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track operational costs, salaries & net income.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 text-xs font-bold transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Add Expense
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] rounded-3xl border-slate-100 p-6 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-outfit text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-rose-600" />
                  Record New Expense
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-slate-700">Expense Title</Label>
                  <Input id="title" name="title" placeholder="E.g. Driver Monthly Salary / Oil Change" required className="rounded-xl bg-slate-50 border-slate-200 h-10 text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-semibold text-slate-700">Category</Label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs font-semibold text-slate-700">Amount (Rs)</Label>
                    <Input id="amount" name="amount" type="number" step="any" placeholder="E.g. 25000" required className="rounded-xl bg-slate-50 border-slate-200 h-10 text-xs font-bold text-slate-900" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Target Month</Label>
                    <select
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value)}
                    >
                      {MONTHS_LIST.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Year</Label>
                    <select
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                    >
                      {["2025", "2026", "2027", "2028"].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleId" className="text-xs font-semibold text-slate-700">Tag Vehicle (Optional)</Label>
                    <select
                      id="vehicleId"
                      name="vehicleId"
                      className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                    >
                      <option value="">-- General / No Vehicle --</option>
                      {availableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs font-semibold text-slate-700">Expense Date</Label>
                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="rounded-xl bg-slate-50 border-slate-200 h-10 text-xs" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">Notes / Details (Optional)</Label>
                  <Input id="notes" name="notes" placeholder="E.g. Paid to Driver Ahmad via JazzCash" className="rounded-xl bg-slate-50 border-slate-200 h-10 text-xs" />
                </div>

                <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 font-bold text-xs shadow-md shadow-rose-600/20" disabled={isPending}>
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Save Expense Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 3 KPI Bar Cards: Revenue, Expenses, Net Profit / Loss */}
        <div className="grid grid-cols-3 gap-3">
          {/* Revenue */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5 text-emerald-600">
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-slate-900 font-outfit">Rs {displayRevenue.toLocaleString()}</p>
            <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
              {filterMonth || "All Time"}
            </span>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5 text-rose-600">
              <Receipt className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Expenses</span>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-slate-900 font-outfit">Rs {displayExpenses.toLocaleString()}</p>
            <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-1">
              {filteredExpenses.length} Items
            </span>
          </div>

          {/* Net Profit / Loss */}
          <div className={cn(
            "rounded-2xl border p-4 shadow-sm text-center transition-all",
            displayIsProfit ? "bg-emerald-950 text-white border-emerald-900" : "bg-rose-950 text-white border-rose-900"
          )}>
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              {displayIsProfit ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {displayIsProfit ? "Net Profit" : "Net Loss"}
              </span>
            </div>
            <p className={cn("text-xl md:text-2xl font-extrabold font-outfit", displayIsProfit ? "text-emerald-400" : "text-rose-400")}>
              {displayIsProfit ? `Rs ${displayNetProfit.toLocaleString()}` : `-Rs ${Math.abs(displayNetProfit).toLocaleString()}`}
            </p>
            <span className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1",
              displayIsProfit ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            )}>
              {displayIsProfit ? `+${displayMarginPercent}% Margin` : `Loss (-${Math.abs(displayMarginPercent)}%)`}
            </span>
          </div>
        </div>

        {/* Category Breakdown Progress Grid */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">Expense Breakdown by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryTotals.map((cat) => (
              <div key={cat.name} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("p-1.5 rounded-lg border", cat.color)}>
                      <cat.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{cat.percentage}%</span>
                </div>
                <p className="text-sm font-extrabold text-slate-900 font-outfit">Rs {cat.sum.toLocaleString()}</p>
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-700 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Expense Dialog */}
        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <DialogContent className="sm:max-w-[440px] rounded-3xl border-slate-100 p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-outfit text-lg flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Edit Expense Record
              </DialogTitle>
            </DialogHeader>
            {editingExpense && (
              <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-title" className="text-xs font-semibold text-slate-700">Expense Title</Label>
                  <Input id="edit-title" name="title" defaultValue={editingExpense.title} required className="rounded-xl bg-slate-50 border-slate-200 h-10 text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-category" className="text-xs font-semibold text-slate-700">Category</Label>
                    <select
                      id="edit-category"
                      name="category"
                      defaultValue={editingExpense.category}
                      required
                      className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-amount" className="text-xs font-semibold text-slate-700">Amount (Rs)</Label>
                    <Input id="edit-amount" name="amount" type="number" step="any" defaultValue={editingExpense.amount} required className="rounded-xl bg-slate-50 border-slate-200 h-10 text-xs font-bold text-slate-900" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Target Month</Label>
                    <select
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={editMonth}
                      onChange={(e) => setEditMonth(e.target.value)}
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
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                    >
                      {["2025", "2026", "2027", "2028"].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-vehicleId" className="text-xs font-semibold text-slate-700">Tag Vehicle (Optional)</Label>
                    <select
                      id="edit-vehicleId"
                      name="vehicleId"
                      defaultValue={editingExpense.vehicleId || ""}
                      className="w-full rounded-xl bg-slate-50 border-slate-200 h-10 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                    >
                      <option value="">-- General / No Vehicle --</option>
                      {availableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-date" className="text-xs font-semibold text-slate-700">Expense Date</Label>
                    <Input id="edit-date" name="date" type="date" defaultValue={formatDateForInput(editingExpense.date)} className="rounded-xl bg-slate-50 border-slate-200 h-10 text-xs" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-notes" className="text-xs font-semibold text-slate-700">Notes / Details (Optional)</Label>
                  <Input id="edit-notes" name="notes" defaultValue={editingExpense.notes || ""} className="rounded-xl bg-slate-50 border-slate-200 h-10 text-xs" />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-bold text-xs shadow-md shadow-blue-600/20" disabled={isPending}>
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Update Expense Record"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses by title or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
            {(search || filterCategory || filterMonth || filterVehicle) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterCategory("");
                  setFilterMonth("");
                  setFilterVehicle("");
                }}
                className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 h-9 rounded-xl transition-colors shrink-0"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select
              className="w-full rounded-xl bg-slate-50 border-transparent h-9 px-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              className="w-full rounded-xl bg-slate-50 border-transparent h-9 px-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              className="w-full rounded-xl bg-slate-50 border-transparent h-9 px-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
            >
              <option value="">All Vehicles</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registrationNumber}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="bg-rose-50 p-4 rounded-2xl mb-3">
              <Receipt className="w-8 h-8 text-rose-400" />
            </div>
            <p className="text-sm font-bold text-slate-800 font-outfit">No expense records found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {initialExpenses.length === 0
                ? "Start by adding your operational costs such as driver salaries, fuel, or vehicle maintenance."
                : "Try adjusting your search query or dropdown filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((exp) => {
              const catObj = EXPENSE_CATEGORIES.find((c) => c.name === exp.category) || EXPENSE_CATEGORIES[5];
              const Icon = catObj.icon;

              return (
                <div key={exp.id} className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex items-start gap-3.5 hover:border-slate-200 transition-all">
                  <div className={cn("p-3 rounded-2xl shrink-0 mt-0.5 border", catObj.color)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 font-outfit">{exp.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                            {exp.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {exp.month}
                          </span>
                          {exp.vehicle && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                              <Bus className="w-2.5 h-2.5" /> {exp.vehicle.registrationNumber}
                            </span>
                          )}
                        </div>
                        {exp.notes && (
                          <p className="text-[11px] text-slate-500 mt-1.5 italic">
                            &ldquo;{exp.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-base font-extrabold text-rose-600 font-outfit">
                          - Rs {exp.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(exp.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handlePrint(exp)}
                        disabled={printingExpenseId === exp.id}
                        className="text-[10px] font-semibold text-slate-700 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {printingExpenseId === exp.id ? <Loader2 className="w-3 h-3 text-purple-600 animate-spin" /> : <Printer className="w-3 h-3 text-purple-600" />}
                        {printingExpenseId === exp.id ? "Printing..." : "Print Voucher"}
                      </button>

                      <button
                        onClick={() => setEditingExpense(exp)}
                        className="text-[10px] font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(exp)}
                        disabled={pendingExpenseId === exp.id}
                        className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {pendingExpenseId === exp.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </>
  );
}
