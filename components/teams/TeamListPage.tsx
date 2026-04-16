// components/teams/TeamListPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight, Users } from 'lucide-react'
import { useTeamList } from '@/hooks/useTeam'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeamListPage() {
  const router = useRouter()
  const { setHeaderTitle } = useUiStore()
  const { data, isLoading } = useTeamList()

  useEffect(() => {
    setHeaderTitle('Teams')
  }, [setHeaderTitle])

  return (
    <PageWrapper>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => router.push('/teams/new')}>
          <Plus size={16} className="mr-1" /> New Team
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.results.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No teams yet. Create one!
        </div>
      )}

      <div className="space-y-2">
        {data?.results.map(team => (
          <button
            key={team.id}
            onClick={() => router.push(`/teams/${team.id}`)}
            className="w-full flex items-center justify-between p-4 bg-card border rounded-xl min-h-14 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users size={14} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{team.name}</p>
                <p className="text-xs text-muted-foreground">
                  {team.players?.length || 0} players
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </PageWrapper>
  )
}
