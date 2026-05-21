import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileHeader } from "@/components/layout/MobileHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 max-w-[1280px] flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-9 lg:pb-16 lg:pt-8">
        <MobileHeader />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
