"use client";

import { cn } from "@/lib/utils";

export function PrintablePaymentReceipt({
  studentName,
  fatherName = "—",
  className,
  studentClass,
  instituteName = "General Campus",
  route,
  month,
  amountPaid,
  date,
  method,
  receiptNo,
}: {
  studentName: string;
  fatherName?: string;
  className?: string;
  studentClass?: string;
  instituteName?: string;
  route: string;
  month: string;
  amountPaid: number;
  date: string;
  method: string;
  receiptNo?: string;
}) {
  const displayClass = studentClass || className || "—";
  const safeMonth = month || "N/A";
  const safeName = studentName || "Unknown";
  const displayReceiptNo = receiptNo || `PAY-${safeMonth.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${safeName.slice(0, 3).toUpperCase()}`;

  return (
    <div
      className={cn(
        "bg-white text-black font-sans text-[10px] leading-tight w-[58mm] mx-auto p-1.5",
        "print:block print:w-[58mm] print:p-1.5",
        "border border-slate-300 print:border-none rounded-none"
      )}
    >
      {/* Brand Header */}
      <div className="text-center flex flex-col items-center mb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain mb-0.5" />
        <h1 className="font-extrabold text-sm tracking-tight text-black uppercase font-outfit">
          RAHIM TRAVEL
        </h1>
        <p className="text-[8px] font-semibold text-black tracking-widest mt-0.5">
          SAFE JOURNEY, YOUR TRUST
        </p>
        <div className="text-[8px] font-bold text-black my-1">
          ⎯⎯⎯⎯⎯⎯⎯⎯ ★ ⎯⎯⎯⎯⎯⎯⎯⎯
        </div>
      </div>

      {/* Dark Title Banner */}
      <div className="bg-black text-white text-center font-extrabold text-[11px] py-1 rounded-sm tracking-wide mb-2 uppercase">
        MONTHLY FEE RECEIPT
      </div>

      {/* Fields List */}
      <div className="space-y-1 mb-2 text-[9.5px]">
        <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
          <span className="font-bold">Receipt No. :</span>
          <span className="font-mono font-semibold">{displayReceiptNo}</span>
          <span className="font-bold ml-1">Date:</span>
          <span className="font-mono">{date}</span>
        </div>

        <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
          <span className="font-bold min-w-[70px]">Student Name :</span>
          <span className="font-extrabold text-[10px] truncate max-w-[130px]">{studentName}</span>
        </div>

        <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
          <span className="font-bold min-w-[70px]">Father Name :</span>
          <span className="font-semibold truncate max-w-[130px]">{fatherName}</span>
        </div>

        <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
          <span className="font-bold min-w-[70px]">Class / Grade :</span>
          <span className="font-semibold truncate max-w-[130px]">{displayClass}</span>
        </div>

        <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
          <span className="font-bold min-w-[70px]">Institute :</span>
          <span className="font-semibold truncate max-w-[130px]">{instituteName}</span>
        </div>

        <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
          <span className="font-bold min-w-[70px]">Route / Stop :</span>
          <span className="font-semibold truncate max-w-[130px]">{route}</span>
        </div>

        <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
          <span className="font-bold min-w-[70px]">Month :</span>
          <span className="font-bold">{month}</span>
        </div>

        <div className="flex justify-between items-baseline border-b border-black pb-0.5 pt-0.5">
          <span className="font-extrabold text-[10px]">Amount Paid :</span>
          <span className="font-extrabold text-xs">Rs. {(amountPaid || 0).toLocaleString()} ({method || "Cash"})</span>
        </div>
      </div>

      {/* Status Box & Authorized Signature */}
      <div className="flex items-center justify-between my-2 pt-1 border-t border-black">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-[9px]">STATUS :</span>
          <div className="border-2 border-dashed border-black px-2 py-0.5 rounded text-[11px] font-extrabold uppercase">
            PAID
          </div>
        </div>
        <div className="text-center">
          <div className="w-20 border-b border-black mb-0.5"></div>
          <span className="text-[7.5px] font-bold">Authorized Signature</span>
        </div>
      </div>

      {/* Rules Box */}
      <div className="border border-black rounded-sm p-1.5 my-2">
        <div className="bg-black text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-xs w-fit mb-1 uppercase">
          IMPORTANT RULES
        </div>
        <ol className="list-decimal list-inside text-[7.5px] leading-tight space-y-0.5 font-medium">
          <li>Fee must be paid before 4th of every month.</li>
          <li>No late payment accepted after 4th.</li>
          <li>Show receipt to driver/staff when asked.</li>
          <li>This receipt is non-transferable.</li>
          <li>Keep receipt safe for verification.</li>
        </ol>
      </div>

      {/* Bottom Banner */}
      <div className="bg-black text-white text-center font-extrabold text-[8.5px] py-1 rounded-sm tracking-tight mb-1 uppercase">
        THANK YOU FOR TRAVELLING WITH US! ❤
      </div>

      <div className="text-center text-[8px] font-bold text-black">
        ⎯⎯⎯⎯⎯⎯⎯ JAZAKALLAH ⎯⎯⎯⎯⎯⎯⎯
      </div>

      <div className="text-center text-[7px] text-black font-semibold mt-1 border-t border-dotted border-black/40 pt-0.5">
        Software provided by EagleNest Creations (0346-4451505)
      </div>
    </div>
  );
}
