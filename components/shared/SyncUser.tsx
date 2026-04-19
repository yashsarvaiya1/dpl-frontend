// components/shared/SyncUser.tsx
'use client'

import { useUser } from '@/hooks/useUser'
import { useAuthStore } from '@/stores/authStore'

export default function SyncUser() {
  const userId = useAuthStore(s => s.user?.id)
  // useUser already calls setUser({ tickets }) internally when id matches
  useUser(userId ?? 0)
  return null
}
