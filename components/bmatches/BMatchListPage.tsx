// components/bmatches/BMatchListPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight, Search, Ticket, CalendarDays, X } from 'lucide-react'
import { useBMatchList } from '@/hooks/useBMatch'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { BMATCH_STATUS_LABELS, BMATCH_STATUS_COLORS } from '@/models/bmatch'
import { BMatchStatus } from '@/lib/types'
import PageWrapper from '@/components/shared/PageWrapper'
import StatusBadge from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const STATUS_TABS: { label: string; value: BMatchStatus | 'all' }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Active',    value: 'active'    },
  { label: 'Upcoming',  value: 'upcoming'  },
  { label: 'Closed',    value: 'closed'    },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function BMatchListPage() {
  const router      = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const isAdmin     = useAuthStore(s => s.isAdmin())
  const isSuperUser = useAuthStore(s => s.isSuperUser())
  const canCreate   = isAdmin || isSuperUser

  const [activeTab, setActiveTab]               = useState<BMatchStatus | 'all'>('active')
  const [search, setSearch]                     = useState('')
  const [debouncedSearch, setDebouncedSearch]   = useState('')
  const [dateFilter, setDateFilter]             = useState('')

  useEffect(() => {
    setHeaderTitle('BMatches')
    setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const query: Record<string, unknown> = {}
  if (activeTab !== 'all')  query.status = activeTab
  if (debouncedSearch)      query.search = debouncedSearch
  if (dateFilter) query['match__date'] = dateFilter

  const { data, isLoading, isError } = useBMatchList(query)

  const hasActiveFilters = activeTab !== 'all' || !!search || !!dateFilter

  const clearFilters = () => {
    setActiveTab('all')
    setSearch('')
    setDateFilter('')
  }

  return (
    <PageWrapper>

      {/* ── Search + Date row ─────────────────────────── */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        {/* Date filter */}
        <div className="relative">
          <Input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className={cn(
              'h-11 w-11 cursor-pointer p-0 text-transparent',
              '[&::-webkit-calendar-picker-indicator]:opacity-0',
              '[&::-webkit-calendar-picker-indicator]:absolute',
              '[&::-webkit-calendar-picker-indicator]:inset-0',
              '[&::-webkit-calendar-picker-indicator]:w-full',
              '[&::-webkit-calendar-picker-indicator]:h-full',
              '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
              dateFilter && 'border-primary'
            )}
          />
          <CalendarDays className={cn(
            'absolute inset-0 m-auto w-4 h-4 pointer-events-none',
            dateFilter ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
      </div>

      {/* Date chip — show selected date + clear */}
      {dateFilter && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {dateFilter}
            <button onClick={() => setDateFilter('')} className="ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {/* ── Status Pill Tabs ──────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Clear filters row */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-xs text-muted-foreground mb-3 hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" /> Clear all filters
        </button>
      )}

      {/* ── Loading ───────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────── */}
      {isError && (
        <p className="text-center text-sm text-destructive py-12">
          Failed to load BMatches.
        </p>
      )}

      {/* ── Empty ─────────────────────────────────────── */}
      {!isLoading && !isError && data?.results.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <p className="text-sm text-muted-foreground">No BMatches found.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-primary font-medium">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── List ──────────────────────────────────────── */}
      {!isLoading && !isError && data && data.results.length > 0 && (
        <div className="space-y-3">
          {data.results.map(bm => (
            <button
              key={bm.id}
              onClick={() => router.push(`/bmatches/${bm.id}`)}
              className="w-full text-left bg-card border border-border rounded-xl p-4 space-y-2 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {bm.match_detail?.team_1_name} vs {bm.match_detail?.team_2_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {bm.match_detail?.date}
                    {bm.created_by_name && ` · by ${bm.created_by_name}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusBadge
                    label={BMATCH_STATUS_LABELS[bm.status]}
                    colorClass={BMATCH_STATUS_COLORS[bm.status]}
                  />
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5" />
                  {bm.ticket_amount} tickets
                </span>
                {bm.note && (
                  <span className="truncate max-w-35">📝 {bm.note}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── FAB — admin/superuser only ────────────────── */}
      {canCreate && (
        <Button
          onClick={() => router.push('/bmatches/new')}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-xl z-40"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

    </PageWrapper>
  )
}
