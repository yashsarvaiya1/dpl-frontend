// models/broom.ts

import { BRoomStatus } from '@/lib/types'

export const BROOM_STATUS_LABELS: Record<BRoomStatus, string> = {
  active: 'Active',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const BROOM_STATUS_COLORS: Record<BRoomStatus, string> = {
  active: 'bg-green-100 text-green-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
}
