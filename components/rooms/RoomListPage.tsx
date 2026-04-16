// components/rooms/RoomListPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRoomList } from '@/hooks/useRoom'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import { BROOM_STATUS_COLORS, BROOM_STATUS_LABELS } from '@/models/broom'
import StatusBadge from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { BoxIcon } from 'lucide-react'

export default function RoomListPage() {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { data, isLoading, isError } = useRoomList()

  useEffect(() => {
    setHeaderTitle('My Rooms')
    setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  return (
    <PageWrapper>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-center text-sm text-destructive py-12">
          Failed to load rooms.
        </p>
      )}

      {!isLoading && !isError && data?.results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          You haven't opened any boxes yet.
        </p>
      )}

      {!isLoading && !isError && data && data.results.length > 0 && (
        <div className="space-y-3">
          {data.results.map(room => (
            <button
              key={room.id}
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
                  {/* ← BRoom (list) uses entry_count not entries_count */}
                  {room.entry_count}/10 opened
                </span>
                {room.my_entry && (
                  <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                    Box: {room.my_entry.box_value}
                  </span>
                )}
              </div>

              {/* ← BRoom list has no is_winner — show generic completed chip */}
              {room.status === 'completed' && (
                <div className="text-xs font-medium px-2 py-0.5 rounded-full w-fit bg-muted text-muted-foreground">
                  Completed — tap to see result
                </div>
              )}
            </button>
          ))}
        </div>
      )}

    </PageWrapper>
  )
}
