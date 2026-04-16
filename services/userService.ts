// services/userService.ts

import api from "@/lib/axios";
import { User, CreateUserPayload, UpdateUserPayload } from "@/models/user";
import { PaginatedResponse } from "@/lib/types";

export const userService = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<User>> => {
    const res = await api.get("/accounts/users/", { params });
    return res.data;
  },

  getById: async (id: number): Promise<User> => {
    const res = await api.get(`/accounts/users/${id}/`);
    return res.data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const res = await api.post("/accounts/users/", payload);
    return res.data;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const res = await api.patch(`/accounts/users/${id}/`, payload);
    return res.data;
  },

  softDelete: async (id: number): Promise<void> => {
    await api.delete(`/accounts/users/${id}/`);
  },

  clearPassword: async (id: number): Promise<void> => {
    await api.post(`/accounts/users/${id}/clear-password/`);
  },

  deactivate: async (id: number): Promise<void> => {
    await api.post(`/accounts/users/${id}/deactivate/`);
  },

  activate: async (id: number): Promise<void> => {
    await api.post(`/accounts/users/${id}/activate/`);
  },
};
