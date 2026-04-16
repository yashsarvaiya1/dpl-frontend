// components/teams/TeamDetailPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useTeam, useDeleteTeam } from '@/hooks/useTeam'
import { usePlayerList, useDeletePlayer } from '@/hooks/usePlayer'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import AddPlayerDialog from './AddPlayerDialog'

interface Props { id: number }

export default function TeamDetailPage({ id }: Props) {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { data: team, isLoading } = useTeam(id)
  const { data: playersData } = usePlayerList({ team: id, page_size: 100 })
  const deleteTeam = useDeleteTeam()
  const deletePlayer = useDeletePlayer()

  const [showDeleteTeam, setShowDeleteTeam] = useState(false)
  const [showDeletePlayer, setShowDeletePlayer] = useState<number | null>(null)
  const [showAddPlayer, setShowAddPlayer] = useState(false)

  useEffect(() => {
    setHeaderTitle(team?.name || 'Team Detail')
    setShowBack(true)
    return () => setShowBack(false)
  }, [team?.name, setHeaderTitle, setShowBack])

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      {/* Team Actions */}
      <div className="flex gap-2 mb-6">
        <Button
          variant="outline" size="sm" className="flex-1"
          onClick={() => router.push(`/teams/${id}/edit`)}
        >
          <Pencil size={14} className="mr-1" /> Edit Team
        </Button>
        <Button
          variant="destructive" size="sm"
          onClick={() => setShowDeleteTeam(true)}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Players Section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">Players ({playersData?.results.length || 0})</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAddPlayer(true)}>
          <Plus size={14} className="mr-1" /> Add Player
        </Button>
      </div>

      {playersData?.results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No players yet.
        </p>
      )}

      <div className="space-y-2">
        {playersData?.results.map(player => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-card border rounded-xl min-h-12"
          >
            <span className="text-sm font-medium">{player.name}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8"
                onClick={() => setShowDeletePlayer(player.id)}
              >
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Team Confirm */}
      <ConfirmDialog
        open={showDeleteTeam}
        title="Delete Team"
        description="This will soft delete the team. Are you sure?"
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await deleteTeam.mutateAsync(id)
          router.push('/teams')
        }}
        onCancel={() => setShowDeleteTeam(false)}
      />

      {/* Delete Player Confirm */}
      <ConfirmDialog
        open={showDeletePlayer !== null}
        title="Remove Player"
        description="This will permanently remove the player. Are you sure?"
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          if (showDeletePlayer) {
            await deletePlayer.mutateAsync(showDeletePlayer)
            setShowDeletePlayer(null)
          }
        }}
        onCancel={() => setShowDeletePlayer(null)}
      />

      {/* Add Player Dialog */}
      <AddPlayerDialog
        open={showAddPlayer}
        teamId={id}
        onClose={() => setShowAddPlayer(false)}
      />
    </PageWrapper>
  )
}
