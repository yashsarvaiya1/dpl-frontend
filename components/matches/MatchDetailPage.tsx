// components/matches/MatchDetailPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X, Check, ChevronsUpDown } from 'lucide-react'
import {
  useMatch, useDeleteMatch,
  useMatchPositions, useUpdateMatchPosition,
} from '@/hooks/useMatch'
import { useUiStore } from '@/stores/uiStore'
import { usePlayerList } from '@/hooks/usePlayer'
import PageWrapper from '@/components/shared/PageWrapper'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { MatchPosition } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props { id: number }

export default function MatchDetailPage({ id }: Props) {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()

  const { data: match,     isLoading } = useMatch(id)
  const { data: positions }            = useMatchPositions(id)
  const deleteMatch                    = useDeleteMatch()
  const updatePosition                 = useUpdateMatchPosition()

  const { data: team1Players } = usePlayerList({ team: match?.team_1, page_size: 100 })
  const { data: team2Players } = usePlayerList({ team: match?.team_2, page_size: 100 })

  const [showDelete, setShowDelete]   = useState(false)
  const [editingPos, setEditingPos]   = useState<Record<number, Partial<MatchPosition>>>({})
  const [openCombo, setOpenCombo]     = useState<Record<number, boolean>>({})

  const allPlayers = [
    ...(team1Players?.results ?? []),
    ...(team2Players?.results ?? []),
  ]

  useEffect(() => {
    setHeaderTitle('Match Detail')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  const startEdit   = (pos: MatchPosition) =>
    setEditingPos(prev => ({
      ...prev,
      [pos.id]: { player: pos.player, score: pos.score, is_no_player: pos.is_no_player },
    }))

  const cancelEdit  = (posId: number) =>
    setEditingPos(prev => { const n = { ...prev }; delete n[posId]; return n })

  const saveEdit    = async (pos: MatchPosition) => {
    const edits = editingPos[pos.id]
    if (!edits) return
    await updatePosition.mutateAsync({ id: pos.id, data: edits })
    cancelEdit(pos.id)
  }

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-24 w-full rounded-xl mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </PageWrapper>
  )

  if (!match) return (
    <PageWrapper>
      <p className="text-center text-sm text-destructive py-12">Match not found.</p>
    </PageWrapper>
  )

  return (
    <PageWrapper>

      {/* ── Match Info ────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <p className="font-bold text-base">
          {match.team_1_detail?.name} vs {match.team_2_detail?.name}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {match.date} · {match.start_time} – {match.end_time}
        </p>
      </div>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        <Button
          variant="outline" size="sm" className="flex-1 h-10"
          onClick={() => router.push(`/matches/${id}/edit`)}
        >
          <Pencil size={14} className="mr-1.5" /> Edit
        </Button>
        <Button
          variant="destructive" size="sm" className="h-10 w-10 p-0"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* ── Positions ─────────────────────────────────── */}
      <h2 className="font-semibold text-sm mb-3">Positions</h2>
      <div className="space-y-3">
        {(positions as MatchPosition[] | undefined)?.map(pos => {
          const edits     = editingPos[pos.id]
          const isEditing = !!edits
          const isComboOpen = openCombo[pos.id] ?? false

          const selectedPlayer = allPlayers.find(
            p => p.id === (edits?.player ?? pos.player)
          )

          return (
            <div key={pos.id} className="bg-card border border-border rounded-xl p-3 space-y-2">

              {/* Header row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-primary">
                  {pos.position_label}
                </span>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost" size="sm" className="h-7 text-xs text-destructive"
                        onClick={() => cancelEdit(pos.id)}
                      >
                        <X size={12} className="mr-0.5" /> Cancel
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="h-7 text-xs"
                        onClick={() => saveEdit(pos)}
                        disabled={updatePosition.isPending}
                      >
                        {updatePosition.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost" size="sm" className="h-7 text-xs"
                      onClick={() => startEdit(pos)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
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
                          !selectedPlayer && 'text-muted-foreground'
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
                                setEditingPos(prev => ({
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
                                  setEditingPos(prev => ({
                                    ...prev,
                                    [pos.id]: {
                                      ...prev[pos.id],
                                      player: p.id,
                                      is_no_player: false,
                                    },
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

                  {/* Score Input */}
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Score"
                    className="h-10 text-sm"
                    value={edits?.score ?? ''}
                    onChange={e => setEditingPos(prev => ({
                      ...prev,
                      [pos.id]: { ...prev[pos.id], score: Number(e.target.value) },
                    }))}
                  />
                </div>
              ) : (
                // View mode
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
