// components/shared/AppShell.tsx

'use client'

import TopBar from './TopBar'
import BottomNav from './BottomNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    // Fixed full-viewport container — NOT min-h-screen
    <div className="fixed inset-0 flex flex-col bg-background">
      <TopBar />
      {/*
        flex-1 + overflow-y-auto = this is the ONLY scroll container
        pt-14 = TopBar height (h-14)
        pb-16 = BottomNav height (h-16) + safe area
      */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain pb-16">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
