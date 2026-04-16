// models/broom.ts

import { BRoomStatus } from '@/lib/types'

export const BROOM_STATUS_LABELS: Record<BRoomStatus, string> = {
  active:    'Active',
  ongoing:   'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const BROOM_STATUS_COLORS: Record<BRoomStatus, string> = {
  active:    'bg-primary/10 text-primary',
  ongoing:   'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
}
