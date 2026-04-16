// services/matchService.ts

import api from '@/lib/axios'
import { Match, MatchPosition, PaginatedResponse } from '@/lib/types'

export const matchService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Match>>('/matches/matches/', { params }),

  get: (id: number) =>
    api.get<Match>(`/matches/matches/${id}/`),

  create: (data: {
    team_1: number
    team_2: number
    date: string
    start_time: string
    end_time: string
  }) => api.post<Match>('/matches/matches/', data),

  update: (id: number, data: Partial<{
    team_1: number
    team_2: number
    date: string
    start_time: string
    end_time: string
  }>) => api.patch<Match>(`/matches/matches/${id}/`, data),

  delete: (id: number) =>
    api.delete(`/matches/matches/${id}/`),

  listPositions: (matchId: number) =>
    api.get<MatchPosition[]>(`/matches/positions/?match=${matchId}`),

  updatePosition: (posId: number, data: Partial<{
    player: number | null
    score: number | null
    is_no_player: boolean
  }>) => api.patch<MatchPosition>(`/matches/positions/${posId}/`, data),
}
