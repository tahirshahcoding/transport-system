"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ChallanProps {
  studentName: string;
  fatherName?: string;
  className?: string;
  studentClass?: string;
  route: string;
  month: string;
  fee: number;
  arrears?: number;
  status: string;
  instituteName?: string;
  receiptNo?: string;
  dueDate?: string;
}

export const PrintableChallan = forwardRef<HTMLDivElement, ChallanProps>(
  (
    {
      studentName,
      fatherName = "—",
      className,
      studentClass,
      route,
      month,
      fee,
      arrears = 0,
      status,
      instituteName = "General Campus",
      receiptNo,
      dueDate,
    },
    ref
  ) => {
    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

    const displayClass = studentClass || className || "—";
    const displayReceiptNo = receiptNo || `CH-${month.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${studentName.slice(0, 3).toUpperCase()}`;
    const totalAmount = fee + arrears;

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
          MONTHLY FEE CHALLAN
        </div>

        {/* Fields List */}
        <div className="space-y-2 mb-4 text-[16px]">
          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold">Receipt No. :</span>
            <span className="font-mono font-semibold">{displayReceiptNo}</span>
          </div>
          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold">Date:</span>
            <span className="font-mono font-semibold">{formattedDate}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold min-w-[110px]">Student Name :</span>
            <span className="font-extrabold text-[17px] truncate max-w-[200px]">{studentName}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold min-w-[110px]">Class / Grade :</span>
            <span className="font-semibold truncate max-w-[200px]">{displayClass}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold min-w-[110px]">Route / Stop :</span>
            <span className="font-semibold truncate max-w-[200px]">{route}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold min-w-[110px]">Month :</span>
            <span className="font-extrabold text-[17px]">{month}</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1">
            <span className="font-semibold min-w-[110px]">Monthly Fee :</span>
            <span className="font-semibold">Rs. {fee.toLocaleString()}</span>
          </div>

          {arrears > 0 && (
            <div className="flex justify-between items-baseline border-b border-dotted border-black pb-1 font-semibold">
              <span className="min-w-[110px]">Previous Arrears :</span>
              <span>Rs. {arrears.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline border-b-2 border-black pb-1 pt-1.5">
            <span className="font-extrabold text-[18px]">Total Amount (PKR) :</span>
            <span className="font-extrabold text-[20px]">Rs. {totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Status Box & Authorized Signature */}
        <div className="flex items-center justify-between my-4 pt-2 border-t-2 border-black">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[16px]">STATUS :</span>
            <div className="border-2 border-dashed border-black px-2 py-0.5 rounded text-[18px] font-extrabold uppercase tracking-wider">
              {status}
            </div>
          </div>
          <div className="text-center mt-2">
            <div className="w-28 border-b-2 border-black mb-1"></div>
            <span className="text-[14px] font-semibold">Authorized Signature</span>
          </div>
        </div>

        {/* Rules Box */}
        <div className="border-2 border-black rounded-sm p-3 my-4">
          <div className="text-[15px] font-extrabold w-fit mb-1 uppercase">
            IMPORTANT RULES
          </div>
          <ol className="list-decimal list-inside text-[14px] leading-snug space-y-1 font-semibold">
            <li>Fee must be paid before 4th of every month.</li>
          </ol>
        </div>

        {/* Bottom Banner */}
        <div className="text-center font-extrabold text-[16px] py-2 mb-1 uppercase">
          THANK YOU FOR TRAVELLING WITH US!
        </div>

        <div className="text-center text-[13px] text-black font-semibold mt-2 border-t-2 border-dotted border-black pt-2 pb-2">
          Software provided by EagleNest Creations (0346-4451505)
        </div>
      </div>
    );
  }
);

PrintableChallan.displayName = "PrintableChallan";
