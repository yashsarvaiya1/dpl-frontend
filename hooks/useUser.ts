// hooks/useUser.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/userService'
import { CreateUserPayload, UpdateUserPayload } from '@/lib/types'
import { useAuthStore } from '@/stores/authStore'

const USERS_KEY = 'users'

export const useUsers = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => userService.getAll(params),
    staleTime: 15 * 1000,
  })

export const useUser = (id: number) => {
  const currentUser = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)

  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn: async () => {
      const fresh = await userService.getById(id)
      // If this is the logged-in user, sync tickets + status into store
      if (currentUser?.id === fresh.id) {
        setUser({ tickets: fresh.tickets, is_active: fresh.is_active })
      }
      return fresh
    },
    enabled: !!id,
    refetchOnMount: true,        // always fetch fresh on page mount
    staleTime: 10 * 1000,        // consider stale after 10s
  })
}

export const useCreateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}

export const useUpdateUser = () => {
  const qc = useQueryClient()
  const currentUser = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      userService.update(id, payload),
    onSuccess: (updatedUser) => {
      if (currentUser?.id === updatedUser.id) {
        setUser(updatedUser)
      }
      qc.setQueryData([USERS_KEY, updatedUser.id], updatedUser)
      qc.invalidateQueries({ queryKey: [USERS_KEY] })
    },
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.softDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}

export const useClearPassword = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.clearPassword(id),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: [USERS_KEY, id] }),
  })
}

export const useDeactivateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.deactivate(id),
    onSuccess: (_, id) => {
      qc.setQueryData([USERS_KEY, id], (old: any) =>
        old ? { ...old, is_active: false } : old
      )
      qc.invalidateQueries({ queryKey: [USERS_KEY] })
    },
  })
}

export const useActivateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.activate(id),
    onSuccess: (_, id) => {
      qc.setQueryData([USERS_KEY, id], (old: any) =>
        old ? { ...old, is_active: true } : old
      )
      qc.invalidateQueries({ queryKey: [USERS_KEY] })
    },
  })
}

export const useAddTickets = () => {
  const qc = useQueryClient()
  const currentUser = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)

  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      userService.addTickets(id, amount).then(r => r.data),
    onSuccess: (data, { id }) => {
      // Immediately patch cache + store
      qc.setQueryData([USERS_KEY, id], (old: any) =>
        old ? { ...old, tickets: data.tickets } : old
      )
      if (currentUser?.id === id) setUser({ tickets: data.tickets })
      qc.invalidateQueries({ queryKey: [USERS_KEY] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useRemoveTickets = () => {
  const qc = useQueryClient()
  const currentUser = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)

  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      userService.removeTickets(id, amount).then(r => r.data),
    onSuccess: (data, { id }) => {
      qc.setQueryData([USERS_KEY, id], (old: any) =>
        old ? { ...old, tickets: data.tickets } : old
      )
      if (currentUser?.id === id) setUser({ tickets: data.tickets })
      qc.invalidateQueries({ queryKey: [USERS_KEY] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
