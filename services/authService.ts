// services/authService.ts

import api from "@/lib/axios";
import {
  CheckMobileResponse,
  LoginResponse,
  SetPasswordResponse,
} from "@/models/user";

export const authService = {
  checkMobile: async (mobile_number: string): Promise<CheckMobileResponse> => {
    const res = await api.post("/accounts/auth/check-mobile/", { mobile_number });
    return res.data;
  },

  login: async (mobile_number: string, password: string): Promise<LoginResponse> => {
    const res = await api.post("/accounts/auth/login/", { mobile_number, password });
    return res.data;
  },

  setPassword: async (
    mobile_number: string,
    password: string,
    confirm_password: string
  ): Promise<SetPasswordResponse> => {
    const res = await api.post("/accounts/auth/set-password/", {
      mobile_number,
      password,
      confirm_password,
    });
    return res.data;
  },

  logout: async (refresh: string): Promise<void> => {
    await api.post("/accounts/auth/logout/", { refresh });
  },
};
