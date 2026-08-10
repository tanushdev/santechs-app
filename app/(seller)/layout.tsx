import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import SellerSidebar from "@/components/seller/SellerSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { connectToDatabase } from "@/lib/db/connection";
import Company from "@/lib/db/models/Company.model";
import SellerApprovalGuard from "@/components/seller/SellerApprovalGuard";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== UserRole.SELLER) {
    redirect("/login");
  }

  await connectToDatabase();
  const company = await Company.findOne({ owner: session.user.id });
  const isApproved = company?.isApproved === true;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SellerSidebar isApproved={isApproved} />
      <div className="flex-1 pl-64 h-full flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#faf9f6]">
          <SellerApprovalGuard isApproved={isApproved} hasCompany={!!company}>
            {children}
          </SellerApprovalGuard>
        </main>
      </div>
    </div>
  );
}
