// services/dashboardService.ts

import api from '@/lib/axios'
import { DashboardStats } from '@/lib/types'

export const dashboardService = {
  get: () => api.get<DashboardStats>('/accounts/users/dashboard/'),
}
