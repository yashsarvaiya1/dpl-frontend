// stores/uiStore.ts

import { create } from "zustand";

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (val: boolean) => void;

  // Header
  headerTitle: string;
  setHeaderTitle: (title: string) => void;

  // Global loading
  isGlobalLoading: boolean;
  setGlobalLoading: (val: boolean) => void;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (val) => set({ isSidebarOpen: val }),

  headerTitle: "Dashboard",
  setHeaderTitle: (title) => set({ headerTitle: title }),

  isGlobalLoading: false,
  setGlobalLoading: (val) => set({ isGlobalLoading: val }),

  theme: "light",
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  setTheme: (theme) => set({ theme }),
}));
