import ProfileClient from "@/components/common/ProfileClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings — Santechs Buyer Dashboard",
};

export default function BuyerProfilePage() {
  return <ProfileClient />;
}
