import NotificationsList from "@/components/common/NotificationsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications — Santechs Dashboard",
};

export default function BuyerNotificationsPage() {
  return <NotificationsList />;
}
