// components/shared/TopBar.tsx

'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Ticket } from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

export default function TopBar() {
  const router         = useRouter()
  const headerTitle    = useUiStore(s => s.headerTitle)
  const showBack       = useUiStore(s => s.showBack)
  const tickets        = useAuthStore(s => s.user?.tickets ?? 0)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated())

  return (
    // ← NOT fixed anymore — AppShell positions it at top via flex column
    <div className="h-14 bg-background/95 backdrop-blur-sm border-b border-border shrink-0 z-50">
      <div className="max-w-md mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-base font-semibold truncate">{headerTitle}</h1>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full shrink-0">
            <Ticket className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold tabular-nums">{tickets}</span>
          </div>
        )}
      </div>
    </div>
  )
}
