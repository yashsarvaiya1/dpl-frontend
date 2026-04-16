// services/bmatchService.ts

import api from '@/lib/axios'
import {
  BMatch, BMatchPosition, BMatchStatus,
  BRoomDetail, OpenBoxResponse,
  PaginatedResponse,
} from '@/lib/types'

export const bmatchService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<BMatch>>('/bmatches/', { params }),

  get: (id: number) =>
    api.get<BMatch>(`/bmatches/${id}/`),

  create: (data: {
    match: number
    ticket_amount: number
    note?: string
  }) => api.post<BMatch>('/bmatches/', data),

  update: (id: number, data: Partial<{
    match: number
    ticket_amount: number
    note: string
  }>) => api.patch<BMatch>(`/bmatches/${id}/`, data),

  delete: (id: number) =>
    api.delete(`/bmatches/${id}/`),

  changeStatus: (id: number, newStatus: BMatchStatus) =>
    api.post<BMatch>(`/bmatches/${id}/change-status/`, { status: newStatus }),

  listPositions: (id: number) =>
    api.get<BMatchPosition[]>(`/bmatches/${id}/positions/`),

  overridePosition: (
    bmatchId: number,
    posId: number,
    data: Partial<{
      player: number | null
      score: number | null
      is_no_player: boolean
    }>
  ) => api.patch<BMatchPosition>(`/bmatches/${bmatchId}/positions/${posId}/`, data),

  openBox: (id: number) =>
    api.post<OpenBoxResponse>(`/bmatches/${id}/open-box/`),

  myRooms: (id: number) =>
    api.get<BRoomDetail[]>(`/bmatches/${id}/my-rooms/`),
}
