import NotificationsList from "@/components/common/NotificationsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications — Santechs Seller Console",
};

export default function SellerNotificationsPage() {
  return <NotificationsList />;
}
