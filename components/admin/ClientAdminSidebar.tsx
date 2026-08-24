"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function ClientAdminSidebar(props: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-40 bg-sidebar border-r border-sidebar-border" />
    );
  }

  return <AdminSidebar {...props} />;
}
