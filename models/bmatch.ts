// models/bmatch.ts

import { BMatch, BMatchStatus } from '@/lib/types'

export const BMATCH_STATUS_LABELS: Record<BMatchStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  closed: 'Closed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const BMATCH_STATUS_COLORS: Record<BMatchStatus, string> = {
  upcoming: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-orange-100 text-orange-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const IRREVERSIBLE_STATUSES: BMatchStatus[] = ['completed', 'cancelled']

export const canChangeStatus = (
  current: BMatchStatus,
  next: BMatchStatus
): boolean => {
  if (IRREVERSIBLE_STATUSES.includes(current)) return false
  return true
}

export const isAdminOwned = (
  bmatch: BMatch,
  userId: number,
  isSuperuser: boolean
): boolean => {
  if (isSuperuser) return true
  return bmatch.created_by === userId
}
