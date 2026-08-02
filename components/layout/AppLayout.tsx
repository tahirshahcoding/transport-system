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

      if (!hasSession && pathname !== "/login" && !pathname.startsWith("/print/")) {
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

  // If on login or print page, render directly without sidebar/nav
  if (pathname === "/login" || pathname.startsWith("/print/")) {
    return <>{children}</>;
  }

  // Prevent flash of protected content while checking
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-4 select-none">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Logo Card */}
          <div className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl p-2.5 border border-slate-100 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Transport System Logo"
              className="w-11 h-11 object-contain animate-pulse"
            />
          </div>

          {/* Titles */}
          <div>
            <h1 className="text-base font-bold font-outfit text-slate-900 tracking-tight">
              RAHIM TRAVEL
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Transport Management System
            </p>
          </div>

          {/* Simple Spinner */}
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mt-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fb] font-sans text-slate-900 print:bg-white print:min-h-0">
      <div className="print:hidden shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto print:overflow-visible print:h-auto print:w-full md:pl-64 print:pl-0 pb-[72px] md:pb-0 print:pb-0">
        {children}
      </main>
      <div className="print:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
