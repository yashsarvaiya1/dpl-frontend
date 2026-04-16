// hooks/useRoom.ts

import { useQuery } from '@tanstack/react-query'
import { roomService } from '@/services/roomService'

export const useRoomList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['rooms', params],
    queryFn: () => roomService.list(params).then(r => r.data),
  })

export const useRoom = (id: number) =>
  useQuery({
    queryKey: ['rooms', id],
    queryFn: () => roomService.get(id).then(r => r.data),
    enabled: !!id,
  })
