// components/matches/MatchListPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight, Search } from 'lucide-react'
import { useMatchList } from '@/hooks/useMatch'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function MatchListPage() {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    setHeaderTitle('Matches')
    setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError } = useMatchList(
    debouncedSearch ? { search: debouncedSearch } : undefined
  )

  return (
    <PageWrapper>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by team name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-center text-sm text-destructive py-12">
          Failed to load matches.
        </p>
      )}

      {!isLoading && !isError && data?.results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No matches found.
        </p>
      )}

      {!isLoading && !isError && data && data.results.length > 0 && (
        <div className="space-y-2">
          {data.results.map(match => (
            <button
              key={match.id}
              onClick={() => router.push(`/matches/${match.id}`)}
              className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl text-left active:scale-[0.98] transition-transform"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {match.team_1_detail?.name} vs {match.team_2_detail?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {match.date} · {match.start_time} – {match.end_time}
                </p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <Button
        onClick={() => router.push('/matches/new')}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-xl z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

    </PageWrapper>
  )
}
