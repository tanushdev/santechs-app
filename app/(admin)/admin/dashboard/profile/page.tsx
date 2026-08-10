import ProfileClient from "@/components/common/ProfileClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings — Santechs Admin Console",
};

export default function AdminProfilePage() {
  return <ProfileClient />;
}
