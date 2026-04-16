// components/rooms/BRoomCard.tsx

import { useRouter } from 'next/navigation'
import { BRoomDetail } from '@/lib/types'
import StatusBadge from '@/components/shared/StatusBadge'
import { BROOM_STATUS_COLORS, BROOM_STATUS_LABELS } from '@/models/broom'

interface Props { room: BRoomDetail }

export default function BRoomCard({ room }: Props) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(`/rooms/${room.id}`)}
      className="w-full text-left bg-card border rounded-xl p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">Room #{room.id}</p>
        <StatusBadge
          label={BROOM_STATUS_LABELS[room.status]}
          colorClass={BROOM_STATUS_COLORS[room.status]}
        />
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>📦 {room.entries_count}/10 boxes opened</span>
        {room.my_entry && (
          <span className="font-medium text-foreground">
            Your box: <span className="text-primary">{room.my_entry.box_value}</span>
          </span>
        )}
      </div>
    </button>
  )
}
