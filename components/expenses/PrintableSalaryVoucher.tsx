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
          "bg-white text-black font-sans text-[15px] leading-tight w-full mx-auto p-2 antialiased",
          "print:block print:w-full print:p-2",
          "border border-black print:border-none rounded-none"
        )}
      >
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center mb-2">
          <h1 className="font-extrabold text-[22px] tracking-tight text-black uppercase font-outfit">
            RAHIM TRAVEL
          </h1>
          <p className="text-[14px] font-semibold text-black tracking-widest mt-1">
            SAFE JOURNEY, YOUR TRUST
          </p>
          <div className="text-[16px] font-semibold text-black my-1">
            ⎯⎯⎯⎯⎯⎯⎯⎯ ★ ⎯⎯⎯⎯⎯⎯⎯⎯
          </div>
        </div>

        {/* Title Banner */}
        <div className="border-t-2 border-b-2 border-black text-center font-extrabold text-[18px] py-2 tracking-wide mb-3 uppercase">
          {category === "Driver Salary" ? "SALARY PAYMENT VOUCHER" : "EXPENSE PAYMENT VOUCHER"}
        </div>

        {/* Fields List */}
        <div className="space-y-2 mb-4 text-[16px]">
          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold">Voucher No. :</span>
            <span className="font-mono font-semibold">{displayVoucherNo}</span>
          </div>
          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold">Date:</span>
            <span className="font-mono font-semibold">{date}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold min-w-[110px]">Title / Name :</span>
            <span className="font-extrabold text-[17px] truncate max-w-[200px]">{title}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold min-w-[110px]">Category :</span>
            <span className="font-semibold truncate max-w-[200px]">{category}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold min-w-[110px]">Month :</span>
            <span className="font-extrabold text-[17px]">{month}</span>
          </div>

          {vehicleNumber && (
            <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
              <span className="font-semibold min-w-[110px]">Vehicle Bus :</span>
              <span className="font-semibold">{vehicleNumber}</span>
            </div>
          )}

          {notes && notes !== "—" && (
            <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
              <span className="font-semibold min-w-[110px]">Remarks :</span>
              <span className="font-semibold italic truncate max-w-[200px]">{notes}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline border-b-2 border-black pb-1 pt-1.5">
            <span className="font-extrabold text-[18px]">Amount Paid :</span>
            <span className="font-extrabold text-[20px]">Rs. {amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Status Box & Authorized Signature */}
        <div className="flex items-center justify-between my-4 pt-2 border-t-2 border-black">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[16px]">STATUS :</span>
            <div className="border-2 border-dashed border-black px-2 py-0.5 rounded text-[18px] font-extrabold uppercase tracking-wider">
              PAID
            </div>
          </div>
          <div className="text-center mt-2">
            <div className="w-28 border-b-2 border-black mb-1"></div>
            <span className="text-[14px] font-semibold">Authorized Signature</span>
          </div>
        </div>

        {/* Notes / Footer Box */}
        <div className="border-2 border-black rounded-sm p-3 my-4">
          <div className="text-[15px] font-extrabold w-fit mb-1 uppercase">
            OFFICIAL RECORD
          </div>
          <p className="text-[14px] leading-snug font-semibold">
            This voucher serves as official proof of payment for transport operational expenses and driver salaries. Keep safely for audit.
          </p>
        </div>

        {/* Bottom Banner */}
        <div className="text-center font-extrabold text-[16px] py-2 mb-1 uppercase">
          RAHIM TRAVEL MANAGEMENT
        </div>

        <div className="text-center text-[13px] text-black font-semibold mt-2 border-t-2 border-dotted border-black pt-2 pb-2">
          Software provided by EagleNest Creations (0346-4451505)
        </div>
      </div>
    );
  }
);

PrintableSalaryVoucher.displayName = "PrintableSalaryVoucher";
