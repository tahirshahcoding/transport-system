"use client";

import { Send } from "lucide-react";
import { useAppDialog } from "@/components/ui/app-dialog";

type ChallanItem = {
  id: string;
  amount: number;
  month: string;
  arrears: number;
  student: {
    name: string;
    fatherName: string;
    mobileNumber: string;
    class: string;
  };
};

export function DashboardChallanItem({ challan }: { challan: ChallanItem }) {
  const dialog = useAppDialog();

  const handleWhatsApp = async () => {
    let phone = challan.student.mobileNumber;
    if (!phone) {
      const input = await dialog.showPrompt(
        "Enter WhatsApp Number",
        `Enter mobile number for ${challan.student.name}`,
        "E.g. 923001234567"
      );
      if (!input) return;
      phone = input.trim();
    }

    const amount = challan.amount;
    const arrears = challan.arrears;
    const totalDue = amount + arrears;

    let breakdownText = `• Monthly Fee: Rs ${amount.toLocaleString()}`;
    if (arrears > 0) {
      breakdownText += `\n• Previous Arrears: Rs ${arrears.toLocaleString()}`;
    }

    const message = `Assalam o Alaikum ${challan.student.fatherName || challan.student.name},\n\nThis is a fee reminder from the Transport Department.\n\nStudent: ${challan.student.name}\nClass: ${challan.student.class}\nMonth: ${challan.month}\n\n${breakdownText}\n━━━━━━━━━━━━━━━━━━\nTotal Amount Due: Rs ${totalDue.toLocaleString()}\n\nPlease clear the pending dues at your earliest convenience. JazakAllah.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-blue-600 font-semibold">
          CH-{challan.id.slice(-6).toUpperCase()}
        </span>
        <span className="text-xs text-slate-700 font-medium">{challan.student.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-900">Rs {challan.amount.toLocaleString()}</span>
        <button
          onClick={handleWhatsApp}
          title="Send WhatsApp Reminder"
          className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-1.5 rounded-lg transition-colors"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
