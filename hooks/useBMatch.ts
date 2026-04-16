// hooks/useBMatch.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmatchService } from '@/services/bmatchService'
import { BMatchStatus } from '@/lib/types'
import { useAuthStore } from '@/stores/authStore'

export const useBMatchList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['bmatches', params],
    queryFn: () => bmatchService.list(params).then(r => r.data),
    staleTime: 15 * 1000,
  })

export const useBMatch = (id: number) =>
  useQuery({
    queryKey: ['bmatches', id],
    queryFn: () => bmatchService.get(id).then(r => r.data),
    enabled: !!id,
    refetchOnMount: true,
  })

export const useCreateBMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bmatchService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bmatches'] }),
  })
}

export const useUpdateBMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number
      data: Parameters<typeof bmatchService.update>[1]
    }) => bmatchService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['bmatches', id] })
      qc.invalidateQueries({ queryKey: ['bmatches'] })
    },
  })
}

export const useDeleteBMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bmatchService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bmatches'] }),
  })
}

export const useChangeBMatchStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: BMatchStatus }) =>
      bmatchService.changeStatus(id, status).then(r => r.data),
    onSuccess: (updatedBMatch) => {
      // Optimistic cache update for instant UI
      qc.setQueryData(['bmatches', updatedBMatch.id], updatedBMatch)
      qc.invalidateQueries({ queryKey: ['bmatches'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useBMatchPositions = (id: number) =>
  useQuery({
    queryKey: ['bmatches', id, 'positions'],
    queryFn: () => bmatchService.listPositions(id).then(r => r.data),
    enabled: !!id,
    refetchOnMount: true,
  })

export const useOverrideBMatchPosition = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      bmatchId, posId, data,
    }: {
      bmatchId: number
      posId: number
      data: Parameters<typeof bmatchService.overridePosition>[2]
    }) => bmatchService.overridePosition(bmatchId, posId, data).then(r => r.data),
    onSuccess: (_, { bmatchId }) => {
      qc.invalidateQueries({ queryKey: ['bmatches', bmatchId, 'positions'] })
      qc.invalidateQueries({ queryKey: ['bmatches', bmatchId] })
      qc.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}

export const useOpenBox = () => {
  const qc = useQueryClient()
  const setUser = useAuthStore(s => s.setUser)

  return useMutation({
    mutationFn: (bmatchId: number) => bmatchService.openBox(bmatchId).then(r => r.data),
    onSuccess: (data, bmatchId) => {
      // Sync ticket balance into auth store immediately
      setUser({ tickets: data.tickets_remaining })

      // Update cached room
      qc.setQueryData(
        ['bmatches', bmatchId, 'my-rooms'],
        (old: typeof data.room[] | undefined) => {
          if (!old) return [data.room]
          const exists = old.find(r => r.id === data.room.id)
          return exists
            ? old.map(r => r.id === data.room.id ? data.room : r)
            : [...old, data.room]
        }
      )

      qc.invalidateQueries({ queryKey: ['bmatches', bmatchId, 'my-rooms'] })
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export const useMyRooms = (bmatchId: number) =>
  useQuery({
    queryKey: ['bmatches', bmatchId, 'my-rooms'],
    queryFn: () => bmatchService.myRooms(bmatchId).then(r => r.data),
    enabled: !!bmatchId,
    refetchOnMount: true,
  })
