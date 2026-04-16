// stores/uiStore.ts

import { create } from 'zustand'

interface UIState {
  headerTitle: string
  setHeaderTitle: (title: string) => void

  showBack: boolean
  setShowBack: (val: boolean) => void

  isGlobalLoading: boolean
  setGlobalLoading: (val: boolean) => void
}

export const useUiStore = create<UIState>()((set) => ({
  headerTitle: 'Dashboard',
  setHeaderTitle: (title) => set({ headerTitle: title }),

  showBack: false,
  setShowBack: (val) => set({ showBack: val }),

  isGlobalLoading: false,
  setGlobalLoading: (val) => set({ isGlobalLoading: val }),
}))
