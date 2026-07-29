"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Users, Bus, Map, Settings, CreditCard, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Students", href: "/students", icon: Users },
  { name: "Institutes", href: "/institutes", icon: Building2 },
  { name: "Vehicles", href: "/vehicles", icon: Bus },
  { name: "Routes", href: "/routes", icon: Map },
  { name: "Finance", href: "/finance", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white/70 backdrop-blur-xl border-r border-slate-200/50 h-screen fixed left-0 top-0 pt-8 z-50">
      <div className="px-7 mb-10 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight font-outfit text-slate-900">TransportApp</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 mr-3 transition-colors",
                isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.name}
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
