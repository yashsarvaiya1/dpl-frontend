// models/user.ts
// All User types now live in lib/types.ts
// This file re-exports for backward compat — update imports gradually

export type {
  User,
  CheckMobileResponse,
  LoginResponse,
  SetPasswordResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/lib/types'
