// hooks/useMatch.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchService } from '@/services/matchService'

export const useMatchList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['matches', params],
    queryFn: () => matchService.list(params).then(r => r.data),
  })

export const useMatch = (id: number) =>
  useQuery({
    queryKey: ['matches', id],
    queryFn: () => matchService.get(id).then(r => r.data),
    enabled: !!id,
  })

export const useCreateMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: matchService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

export const useUpdateMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof matchService.update>[1] }) =>
      matchService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

export const useDeleteMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => matchService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

export const useMatchPositions = (matchId: number) =>
  useQuery({
    queryKey: ['matches', matchId, 'positions'],
    queryFn: async () => {
      const res = await matchService.listPositions(matchId)
      // Handle both paginated { results: [] } and direct array
      return Array.isArray(res.data) ? res.data : (res.data as any).results
    },
    enabled: !!matchId,
  })

export const useUpdateMatchPosition = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof matchService.updatePosition>[1] }) =>
      matchService.updatePosition(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['matches'] })
    },
  })
}
