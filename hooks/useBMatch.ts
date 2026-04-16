// hooks/useBMatch.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmatchService } from '@/services/bmatchService'
import { BMatchStatus } from '@/lib/types'

export const useBMatchList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['bmatches', params],
    queryFn: () => bmatchService.list(params).then(r => r.data),
  })

export const useBMatch = (id: number) =>
  useQuery({
    queryKey: ['bmatches', id],
    queryFn: () => bmatchService.get(id).then(r => r.data),
    enabled: !!id,
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
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof bmatchService.update>[1] }) =>
      bmatchService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bmatches'] }),
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
      bmatchService.changeStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bmatches'] }),
  })
}

export const useBMatchPositions = (id: number) =>
  useQuery({
    queryKey: ['bmatches', id, 'positions'],
    queryFn: () => bmatchService.listPositions(id).then(r => r.data),
    enabled: !!id,
  })

export const useOverrideBMatchPosition = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      bmatchId, posId, data
    }: {
      bmatchId: number
      posId: number
      data: Parameters<typeof bmatchService.overridePosition>[2]
    }) => bmatchService.overridePosition(bmatchId, posId, data),
    onSuccess: (_, { bmatchId }) => {
      qc.invalidateQueries({ queryKey: ['bmatches', bmatchId, 'positions'] })
      qc.invalidateQueries({ queryKey: ['bmatches', bmatchId] })
    },
  })
}

export const useOpenBox = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (bmatchId: number) => bmatchService.openBox(bmatchId).then(r => r.data),
    onSuccess: (_, bmatchId) => {
      qc.invalidateQueries({ queryKey: ['bmatches', bmatchId, 'my-rooms'] })
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useMyRooms = (bmatchId: number) =>
  useQuery({
    queryKey: ['bmatches', bmatchId, 'my-rooms'],
    queryFn: () => bmatchService.myRooms(bmatchId).then(r => r.data),
    enabled: !!bmatchId,
  })
