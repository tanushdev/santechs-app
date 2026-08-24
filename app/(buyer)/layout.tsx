import { getRoleSession } from "@/lib/auth/roleAuth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const buyerSession = await getRoleSession([UserRole.BUYER]);

  if (!buyerSession || buyerSession.user.role !== UserRole.BUYER) {
    redirect("/login");
  }

  return (
    <>
      <Navbar initialSession={buyerSession} portal="buyer" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
