import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getRoleSession } from "@/lib/auth/roleAuth";
import { UserRole } from "@/types";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const buyerSession = await getRoleSession([UserRole.BUYER]);

  return (
    <>
      <Navbar initialSession={buyerSession} portal="buyer" />
      <main>{children}</main>
      <Footer />
    </>
  );
}
