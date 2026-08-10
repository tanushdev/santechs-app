import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (
    !session ||
    ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
  ) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 pl-64 h-full flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
