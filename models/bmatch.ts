// models/bmatch.ts

import { BMatch, BMatchStatus } from '@/lib/types'

export const BMATCH_STATUS_LABELS: Record<BMatchStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  closed: 'Closed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

// Use CSS variable-based classes instead of hardcoded colors
export const BMATCH_STATUS_COLORS: Record<BMatchStatus, string> = {
  upcoming: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  active:   'bg-primary/10 text-primary',
  closed:   'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  completed:'bg-muted text-muted-foreground',
  cancelled:'bg-destructive/10 text-destructive',
}

export const IRREVERSIBLE_STATUSES: BMatchStatus[] = ['completed', 'cancelled']

export const canChangeStatus = (current: BMatchStatus): boolean =>
  !IRREVERSIBLE_STATUSES.includes(current)

export const isAdminOwned = (
  bmatch: BMatch,
  userId: number,
  isSuperuser: boolean
): boolean => isSuperuser || bmatch.created_by === userId

// Helper to get team display string from BMatch
export const getBMatchTitle = (bmatch: BMatch): string => {
  const d = bmatch.match_detail
  if (!d) return `BMatch #${bmatch.id}`
  return `${d.team_1_name} vs ${d.team_2_name}`  // ← uses flat names now
}
