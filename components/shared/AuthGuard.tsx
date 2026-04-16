// components/shared/AuthGuard.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Don't render anything until store is rehydrated
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Store hydrated but not authenticated — blank while redirecting
  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
