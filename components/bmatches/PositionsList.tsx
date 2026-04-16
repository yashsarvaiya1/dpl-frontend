// components/bmatches/PositionsList.tsx

'use client'

import { useState } from 'react'
import { useBMatchPositions, useOverrideBMatchPosition } from '@/hooks/useBMatch'
import { usePlayerList } from '@/hooks/usePlayer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { BMatchPosition } from '@/lib/types'
import { useMatch } from '@/hooks/useMatch'

interface Props {
  bmatchId: number
  matchId: number
  canOverride: boolean
}

export default function PositionsList({ bmatchId, matchId, canOverride }: Props) {
  const { data: positions } = useBMatchPositions(bmatchId)
  const { data: match } = useMatch(matchId)
  const overridePosition = useOverrideBMatchPosition()
  const { data: team1Players } = usePlayerList({ team: match?.team_1, page_size: 100 })
  const { data: team2Players } = usePlayerList({ team: match?.team_2, page_size: 100 })
  const [editing, setEditing] = useState<Record<number, Partial<BMatchPosition>>>({})

  const allPlayers = [...(team1Players?.results || []), ...(team2Players?.results || [])]

  const handleSave = async (pos: BMatchPosition) => {
    const edits = editing[pos.id]
    if (!edits) return
    await overridePosition.mutateAsync({ bmatchId, posId: pos.id, data: edits })
    setEditing(prev => { const n = { ...prev }; delete n[pos.id]; return n })
  }

  return (
    <div>
      <h2 className="font-semibold text-sm mb-3">Positions</h2>
      <div className="space-y-2">
        {positions?.map(pos => {
          const edits = editing[pos.id]
          const isEditing = !!edits

          return (
            <div key={pos.id} className="bg-card border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-primary">
                  {pos.position_label}
                </span>
                {canOverride && (
                  <Button
                    variant="ghost" size="sm" className="h-7 text-xs"
                    onClick={() => {
                      if (isEditing) handleSave(pos)
                      else setEditing(prev => ({
                        ...prev,
                        [pos.id]: {
                          player: pos.player,
                          score: pos.score,
                          is_no_player: pos.is_no_player
                        }
                      }))
                    }}
                  >
                    {isEditing ? 'Save' : 'Override'}
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Select
                    value={edits.player ? String(edits.player) : 'no_player'}
                    onValueChange={val => setEditing(prev => ({
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
                    type="number" placeholder="Score" className="h-9 text-sm"
                    value={edits.score ?? ''}
                    onChange={e => setEditing(prev => ({
                      ...prev,
                      [pos.id]: { ...prev[pos.id], score: Number(e.target.value) }
                    }))}
                  />
                </div>
              ) : (
                <div className="flex justify-between text-sm">
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
    </div>
  )
}
