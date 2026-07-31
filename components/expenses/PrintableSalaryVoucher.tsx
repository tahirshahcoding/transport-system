"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SalaryVoucherProps {
  title: string;
  category: string;
  amount: number;
  month: string;
  date: string;
  vehicleNumber?: string;
  notes?: string;
  voucherNo?: string;
}

export const PrintableSalaryVoucher = forwardRef<HTMLDivElement, SalaryVoucherProps>(
  (
    {
      title,
      category,
      amount,
      month,
      date,
      vehicleNumber,
      notes = "—",
      voucherNo,
    },
    ref
  ) => {
    const displayVoucherNo = voucherNo || `VCH-${Math.floor(1000 + Math.random() * 9000)}`;

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white text-black font-sans text-[10px] leading-tight w-[58mm] mx-auto p-1.5",
          "print:block print:absolute print:left-0 print:top-0 print:w-[58mm] print:m-0 print:p-1.5",
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
        <div className="bg-black text-white text-center font-extrabold text-[10.5px] py-1 rounded-sm tracking-wide mb-2 uppercase">
          {category === "Driver Salary" ? "SALARY PAYMENT VOUCHER" : "EXPENSE PAYMENT VOUCHER"}
        </div>

        {/* Fields List */}
        <div className="space-y-1 mb-2 text-[9.5px]">
          <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
            <span className="font-bold">Voucher No. :</span>
            <span className="font-mono font-semibold">{displayVoucherNo}</span>
            <span className="font-bold ml-1">Date:</span>
            <span className="font-mono">{date}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
            <span className="font-bold min-w-[70px]">Title / Name :</span>
            <span className="font-extrabold text-[10px] truncate max-w-[130px]">{title}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
            <span className="font-bold min-w-[70px]">Category :</span>
            <span className="font-semibold truncate max-w-[130px]">{category}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
            <span className="font-bold min-w-[70px]">Month :</span>
            <span className="font-bold">{month}</span>
          </div>

          {vehicleNumber && (
            <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
              <span className="font-bold min-w-[70px]">Vehicle Bus :</span>
              <span className="font-semibold">{vehicleNumber}</span>
            </div>
          )}

          {notes && notes !== "—" && (
            <div className="flex justify-between items-baseline border-b border-dotted border-black/40 pb-0.5">
              <span className="font-bold min-w-[70px]">Remarks :</span>
              <span className="font-medium italic truncate max-w-[130px]">{notes}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline border-b border-black pb-0.5 pt-0.5">
            <span className="font-extrabold text-[10px]">Amount Paid :</span>
            <span className="font-extrabold text-xs">Rs. {amount.toLocaleString()}</span>
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

        {/* Notes / Footer Box */}
        <div className="border border-black rounded-sm p-1.5 my-2">
          <div className="bg-black text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-xs w-fit mb-1 uppercase">
            OFFICIAL RECORD
          </div>
          <p className="text-[7.5px] leading-tight font-medium">
            This voucher serves as official proof of payment for transport operational expenses and driver salaries. Keep safely for audit.
          </p>
        </div>

        {/* Bottom Banner */}
        <div className="bg-black text-white text-center font-extrabold text-[8.5px] py-1 rounded-sm tracking-tight mb-1 uppercase">
          RAHIM TRAVEL MANAGEMENT
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
);

PrintableSalaryVoucher.displayName = "PrintableSalaryVoucher";
