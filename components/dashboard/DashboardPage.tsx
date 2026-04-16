// components/dashboard/DashboardPage.tsx

"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import PageWrapper from "@/components/shared/PageWrapper";

export default function DashboardPage() {
  const setHeaderTitle = useUIStore((s) => s.setHeaderTitle);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setHeaderTitle("Home");
  }, [setHeaderTitle]);

  return (
    <PageWrapper>
      <div className="space-y-2 pt-4">
        <h2 className="text-xl font-bold">
          Welcome, {user?.username || user?.mobile_number} 👋
        </h2>
        <p className="text-muted-foreground text-sm">
          Here's your DPL dashboard.
        </p>
      </div>
    </PageWrapper>
  );
}
