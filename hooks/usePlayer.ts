// hooks/usePlayer.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { playerService } from '@/services/playerService'

export const usePlayerList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['players', params],
    queryFn: () => playerService.list(params).then(r => r.data),
  })

export const useCreatePlayer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; team: number }) => playerService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  })
}

export const useUpdatePlayer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string }> }) =>
      playerService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  })
}

export const useDeletePlayer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => playerService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  })
}
