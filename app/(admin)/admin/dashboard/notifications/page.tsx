import NotificationsList from "@/components/common/NotificationsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications — Santechs Admin Console",
};

export default function AdminNotificationsPage() {
  return <NotificationsList />;
}
