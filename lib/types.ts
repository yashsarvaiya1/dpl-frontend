// lib/types.ts

// ── Pagination ─────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ── User ───────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  username: string | null
  mobile_number: string
  tickets: number           // always int, never null (enforced by backend)
  is_staff: boolean
  is_superuser: boolean
  is_active: boolean
  has_password_set: boolean
  created_at: string
  updated_at: string
}

export interface CheckMobileResponse {
  exists: boolean
  has_password_set?: boolean
  is_active?: boolean
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface SetPasswordResponse {
  access: string
  refresh: string
  user: User
}

export interface CreateUserPayload {
  username?: string
  mobile_number: string
  is_staff?: boolean
  is_active?: boolean
  tickets?: number
}

export interface UpdateUserPayload {
  username?: string
  is_active?: boolean
  tickets?: number
}

// ── Team & Player ──────────────────────────────────────────────────────────────
export interface TeamMinimal {
  id: number
  name: string
}

export interface Team {
  id: number
  name: string
  players: Player[]
  created_at: string
  updated_at: string
}

export interface Player {
  id: number
  name: string
  team: number
  created_at: string
  updated_at: string
}

// ── Match ──────────────────────────────────────────────────────────────────────
export interface MatchPosition {
  id: number
  position_label: string
  player: number | null
  player_name: string | null
  score: number | null
  is_no_player: boolean
  updated_at: string
}

export interface Match {
  id: number
  team_1: number
  team_2: number
  team_1_detail: TeamMinimal
  team_2_detail: TeamMinimal
  date: string
  start_time: string | null
  end_time: string | null
  positions: MatchPosition[]
  created_at: string
  updated_at: string
}

// ── BMatch ─────────────────────────────────────────────────────────────────────
export type BMatchStatus = 'upcoming' | 'active' | 'closed' | 'completed' | 'cancelled'

export interface MatchSummary {
  id: number
  team_1: number
  team_1_name: string       // ← was team_1_detail.name before, now flat
  team_2: number
  team_2_name: string       // ← was team_2_detail.name before, now flat
  date: string
  start_time: string | null
  end_time: string | null
}

export interface BMatchPosition {
  id: number
  position_label: string
  player: number | null
  player_name: string | null
  score: number | null
  is_no_player: boolean
  updated_at: string
}

export interface BMatch {
  id: number
  match: number
  match_detail: MatchSummary  // ← flat team names now
  ticket_amount: number
  note: string | null
  status: BMatchStatus
  created_by: number
  created_by_name: string | null
  positions: BMatchPosition[]
  created_at: string
  updated_at: string
}

// ── BRoom ──────────────────────────────────────────────────────────────────────
export type BRoomStatus = 'active' | 'ongoing' | 'completed' | 'cancelled'

export interface BRoomEntry {
  id: number
  user: number
  username: string | null
  mobile_number: string | null
  box_value: string
  created_at: string
}

export interface EffectivePosition {
  position_label: string
  player_id: number | null
  player_name: string | null
  score: number | null
  is_no_player: boolean
}

export interface BRoom {
  id: number
  bmatch: number
  bmatch_detail: BMatch
  status: BRoomStatus
  entry_count: number
  my_entry: BRoomEntry | null
  created_at: string
}

export interface BRoomDetail {
  id: number
  bmatch: number
  bmatch_detail: BMatch
  status: BRoomStatus
  entries_count: number      // ← note: entries_count not entry_count in detail
  my_entry: BRoomEntry | null
  positions: EffectivePosition[]
  is_winner: boolean         // ← new field from backend
  created_at: string
}

export interface OpenBoxResponse {
  box_value: string
  room: BRoomDetail
  tickets_remaining: number  // ← always int
}

// ── Transactions ───────────────────────────────────────────────────────────────
export type TransactionType = 'credit' | 'debit'
export type TransactionReason =
  | 'admin_add'
  | 'admin_remove'
  | 'box_open'
  | 'win_reward'
  | 'refund'

export interface TicketTransaction {
  id: number
  user: number
  username: string | null
  mobile_number: string | null
  transaction_type: TransactionType
  amount: number             // always int, never null
  reason: TransactionReason
  reference_bmatch: number | null
  reference_broom: number | null
  created_by: number | null
  created_at: string
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export interface DashboardStats {
  users: {
    total: number
    active: number
    new_this_month: number
  }
  bmatches: {
    total: number
    active: number
    upcoming: number
    closed: number
    completed: number
    cancelled: number
  }
  rooms: {
    total: number
    active: number
    ongoing: number
    completed: number
    cancelled: number
  }
  tickets: {
    total_in_circulation: number
    total_credited: number
    total_debited: number
  }
  chart: { date: string; credit: number; debit: number }[]
  recent_bmatches: BMatch[]  // ← typed now, not any[]
}
