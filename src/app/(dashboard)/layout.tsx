import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DataLoader } from "@/lib/stores/DataLoader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const displayName = user.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).split(" ")[0]
    : (user.email?.split("@")[0] ?? "Kamu");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <Sidebar userName={displayName} userEmail={user.email ?? ""} userId={user.id} />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-[240px]">
        {/* Mobile sticky header */}
        <MobileHeader />

        <main
          className={[
            "flex-1 px-4 py-5",
            "sm:px-6 sm:py-6",
            "lg:px-8 lg:py-8",
            /* Bottom padding agar konten tidak tertutup MobileNav (≈72px) */
            "pb-24 lg:pb-8",
          ].join(" ")}
        >
          <div className="mx-auto max-w-5xl">
            <DataLoader userId={user.id} />
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <MobileNav />
    </div>
  );
}
