// models/user.ts

export interface User {
  id: number;
  username: string | null;
  mobile_number: string;
  tickets: number;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  has_password_set: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckMobileResponse {
  exists: boolean;
  has_password_set: boolean;
  is_active: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface SetPasswordResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface CreateUserPayload {
  username?: string;
  mobile_number: string;
  is_staff?: boolean;
  is_active?: boolean;
  tickets?: number;
}

export interface UpdateUserPayload {
  username?: string;
  is_active?: boolean;
  tickets?: number;
}
