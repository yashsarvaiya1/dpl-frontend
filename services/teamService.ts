// services/teamService.ts

import api from '@/lib/axios'
import { Team, PaginatedResponse } from '@/lib/types'

export const teamService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Team>>('/matches/teams/', { params }),

  get: (id: number) =>
    api.get<Team>(`/matches/teams/${id}/`),

  create: (data: { name: string }) =>
    api.post<Team>('/matches/teams/', data),

  update: (id: number, data: Partial<{ name: string }>) =>
    api.patch<Team>(`/matches/teams/${id}/`, data),

  delete: (id: number) =>
    api.delete(`/matches/teams/${id}/`),
}
