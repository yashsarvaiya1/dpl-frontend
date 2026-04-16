// services/playerService.ts

import api from '@/lib/axios'
import { Player, PaginatedResponse } from '@/lib/types'

export const playerService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Player>>('/matches/players/', { params }),

  get: (id: number) =>
    api.get<Player>(`/matches/players/${id}/`),

  create: (data: { name: string; team: number }) =>
    api.post<Player>('/matches/players/', data),

  update: (id: number, data: Partial<{ name: string; team: number }>) =>
    api.patch<Player>(`/matches/players/${id}/`, data),

  delete: (id: number) =>
    api.delete(`/matches/players/${id}/`),
}
