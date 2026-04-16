// stores/authStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/lib/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  _hasHydrated: boolean

  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  setUser: (user: Partial<User>) => void   // ← partial update, not full replace
  setHasHydrated: (val: boolean) => void

  isSuperUser: () => boolean
  isAdmin: () => boolean
  isNormalUser: () => boolean
  isAuthenticated: () => boolean
  isElevated: () => boolean               // ← new: isAdmin || isSuperUser
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

      // Merge partial update — prevents stale fields from overwriting fresh ones
      setUser: (partial) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...partial } : s.user,
        })),

      isSuperUser: () => get().user?.is_superuser === true,

      isAdmin: () =>
        get().user?.is_staff === true && get().user?.is_superuser === false,

      isNormalUser: () =>
        get().user?.is_staff === false && get().user?.is_superuser === false,

      isAuthenticated: () => !!get().accessToken && !!get().user,

      isElevated: () =>
        get().user?.is_staff === true || get().user?.is_superuser === true,
    }),
    {
      name: 'dpl-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
