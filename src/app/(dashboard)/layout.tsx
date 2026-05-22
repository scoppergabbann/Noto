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
      <Sidebar userName={displayName} userEmail={user.email ?? ""} userId={user.id} />
      <div className="flex flex-1 flex-col lg:ml-[240px]">
        <MobileHeader />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-5xl">
            <DataLoader userId={user.id} />
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
