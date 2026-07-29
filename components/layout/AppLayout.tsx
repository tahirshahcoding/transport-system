import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path") || headerList.get("next-url") || "";

  // If on login page, render children directly without app layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("transport_session")?.value;
  const isAuthenticated = session === "authenticated";

  // Redirect to login if unauthenticated on protected routes
  if (!isAuthenticated) {
    redirect("/login");
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
