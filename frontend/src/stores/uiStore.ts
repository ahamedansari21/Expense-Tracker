import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleCollapsed: () => void
  notificationPanelOpen: boolean
  setNotificationPanel: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  notificationPanelOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setNotificationPanel: (open) => set({ notificationPanelOpen: open }),
}))
