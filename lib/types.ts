// lib/types.ts

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ─── Auth ────────────────────────────────────────────────
export interface User {
  id: number
  username: string | null
  mobile_number: string
  tickets: number
  is_staff: boolean
  is_superuser: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Matches ─────────────────────────────────────────────
export interface Team {
  id: number
  name: string
  players: Player[]
  created_at: string
  updated_at: string
}

export interface TeamMinimal {
  id: number
  name: string
}

export interface Player {
  id: number
  name: string
  team: number
  created_at: string
  updated_at: string
}

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
  start_time: string
  end_time: string
  positions: MatchPosition[]
  created_at: string
  updated_at: string
}

// ─── BMatches ────────────────────────────────────────────
export type BMatchStatus = 'upcoming' | 'active' | 'closed' | 'completed' | 'cancelled'
export type BRoomStatus = 'active' | 'ongoing' | 'completed' | 'cancelled'
export type TransactionType = 'credit' | 'debit'
export type TransactionReason =
  | 'admin_add'
  | 'admin_remove'
  | 'box_open'
  | 'win_reward'
  | 'refund'

export interface BMatchPosition {
  id: number
  position_label: string
  player: number | null
  player_name: string | null
  score: number | null
  is_no_player: boolean
  updated_at: string
}

export interface BRoomEntry {
  id: number
  box_value: string
  created_at: string
}

export interface BRoom {
  id: number
  bmatch?: number
  status: BRoomStatus
  entry_count: number
  my_entry: BRoomEntry | null
  created_at: string
}

export interface BRoomDetail extends BRoom {
  entries_count: number
  positions: EffectivePosition[]
}

export interface EffectivePosition {
  position_label: string
  player_id: number | null
  player_name: string | null
  score: number | null
  is_no_player: boolean
}

export interface BMatch {
  id: number
  match: number
  match_detail: Match
  ticket_amount: number
  note: string | null
  status: BMatchStatus
  created_by: number
  created_by_name: string
  positions: BMatchPosition[]
  created_at: string
  updated_at: string
}

export interface OpenBoxResponse {
  box_value: string
  room: BRoomDetail
  tickets_remaining: number
}

export interface TicketTransaction {
  id: number
  user: number
  username: string | null
  mobile_number: string
  transaction_type: TransactionType
  amount: number
  reason: TransactionReason
  reference_bmatch: number | null
  reference_broom: number | null
  created_by: number | null
  created_at: string
}
