// components/shared/AppShell.tsx
'use client'

import TopBar from './TopBar'
import BottomNav from './BottomNav'
import SyncUser from './SyncUser'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Syncs fresh tickets + status from server into authStore on every mount */}
      <SyncUser />
      <TopBar />
      <main className="flex-1 overflow-y-auto overscroll-y-contain pb-16">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
