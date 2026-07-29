"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Building2, Users, CreditCard, MoreHorizontal, Bus, Map, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logoutUser } from "@/app/actions";

const mobileNavItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Institutes", href: "/institutes", icon: Building2 },
  { name: "Students", href: "/students", icon: Users },
  { name: "Finance", href: "/finance", icon: CreditCard },
  { name: "More", href: "#", icon: MoreHorizontal },
];

const extraItems = [
  { name: "Routes", href: "/routes", icon: Map },
  { name: "Vehicles", href: "/vehicles", icon: Bus },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
    });
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center h-[68px] z-50 safe-area-bottom">
      {mobileNavItems.map((item) => {
        if (item.name === "More") {
          return (
            <Sheet key={item.name} open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="flex flex-col items-center justify-center flex-1 h-full pt-2 pb-1 transition-colors text-slate-400">
                <div className="w-5 h-5 relative mb-1 flex items-center justify-center">
                  <Image src="/logo.png" alt="Logo" width={20} height={20} className="object-contain" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  {item.name}
                </span>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8" showCloseButton={false}>
                <SheetHeader className="mb-4 flex flex-row items-center gap-3 space-y-0">
                  <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
                  <SheetTitle className="text-left font-outfit text-base">More Options</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {extraItems.map((extra) => (
                    <Link
                      key={extra.name}
                      href={extra.href}
                      onClick={() => setIsOpen(false)}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                    >
                      <extra.icon className="w-6 h-6 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-700">{extra.name}</span>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 h-11 bg-red-50 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {isPending ? "Signing Out..." : "Sign Out"}
                </button>
              </SheetContent>
            </Sheet>
          );
        }

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
