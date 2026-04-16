// hooks/useDashboard.ts

import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.get().then(r => r.data),
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
