// components/shared/AppShell.tsx

"use client";

import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <>
      <TopBar />
      <main>{children}</main>
      <BottomNav />
    </>
  );
}
