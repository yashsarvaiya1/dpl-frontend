// components/matches/MatchDetailPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X } from 'lucide-react'
import { useMatch, useDeleteMatch, useMatchPositions, useUpdateMatchPosition } from '@/hooks/useMatch'
import { useUiStore } from '@/stores/uiStore'
import { usePlayerList } from '@/hooks/usePlayer'
import PageWrapper from '@/components/shared/PageWrapper'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { MatchPosition } from '@/lib/types'

interface Props { id: number }

export default function MatchDetailPage({ id }: Props) {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { data: match, isLoading } = useMatch(id)
  const { data: positions } = useMatchPositions(id)
  const deleteMatch = useDeleteMatch()
  const updatePosition = useUpdateMatchPosition()
  const { data: team1Players } = usePlayerList({ team: match?.team_1, page_size: 100 })
  const { data: team2Players } = usePlayerList({ team: match?.team_2, page_size: 100 })
  const [showDelete, setShowDelete] = useState(false)
  const [editingPos, setEditingPos] = useState<Record<number, Partial<MatchPosition>>>({})

  useEffect(() => {
    setHeaderTitle('Match Detail')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  const allPlayers = [
    ...(team1Players?.results || []),
    ...(team2Players?.results || [])
  ]

  const handlePositionSave = async (pos: MatchPosition) => {
    const edits = editingPos[pos.id]
    if (!edits) return
    await updatePosition.mutateAsync({ id: pos.id, data: edits })
    setEditingPos(prev => {
      const next = { ...prev }
      delete next[pos.id]
      return next
    })
  }

  const handleCancelEdit = (posId: number) => {
    setEditingPos(prev => {
      const next = { ...prev }
      delete next[posId]
      return next
    })
  }

  const handleStartEdit = (pos: MatchPosition) => {
    setEditingPos(prev => ({
      ...prev,
      [pos.id]: {
        player: pos.player,
        score: pos.score,
        is_no_player: pos.is_no_player
      }
    }))
  }

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-8 w-3/4 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      {/* Match Info */}
      <div className="bg-card border rounded-xl p-4 mb-4">
        <p className="font-bold text-base">
          {match?.team_1_detail?.name} vs {match?.team_2_detail?.name}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {match?.date} · {match?.start_time} – {match?.end_time}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <Button variant="outline" size="sm" className="flex-1"
          onClick={() => router.push(`/matches/${id}/edit`)}>
          <Pencil size={14} className="mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Positions */}
      <h2 className="font-semibold text-sm mb-3">Positions</h2>
      <div className="space-y-3">
        {(positions as MatchPosition[] | undefined)?.map((pos: MatchPosition) => {
          const edits = editingPos[pos.id] || {}
          const isEditing = !!editingPos[pos.id]

          return (
            <div key={pos.id} className="bg-card border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-primary">
                  {pos.position_label}
                </span>

                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleCancelEdit(pos.id)}
                      >
                        <X size={12} className="mr-0.5" /> Cancel
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 text-xs"
                        onClick={() => handlePositionSave(pos)}
                        disabled={updatePosition.isPending}
                      >
                        {updatePosition.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost" size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleStartEdit(pos)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Select
                    value={edits.player ? String(edits.player) : 'no_player'}
                    onValueChange={val => setEditingPos(prev => ({
                      ...prev,
                      [pos.id]: {
                        ...prev[pos.id],
                        player: val === 'no_player' ? null : Number(val),
                        is_no_player: val === 'no_player'
                      }
                    }))}
                  >
                    <SelectTrigger className="min-h-10 text-xs">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_player">No Player</SelectItem>
                      {allPlayers.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Score"
                    className="h-9 text-sm"
                    value={edits.score ?? ''}
                    onChange={e => setEditingPos(prev => ({
                      ...prev,
                      [pos.id]: { ...prev[pos.id], score: Number(e.target.value) }
                    }))}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {pos.is_no_player ? 'No Player' : (pos.player_name || 'Not assigned')}
                  </span>
                  <span className="font-semibold">
                    {pos.score !== null ? `${pos.score} pts` : '—'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Match"
        description="This will soft delete the match. All related BMatches will be affected."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await deleteMatch.mutateAsync(id)
          router.push('/matches')
        }}
        onCancel={() => setShowDelete(false)}
      />
    </PageWrapper>
  )
}
