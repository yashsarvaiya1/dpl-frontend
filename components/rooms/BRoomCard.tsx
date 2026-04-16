// components/rooms/BRoomCard.tsx

import { useRouter } from 'next/navigation'
import { BRoomDetail } from '@/lib/types'   // ← BRoomDetail, not BRoom
import { cn } from '@/lib/utils'
import { BROOM_STATUS_COLORS, BROOM_STATUS_LABELS } from '@/models/broom'
import StatusBadge from '@/components/shared/StatusBadge'
import { BoxIcon } from 'lucide-react'

interface Props { room: BRoomDetail }   // ← BRoomDetail has entries_count + is_winner

export default function BRoomCard({ room }: Props) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(`/rooms/${room.id}`)}
      className="w-full text-left bg-card border border-border rounded-xl p-4 space-y-2 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">Room #{room.id}</p>
        <StatusBadge
          label={BROOM_STATUS_LABELS[room.status]}
          colorClass={BROOM_STATUS_COLORS[room.status]}
        />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <BoxIcon className="w-3.5 h-3.5" />
          {/* ← BRoomDetail uses entries_count */}
          {room.entries_count}/10 opened
        </span>
        {room.my_entry && (
          <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
            Box: {room.my_entry.box_value}
          </span>
        )}
      </div>

      {/* ← is_winner is on BRoomDetail directly */}
      {room.status === 'completed' && (
        <div className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full w-fit',
          room.is_winner
            ? 'bg-green-500/10 text-green-600'
            : 'bg-muted text-muted-foreground'
        )}>
          {room.is_winner ? '🏆 Won' : 'No win'}
        </div>
      )}
    </button>
  )
}
