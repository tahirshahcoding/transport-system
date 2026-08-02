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
          "bg-white text-black font-sans text-[13px] leading-tight w-full mx-auto p-2",
          "print:block print:w-full print:p-2",
          "border border-black print:border-none rounded-none"
        )}
      >
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center mb-2">
          <h1 className="font-extrabold text-[18px] tracking-tight text-black uppercase font-outfit">
            RAHIM TRAVEL
          </h1>
          <p className="text-[13px] font-semibold text-black tracking-widest mt-1">
            SAFE JOURNEY, YOUR TRUST
          </p>
          <div className="text-[14px] font-bold text-black my-1">
            ⎯⎯⎯⎯⎯⎯⎯⎯ ★ ⎯⎯⎯⎯⎯⎯⎯⎯
          </div>
        </div>

        {/* Dark Title Banner */}
        <div className="bg-black text-white text-center font-extrabold text-[15px] py-1 rounded-sm tracking-wide mb-3 uppercase">
          {category === "Driver Salary" ? "SALARY PAYMENT VOUCHER" : "EXPENSE PAYMENT VOUCHER"}
        </div>

        {/* Fields List */}
        <div className="space-y-1.5 mb-3 text-[14px]">
          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-bold">Voucher No. :</span>
            <span className="font-mono font-semibold">{displayVoucherNo}</span>
            <span className="font-bold ml-1">Date:</span>
            <span className="font-mono">{date}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-bold min-w-[90px]">Title / Name :</span>
            <span className="font-extrabold text-[14px] truncate max-w-[180px]">{title}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-bold min-w-[90px]">Category :</span>
            <span className="font-semibold truncate max-w-[180px]">{category}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-bold min-w-[90px]">Month :</span>
            <span className="font-bold">{month}</span>
          </div>

          {vehicleNumber && (
            <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
              <span className="font-bold min-w-[90px]">Vehicle Bus :</span>
              <span className="font-semibold">{vehicleNumber}</span>
            </div>
          )}

          {notes && notes !== "—" && (
            <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
              <span className="font-bold min-w-[90px]">Remarks :</span>
              <span className="font-medium italic truncate max-w-[180px]">{notes}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline border-b-2 border-black pb-1 pt-1">
            <span className="font-extrabold text-[15px]">Amount Paid :</span>
            <span className="font-extrabold text-[16px]">Rs. {amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Status Box & Authorized Signature */}
        <div className="flex items-center justify-between my-3 pt-2 border-t border-black">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[14px]">STATUS :</span>
            <div className="border-2 border-dashed border-black px-2 py-0.5 rounded text-[16px] font-extrabold uppercase">
              PAID
            </div>
          </div>
          <div className="text-center">
            <div className="w-24 border-b border-black mb-1"></div>
            <span className="text-[13px] font-bold">Authorized Signature</span>
          </div>
        </div>

        {/* Notes / Footer Box */}
        <div className="border border-black rounded-sm p-2 my-3">
          <div className="bg-black text-white text-[13px] font-extrabold px-2 py-1 rounded-sm w-fit mb-1.5 uppercase">
            OFFICIAL RECORD
          </div>
          <p className="text-[13px] leading-tight font-medium">
            This voucher serves as official proof of payment for transport operational expenses and driver salaries. Keep safely for audit.
          </p>
        </div>

        {/* Bottom Banner */}
        <div className="bg-black text-white text-center font-extrabold text-[14px] py-1.5 rounded-sm tracking-tight mb-2 uppercase">
          RAHIM TRAVEL MANAGEMENT
        </div>

        <div className="text-center text-[13px] font-bold text-black mb-1">
          ⎯⎯⎯⎯⎯ JAZAKALLAH ⎯⎯⎯⎯⎯
        </div>

        <div className="text-center text-[11px] text-black font-semibold mt-2 border-t border-dotted border-black pt-1 pb-2">
          Software provided by EagleNest Creations (0346-4451505)
        </div>
      </div>
    );
  }
);

PrintableSalaryVoucher.displayName = "PrintableSalaryVoucher";
