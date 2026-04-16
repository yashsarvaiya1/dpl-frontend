// components/shared/AppShell.tsx

"use client";

import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  showBack?: boolean;
}

export default function AppShell({ children, showBack = false }: AppShellProps) {
  return (
    <>
      <TopBar showBack={showBack} />
      <main>{children}</main>
      <BottomNav />
    </>
  );
}
