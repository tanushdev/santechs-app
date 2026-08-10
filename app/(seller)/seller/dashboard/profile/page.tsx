import ProfileClient from "@/components/common/ProfileClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings — Santechs Seller Dashboard",
};

export default function SellerProfilePage() {
  return <ProfileClient />;
}
