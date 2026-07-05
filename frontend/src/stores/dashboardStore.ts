import { create } from 'zustand'
import type { DashboardData } from '@/types'
import { dashboardService } from '@/services/dashboardService'

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  lastFetched: number | null
  fetch: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  loading: false,
  lastFetched: null,

  fetch: async () => {
    // Stale-while-revalidate: skip if fetched < 2 min ago
    const now = Date.now()
    if (get().lastFetched && now - get().lastFetched! < 120_000) return

    set({ loading: true })
    try {
      const data = await dashboardService.get()
      set({ data, loading: false, lastFetched: now })
    } catch {
      set({ loading: false })
    }
  },
}))
