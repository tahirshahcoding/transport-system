import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
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
