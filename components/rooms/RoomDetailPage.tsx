// components/rooms/RoomDetailPage.tsx

'use client'

import { useEffect } from 'react'
import { useRoom } from '@/hooks/useRoom'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import StatusBadge from '@/components/shared/StatusBadge'
import { BROOM_STATUS_COLORS, BROOM_STATUS_LABELS } from '@/models/broom'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { BoxIcon } from 'lucide-react'

interface Props { id: number }

export default function RoomDetailPage({ id }: Props) {
  const { setHeaderTitle, setShowBack } = useUiStore()
  // useRoom returns BRoomDetail which has is_winner + entries_count + positions
  const { data: room, isLoading, isError } = useRoom(id)

  useEffect(() => {
    setHeaderTitle(`Room #${id}`)
    setShowBack(true)
    return () => setShowBack(false)
  }, [id, setHeaderTitle, setShowBack])

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-24 w-full rounded-xl mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </PageWrapper>
  )

  if (isError || !room) return (
    <PageWrapper>
      <p className="text-center text-sm text-destructive py-12">Failed to load room.</p>
    </PageWrapper>
  )

  const myBox = room.my_entry?.box_value

  // ← is_winner is on BRoomDetail directly, not on my_entry
  const isWinner = room.is_winner

  // Max score for highlighting winning position
  const maxScore = room.positions?.length
    ? Math.max(...room.positions.map(p => p.score ?? -Infinity))
    : null

  return (
    <PageWrapper>

      {/* ── Room Header ───────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm">Room #{room.id}</p>
          <StatusBadge
            label={BROOM_STATUS_LABELS[room.status]}
            colorClass={BROOM_STATUS_COLORS[room.status]}
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BoxIcon className="w-3.5 h-3.5" />
          {/* ← BRoomDetail uses entries_count */}
          <span>{room.entries_count}/10 boxes opened</span>
        </div>

        {myBox && (
          <div className="bg-primary/10 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground">Your box</p>
            <p className="text-xl font-bold text-primary tabular-nums">{myBox}</p>
          </div>
        )}
      </div>

      {/* ── Positions ─────────────────────────────────── */}
      <h2 className="font-semibold text-sm mb-3">Positions &amp; Scores</h2>
      <div className="rounded-xl border border-border divide-y divide-border bg-card mb-4">
        {room.positions?.map(pos => {
          const isMyBox  = pos.position_label === myBox
          const isWinPos = maxScore !== null
            && pos.score === maxScore
            && room.status === 'completed'

          return (
            <div
              key={pos.position_label}
              className={cn(
                'flex items-center justify-between px-4 py-3',
                isMyBox && 'bg-primary/5'
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    'text-xs font-bold uppercase tracking-wide',
                    isMyBox ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {pos.position_label}
                  </span>
                  {isMyBox && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      yours
                    </span>
                  )}
                  {isWinPos && (
                    <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
                      winner
                    </span>
                  )}
                </div>
                <p className="text-sm mt-0.5 truncate">
                  {pos.is_no_player
                    ? 'No Player'
                    : (pos.player_name || 'Not assigned')}
                </p>
              </div>
              <span className="font-bold text-base tabular-nums ml-3 shrink-0">
                {pos.score !== null ? pos.score : '—'}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Winner Banner — uses BRoomDetail.is_winner ─ */}
      {room.status === 'completed' && myBox && (
        <div className={cn(
          'rounded-xl p-5 text-center border',
          isWinner
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-muted border-border'
        )}>
          {isWinner ? (
            <>
              <p className="text-3xl mb-2">🏆</p>
              <p className="font-bold text-green-600 text-lg">You Won!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check your ticket history for your reward.
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl mb-2">😔</p>
              <p className="font-medium text-muted-foreground">Better luck next time.</p>
            </>
          )}
        </div>
      )}

    </PageWrapper>
  )
}
