"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { Home, Building2, Users, Bus, Map, Settings, CreditCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/app/actions";

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
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
    });
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/50 h-screen fixed left-0 top-0 pt-6 pb-6 z-50">
      {/* Logo & Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 relative shrink-0 rounded-xl bg-slate-50 p-1 border border-slate-100 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Transport System Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight font-outfit text-slate-900 leading-tight">
            Transport
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">System Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
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
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 mr-3 transition-colors",
                isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.name}
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-4 border-t border-slate-100 pt-4">
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          {isPending ? "Signing Out..." : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
