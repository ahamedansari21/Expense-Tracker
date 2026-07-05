import api from './api'
import type { DashboardData } from '@/types'

export const dashboardService = {
  get: () => api.get<{ data: DashboardData }>('/dashboard').then(r => r.data.data),
}
