// components/bmatches/PositionsList.tsx

'use client'

import { useState } from 'react'
import { useBMatchPositions, useOverrideBMatchPosition } from '@/hooks/useBMatch'
import { usePlayerList } from '@/hooks/usePlayer'
import { useMatch } from '@/hooks/useMatch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { BMatchPosition } from '@/lib/types'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  bmatchId: number
  matchId: number
  canOverride: boolean
}

export default function PositionsList({ bmatchId, matchId, canOverride }: Props) {
  const { data: positions }    = useBMatchPositions(bmatchId)
  const { data: match }        = useMatch(matchId)
  const overridePosition       = useOverrideBMatchPosition()

  const { data: team1Players } = usePlayerList({ team: match?.team_1, page_size: 100 })
  const { data: team2Players } = usePlayerList({ team: match?.team_2, page_size: 100 })

  const [editing, setEditing]   = useState<Record<number, Partial<BMatchPosition>>>({})
  const [openCombo, setOpenCombo] = useState<Record<number, boolean>>({})

  const allPlayers = [
    ...(team1Players?.results ?? []),
    ...(team2Players?.results ?? []),
  ]

  const startEdit  = (pos: BMatchPosition) =>
    setEditing(prev => ({
      ...prev,
      [pos.id]: { player: pos.player, score: pos.score, is_no_player: pos.is_no_player },
    }))

  const cancelEdit = (posId: number) =>
    setEditing(prev => { const n = { ...prev }; delete n[posId]; return n })

  const handleSave = async (pos: BMatchPosition) => {
    const edits = editing[pos.id]
    if (!edits) return
    await overridePosition.mutateAsync({ bmatchId, posId: pos.id, data: edits })
    cancelEdit(pos.id)
  }

  return (
    <div>
      <h2 className="font-semibold text-sm mb-3">Positions</h2>
      <div className="space-y-2">
        {positions?.map(pos => {
          const edits       = editing[pos.id]
          const isEditing   = !!edits
          const isComboOpen = openCombo[pos.id] ?? false
          const selectedPlayer = allPlayers.find(
            p => p.id === (edits?.player ?? pos.player)
          )

          return (
            <div key={pos.id} className="bg-card border border-border rounded-xl p-3 space-y-2">

              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-primary">
                  {pos.position_label}
                </span>
                {canOverride && (
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={() => cancelEdit(pos.id)}
                        >
                          <X size={12} className="mr-0.5" /> Cancel
                        </Button>
                        <Button
                          variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={() => handleSave(pos)}
                          disabled={overridePosition.isPending}
                        >
                          {overridePosition.isPending ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost" size="sm" className="h-7 text-xs"
                        onClick={() => startEdit(pos)}
                      >
                        Override
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Edit mode */}
              {isEditing ? (
                <div className="space-y-2">
                  {/* Player Combobox */}
                  <Popover
                    open={isComboOpen}
                    onOpenChange={open =>
                      setOpenCombo(prev => ({ ...prev, [pos.id]: open }))
                    }
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between h-10 px-3 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors"
                      >
                        <span className={cn(
                          'truncate',
                          !selectedPlayer && !edits?.is_no_player && 'text-muted-foreground'
                        )}>
                          {edits?.is_no_player
                            ? 'No Player'
                            : (selectedPlayer?.name ?? 'Select player')}
                        </span>
                        <ChevronsUpDown className="w-4 h-4 shrink-0 text-muted-foreground ml-2" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search player..." />
                        <CommandList>
                          <CommandEmpty>No players found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="no_player"
                              onSelect={() => {
                                setEditing(prev => ({
                                  ...prev,
                                  [pos.id]: { ...prev[pos.id], player: null, is_no_player: true },
                                }))
                                setOpenCombo(prev => ({ ...prev, [pos.id]: false }))
                              }}
                            >
                              <Check className={cn(
                                'w-4 h-4 mr-2',
                                edits?.is_no_player ? 'opacity-100' : 'opacity-0'
                              )} />
                              No Player
                            </CommandItem>
                            {allPlayers.map(p => (
                              <CommandItem
                                key={p.id}
                                value={p.name}
                                onSelect={() => {
                                  setEditing(prev => ({
                                    ...prev,
                                    [pos.id]: { ...prev[pos.id], player: p.id, is_no_player: false },
                                  }))
                                  setOpenCombo(prev => ({ ...prev, [pos.id]: false }))
                                }}
                              >
                                <Check className={cn(
                                  'w-4 h-4 mr-2',
                                  edits?.player === p.id ? 'opacity-100' : 'opacity-0'
                                )} />
                                {p.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Score */}
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Score"
                    className="h-10 text-sm"
                    value={edits?.score ?? ''}
                    onChange={e => setEditing(prev => ({
                      ...prev,
                      [pos.id]: { ...prev[pos.id], score: Number(e.target.value) },
                    }))}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {pos.is_no_player ? 'No Player' : (pos.player_name || 'Not assigned')}
                  </span>
                  <span className="font-semibold tabular-nums">
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
