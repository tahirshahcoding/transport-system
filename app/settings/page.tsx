"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { seedDatabase } from "@/app/actions";
import { Database, AlertTriangle, ChevronRight, User, Bell, Shield, HelpCircle } from "lucide-react";

const menuItems = [
  { name: "Profile", icon: User, desc: "Manage your account" },
  { name: "Notifications", icon: Bell, desc: "Configure alerts" },
  { name: "Security", icon: Shield, desc: "Password & privacy" },
  { name: "Help & Support", icon: HelpCircle, desc: "Get assistance" },
];

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();

  const handleSeed = () => {
    if (confirm("This will inject dummy students, routes, vehicles, and challans into the database. Continue?")) {
      startTransition(async () => {
        await seedDatabase();
        alert("Database seeded successfully! Go check the Dashboard.");
      });
    }
  };

  return (
    <div className="px-4 pt-4 pb-4 max-w-lg mx-auto md:max-w-5xl md:px-8 md:pt-8">
      <div className="mb-5">
        <h2 className="text-lg font-bold font-outfit text-slate-900">Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage app preferences and data.</p>
      </div>

      {/* Settings Menu */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-5">
        {menuItems.map((item, i) => (
          <button key={item.name} className={`w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left ${i < menuItems.length - 1 ? "border-b border-slate-100" : ""}`}>
            <div className="bg-slate-100 p-2.5 rounded-xl">
              <item.icon className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{item.name}</p>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        ))}
      </div>

      {/* Developer Tools */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-xs font-bold text-red-600">Developer Tools</p>
        </div>
        <p className="text-[11px] text-slate-500 mb-4">
          Instantly populate the database with dummy students, vehicles, routes, and challans for testing.
        </p>
        <Button
          onClick={handleSeed}
          disabled={isPending}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 text-xs font-semibold"
        >
          <Database className="w-4 h-4 mr-2" />
          {isPending ? "Seeding..." : "Inject Dummy Data"}
        </Button>
      </div>
    </div>
  );
}
