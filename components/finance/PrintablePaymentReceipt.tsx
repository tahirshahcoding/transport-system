"use client";

import { Printer } from "lucide-react";

export function PrintablePaymentReceipt({
  studentName,
  className,
  route,
  month,
  amountPaid,
  date,
  method,
}: {
  studentName: string;
  className: string;
  route: string;
  month: string;
  amountPaid: number;
  date: string;
  method: string;
}) {
  return (
    <div className="w-[58mm] bg-white text-black p-4 font-sans text-xs">
      <div className="text-center mb-4 border-b border-black pb-2">
        <h1 className="font-bold text-lg mb-1">ABC Transport</h1>
        <p className="text-[10px]">Payment Receipt</p>
        <p className="text-[10px] mt-1">{date}</p>
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span className="font-semibold">Name:</span>
          <span>{studentName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Class:</span>
          <span>{className}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Route:</span>
          <span>{route}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Month:</span>
          <span>{month}</span>
        </div>
      </div>

      <div className="border-t border-black pt-2 mb-4">
        <div className="flex justify-between font-bold text-sm">
          <span>Amount Paid:</span>
          <span>Rs {amountPaid.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mt-1 text-[10px]">
          <span>Method:</span>
          <span>{method}</span>
        </div>
      </div>

      <div className="text-center text-[10px] border-t border-black pt-2">
        <p>Thank you for your payment!</p>
        <p className="mt-1">Powered by TransportApp</p>
      </div>
    </div>
  );
}
