// components/matches/MatchListPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight } from 'lucide-react'
import { useMatchList } from '@/hooks/useMatch'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function MatchListPage() {
  const router = useRouter()
  const { setHeaderTitle } = useUiStore()
  const { data, isLoading } = useMatchList()

  useEffect(() => {
    setHeaderTitle('Matches')
  }, [setHeaderTitle])

  return (
    <PageWrapper>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => router.push('/matches/new')}>
          <Plus size={16} className="mr-1" /> New Match
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.results.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No matches yet.</p>
      )}

      <div className="space-y-2">
        {data?.results.map(match => (
          <button
            key={match.id}
            onClick={() => router.push(`/matches/${match.id}`)}
            className="w-full flex items-center justify-between p-4 bg-card border rounded-xl min-h-16 text-left"
          >
            <div>
              <p className="font-semibold text-sm">
                {match.team_1_detail?.name} vs {match.team_2_detail?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {match.date} · {match.start_time} – {match.end_time}
              </p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </PageWrapper>
  )
}
