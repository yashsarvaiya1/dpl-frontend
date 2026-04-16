// components/teams/TeamListPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight, Users, Search } from 'lucide-react'
import { useTeamList } from '@/hooks/useTeam'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeamListPage() {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    setHeaderTitle('Teams')
    setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError } = useTeamList(
    debouncedSearch ? { search: debouncedSearch } : undefined
  )

  return (
    <PageWrapper>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-center text-sm text-destructive py-12">
          Failed to load teams.
        </p>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No teams found.
        </p>
      )}

      {/* List */}
      {!isLoading && !isError && data && data.results.length > 0 && (
        <div className="space-y-2">
          {data.results.map(team => (
            <button
              key={team.id}
              onClick={() => router.push(`/teams/${team.id}`)}
              className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users size={15} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{team.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {team.players?.length ?? 0} player{team.players?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <Button
        onClick={() => router.push('/teams/new')}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-xl z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

    </PageWrapper>
  )
}
