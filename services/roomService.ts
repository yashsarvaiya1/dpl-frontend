// services/roomService.ts

import api from '@/lib/axios'
import { BRoom, BRoomDetail, PaginatedResponse } from '@/lib/types'

export const roomService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<BRoom>>('/bmatches/rooms/', { params }),

  get: (id: number) =>
    api.get<BRoomDetail>(`/bmatches/rooms/${id}/`),
}
