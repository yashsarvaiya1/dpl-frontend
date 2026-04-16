// components/shared/TopBar.tsx

"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";

export default function TopBar() {
  const router = useRouter();
  const headerTitle = useUIStore((s) => s.headerTitle);
  const showBack = useUIStore((s) => s.showBack);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 flex items-center px-4 max-w-md mx-auto">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="mr-2 p-1 rounded-md hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <h1 className="text-base font-semibold truncate">{headerTitle}</h1>
    </div>
  );
}
