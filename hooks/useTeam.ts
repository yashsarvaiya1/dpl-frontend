// hooks/useTeam.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamService } from '@/services/teamService'

export const useTeamList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['teams', params],
    queryFn: () => teamService.list(params).then(r => r.data),
  })

export const useTeam = (id: number) =>
  useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamService.get(id).then(r => r.data),
    enabled: !!id,
  })

export const useCreateTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string }) => teamService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export const useUpdateTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string }> }) =>
      teamService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export const useDeleteTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => teamService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}
