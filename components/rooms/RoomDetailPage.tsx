// components/rooms/RoomDetailPage.tsx

'use client'

import { useEffect } from 'react'
import { useRoom } from '@/hooks/useRoom'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import StatusBadge from '@/components/shared/StatusBadge'
import { BROOM_STATUS_COLORS, BROOM_STATUS_LABELS } from '@/models/broom'
import { Skeleton } from '@/components/ui/skeleton'

interface Props { id: number }

export default function RoomDetailPage({ id }: Props) {
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { data: room, isLoading } = useRoom(id)

  useEffect(() => {
    setHeaderTitle(`Room #${id}`)
    setShowBack(true)
    return () => setShowBack(false)
  }, [id, setHeaderTitle, setShowBack])

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-16 w-full rounded-xl mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </PageWrapper>
  )

  if (!room) return null

  const myBox = room.my_entry?.box_value

  return (
    <PageWrapper>
      {/* Room Status */}
      <div className="bg-card border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-sm">Room #{room.id}</p>
          <StatusBadge
            label={BROOM_STATUS_LABELS[room.status]}
            colorClass={BROOM_STATUS_COLORS[room.status]}
          />
        </div>
        <p className="text-xs text-muted-foreground">{room.entries_count}/10 boxes opened</p>
        {myBox && (
          <div className="mt-2 bg-primary/10 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground">Your box</p>
            <p className="text-lg font-bold text-primary">{myBox}</p>
          </div>
        )}
      </div>

      {/* All Positions with Scores */}
      <h2 className="font-semibold text-sm mb-3">Positions & Scores</h2>
      <div className="space-y-2">
        {room.positions?.map(pos => {
          const isMyBox = pos.position_label === myBox

          return (
            <div
              key={pos.position_label}
              className={`flex items-center justify-between p-3 rounded-xl border text-sm
                ${isMyBox ? 'bg-primary/10 border-primary' : 'bg-card'}`}
            >
              <div>
                <span className={`font-bold text-xs uppercase ${isMyBox ? 'text-primary' : 'text-muted-foreground'}`}>
                  {pos.position_label}
                  {isMyBox && ' ← yours'}
                </span>
                <p className="text-sm mt-0.5">
                  {pos.is_no_player ? 'No Player' : (pos.player_name || 'Not assigned')}
                </p>
              </div>
              <span className="font-bold text-base">
                {pos.score !== null ? `${pos.score}` : '—'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Winner Info */}
      {room.status === 'completed' && myBox && room.positions && (
        <div className="mt-6">
          {(() => {
            const maxScore = Math.max(...room.positions.map(p => p.score ?? 0))
            const winners = room.positions.filter(p => (p.score ?? 0) === maxScore)
            const isWinner = winners.some(w => w.position_label === myBox)

            return (
              <div className={`rounded-xl p-4 text-center ${isWinner ? 'bg-green-50 border border-green-200' : 'bg-muted'}`}>
                {isWinner ? (
                  <>
                    <p className="text-2xl mb-1">🏆</p>
                    <p className="font-bold text-green-700">You Won!</p>
                    <p className="text-xs text-green-600 mt-1">Check your ticket history for reward.</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl mb-1">😔</p>
                    <p className="font-medium text-muted-foreground">Better luck next time.</p>
                  </>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </PageWrapper>
  )
}
