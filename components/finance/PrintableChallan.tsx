"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ChallanProps {
  studentName: string;
  className: string;
  route: string;
  month: string;
  fee: number;
  status: string;
  instituteName?: string;
}

export const PrintableChallan = forwardRef<HTMLDivElement, ChallanProps>(
  ({ studentName, className, route, month, fee, status, instituteName = "ABC SCHOOL" }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "bg-white text-black font-mono text-xs leading-tight w-[58mm] mx-auto p-2",
          "print:block print:absolute print:left-0 print:top-0 print:w-[58mm] print:m-0 print:p-0",
          "border border-slate-200 print:border-none rounded-md print:rounded-none"
        )}
      >
        <div className="flex flex-col items-center mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain mb-1" />
          <div className="text-center font-bold text-sm">{instituteName}</div>
        </div>
        <div className="text-center mb-2">Transport Fee Challan</div>
        
        <div className="border-t border-dashed border-black my-2"></div>
        
        <div className="flex justify-between mb-1">
          <span>Student:</span>
        </div>
        <div className="font-bold mb-2">{studentName}</div>
        
        <div className="flex justify-between mb-1">
          <span>Class:</span>
        </div>
        <div className="font-bold mb-2">{className}</div>
        
        <div className="flex justify-between mb-1">
          <span>Route:</span>
        </div>
        <div className="font-bold mb-2">{route}</div>
        
        <div className="flex justify-between mb-1">
          <span>Month:</span>
        </div>
        <div className="font-bold mb-2">{month}</div>
        
        <div className="flex justify-between mb-1">
          <span>Fee:</span>
        </div>
        <div className="font-bold mb-2">Rs. {fee.toLocaleString()}</div>
        
        <div className="flex justify-between mb-1">
          <span>Status:</span>
        </div>
        <div className="font-bold mb-2">{status}</div>
        
        <div className="border-t border-dashed border-black my-2"></div>
        
        <div className="text-center mt-2">Thank You</div>
      </div>
    );
  }
);

PrintableChallan.displayName = "PrintableChallan";
