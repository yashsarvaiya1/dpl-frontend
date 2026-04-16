// hooks/useUser.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { CreateUserPayload, UpdateUserPayload } from "@/models/user";
import { useAuthStore } from "@/stores/authStore";

const USERS_KEY = "users";

export const useUsers = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => userService.getAll(params),
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      userService.update(id, payload),
    onSuccess: (updatedUser) => {
      // If the updated user is the logged-in user, sync the store
      if (currentUser?.id === updatedUser.id) {
        setUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.softDelete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};

export const useClearPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.clearPassword(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.activate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};
