// stores/authStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/models/user";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  _hasHydrated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setHasHydrated: (val: boolean) => void;

  // Role helpers
  isSuperUser: () => boolean;
  isAdmin: () => boolean;
  isNormalUser: () => boolean;
  isAuthenticated: () => boolean;
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

      setUser: (user) => set({ user }),

      isSuperUser: () => get().user?.is_superuser === true,

      isAdmin: () =>
        get().user?.is_staff === true && get().user?.is_superuser === false,

      isNormalUser: () =>
        get().user?.is_staff === false && get().user?.is_superuser === false,

      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      name: "dpl-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
