// hooks/useMatch.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchService } from '@/services/matchService'
import { MatchPosition } from '@/lib/types'

export const useMatchList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['matches', params],
    queryFn: () => matchService.list(params).then(r => r.data),
    staleTime: 30 * 1000,
  })

export const useMatch = (id: number) =>
  useQuery({
    queryKey: ['matches', id],
    queryFn: () => matchService.get(id).then(r => r.data),
    enabled: !!id,
    refetchOnMount: true,
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
    mutationFn: ({ id, data }: {
      id: number
      data: Parameters<typeof matchService.update>[1]
    }) => matchService.update(id, data).then(r => r.data),
    onSuccess: (updated) => {
      qc.setQueryData(['matches', updated.id], updated)
      qc.invalidateQueries({ queryKey: ['matches'] })
    },
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
    queryFn: async (): Promise<MatchPosition[]> => {
      const res = await matchService.listPositions(matchId)
      // Backend returns paginated — handle both shapes
      const data = res.data as any
      return Array.isArray(data) ? data : (data.results ?? [])
    },
    enabled: !!matchId,
    refetchOnMount: true,
  })

export const useUpdateMatchPosition = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number
      data: Parameters<typeof matchService.updatePosition>[1]
    }) => matchService.updatePosition(id, data).then(r => r.data),
    onSuccess: (updated) => {
      // Sync bmatches too since positions are mirrored
      qc.invalidateQueries({ queryKey: ['matches'] })
      qc.invalidateQueries({ queryKey: ['bmatches'] })
      qc.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}
