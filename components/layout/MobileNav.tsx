"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Users, CreditCard, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Institutes", href: "/institutes", icon: Building2 },
  { name: "Students", href: "/students", icon: Users },
  { name: "Finance", href: "/finance", icon: CreditCard },
  { name: "More", href: "/settings", icon: MoreHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center h-[68px] z-50 safe-area-bottom">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full pt-2 pb-1 transition-colors",
              isActive ? "text-blue-600" : "text-slate-400"
            )}
          >
            <item.icon className={cn("w-5 h-5 mb-1", isActive && "stroke-[2.5]")} />
            <span className={cn(
              "text-[10px]",
              isActive ? "text-blue-600 font-bold" : "text-slate-400 font-medium"
            )}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
