// stores/uiStore.ts

import { create } from "zustand";

interface UIState {
  // Header
  headerTitle: string;
  setHeaderTitle: (title: string) => void;

  // Back button
  showBack: boolean;
  setShowBack: (val: boolean) => void;

  // Global loading
  isGlobalLoading: boolean;
  setGlobalLoading: (val: boolean) => void;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUiStore = create<UIState>()((set) => ({
  headerTitle: "Dashboard",
  setHeaderTitle: (title) => set({ headerTitle: title }),

  showBack: false,
  setShowBack: (val) => set({ showBack: val }),

  isGlobalLoading: false,
  setGlobalLoading: (val) => set({ isGlobalLoading: val }),

  theme: "light",
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  setTheme: (theme) => set({ theme }),
}));
