// components/shared/GuestGuard.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const _hasHydrated  = useAuthStore(s => s._hasHydrated)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  useEffect(() => {
    if (_hasHydrated && isAuthenticated()) {
      router.replace('/')
    }
  }, [_hasHydrated, isAuthenticated, router])

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated()) return null

  return <>{children}</>
}
