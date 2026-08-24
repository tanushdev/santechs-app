import { getRoleSession } from "@/lib/auth/roleAuth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import ClientAdminSidebar from "@/components/admin/ClientAdminSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getRoleSession([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  if (!session) {
    redirect("/super_admin");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ClientAdminSidebar />
      <div className="flex-1 pl-0 lg:pl-64 h-full flex flex-col overflow-hidden min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
