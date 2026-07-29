"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkSessionAction } from "@/app/actions";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      // Check document.cookie first
      let hasSession = typeof document !== "undefined" && document.cookie.includes("transport_session=authenticated");

      // If document.cookie didn't catch it yet, verify with server action
      if (!hasSession) {
        hasSession = await checkSessionAction();
      }

      if (!isMounted) return;

      setIsAuthenticated(hasSession);
      setIsChecking(false);

      if (!hasSession && pathname !== "/login") {
        router.replace("/login");
      } else if (hasSession && pathname === "/login") {
        router.replace("/");
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // If on login page, render login page directly without sidebar/nav
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Prevent flash of protected content while checking
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fb] font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto md:pl-64 pb-[72px] md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
