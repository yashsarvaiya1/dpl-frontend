// components/teams/TeamDetailPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useTeam, useDeleteTeam } from '@/hooks/useTeam'
import { usePlayerList, useDeletePlayer } from '@/hooks/usePlayer'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import AddPlayerDialog from './AddPlayerDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Props { id: number }

export default function TeamDetailPage({ id }: Props) {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()

  const { data: team, isLoading }       = useTeam(id)
  const { data: playersData }           = usePlayerList({ team: id, page_size: 100 })
  const deleteTeam                      = useDeleteTeam()
  const deletePlayer                    = useDeletePlayer()

  const [showDeleteTeam,   setShowDeleteTeam]   = useState(false)
  const [deletePlayerId,   setDeletePlayerId]   = useState<number | null>(null)
  const [showAddPlayer,    setShowAddPlayer]    = useState(false)

  useEffect(() => {
    setHeaderTitle(team?.name || 'Team Detail')
    setShowBack(true)
    return () => setShowBack(false)
  }, [team?.name, setHeaderTitle, setShowBack])

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-10 w-full rounded-xl mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </PageWrapper>
  )

  if (!team) return (
    <PageWrapper>
      <p className="text-center text-sm text-destructive py-12">Team not found.</p>
    </PageWrapper>
  )

  const players = playersData?.results ?? []

  return (
    <PageWrapper>

      {/* ── Team Info Card ────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base">{team.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {players.length} player{players.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm" className="h-9"
              onClick={() => router.push(`/teams/${id}/edit`)}
            >
              <Pencil size={13} className="mr-1.5" /> Edit
            </Button>
            <Button
              variant="destructive" size="sm" className="h-9 w-9 p-0"
              onClick={() => setShowDeleteTeam(true)}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Players Section ───────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">
          Players ({players.length})
        </h2>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowAddPlayer(true)}>
          <Plus size={13} className="mr-1" /> Add Player
        </Button>
      </div>

      {players.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground">No players yet.</p>
          <button
            onClick={() => setShowAddPlayer(true)}
            className="text-xs text-primary font-medium mt-2"
          >
            Add the first player
          </button>
        </div>
      )}

      {players.length > 0 && (
        <div className="rounded-xl border border-border divide-y divide-border bg-card">
          {players.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-muted-foreground tabular-nums w-5 shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium truncate">{player.name}</span>
              </div>
              <Button
                variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                onClick={() => setDeletePlayerId(player.id)}
              >
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ── Dialogs ───────────────────────────────────── */}
      <ConfirmDialog
        open={showDeleteTeam}
        title="Delete Team"
        description="This will soft delete the team and all its players. Are you sure?"
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await deleteTeam.mutateAsync(id)
          router.push('/teams')
        }}
        onCancel={() => setShowDeleteTeam(false)}
      />

      <ConfirmDialog
        open={deletePlayerId !== null}
        title="Remove Player"
        description="This will permanently remove the player from the team."
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          if (deletePlayerId !== null) {
            await deletePlayer.mutateAsync(deletePlayerId)
            setDeletePlayerId(null)
          }
        }}
        onCancel={() => setDeletePlayerId(null)}
      />

      <AddPlayerDialog
        open={showAddPlayer}
        teamId={id}
        onClose={() => setShowAddPlayer(false)}
      />

    </PageWrapper>
  )
}
