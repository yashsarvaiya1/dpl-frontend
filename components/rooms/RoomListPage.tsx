// components/rooms/RoomListPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRoomList } from '@/hooks/useRoom'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import StatusBadge from '@/components/shared/StatusBadge'
import { BROOM_STATUS_COLORS, BROOM_STATUS_LABELS } from '@/models/broom'
import { Skeleton } from '@/components/ui/skeleton'

export default function RoomListPage() {
  const router = useRouter()
  const { setHeaderTitle } = useUiStore()
  const { data, isLoading } = useRoomList()

  useEffect(() => {
    setHeaderTitle('My Rooms')
  }, [setHeaderTitle])

  return (
    <PageWrapper>
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.results.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          You haven't opened any boxes yet.
        </p>
      )}

      <div className="space-y-2">
        {data?.results.map(room => (
          <button
            key={room.id}
            onClick={() => router.push(`/rooms/${room.id}`)}
            className="w-full text-left bg-card border rounded-xl p-4 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Room #{room.id}</p>
              <StatusBadge
                label={BROOM_STATUS_LABELS[room.status]}
                colorClass={BROOM_STATUS_COLORS[room.status]}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {room.entry_count}/10 boxes opened
            </p>
          </button>
        ))}
      </div>
    </PageWrapper>
  )
}
