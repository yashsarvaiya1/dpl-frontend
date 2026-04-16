// components/bmatches/BMatchListPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight } from 'lucide-react'
import { useBMatchList } from '@/hooks/useBMatch'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { BMATCH_STATUS_LABELS, BMATCH_STATUS_COLORS } from '@/models/bmatch'
import { BMatchStatus } from '@/lib/types'
import PageWrapper from '@/components/shared/PageWrapper'
import StatusBadge from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_FILTERS: { label: string; value: BMatchStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Closed', value: 'closed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function BMatchListPage() {
  const router = useRouter()
  const { setHeaderTitle } = useUiStore()
  const isAdmin = useAuthStore(s => s.isAdmin())
  const isSuperUser = useAuthStore(s => s.isSuperUser())
  const [statusFilter, setStatusFilter] = useState<BMatchStatus | 'all'>('active')

  const { data, isLoading } = useBMatchList(
    statusFilter === 'all' ? {} : { status: statusFilter }
  )

  useEffect(() => {
    setHeaderTitle('BMatches')
  }, [setHeaderTitle])

  return (
    <PageWrapper>
      {/* Status Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === f.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Admin Create Button */}
      {(isAdmin || isSuperUser) && (
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => router.push('/bmatches/new')}>
            <Plus size={16} className="mr-1" /> New BMatch
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.results.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No bmatches found.</p>
      )}

      <div className="space-y-3">
        {data?.results.map(bm => (
          <button
            key={bm.id}
            onClick={() => router.push(`/bmatches/${bm.id}`)}
            className="w-full text-left bg-card border rounded-xl p-4 space-y-2 min-h-18"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">
                  {bm.match_detail?.team_1_detail?.name} vs {bm.match_detail?.team_2_detail?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {bm.match_detail?.date} · by {bm.created_by_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label={BMATCH_STATUS_LABELS[bm.status]}
                  colorClass={BMATCH_STATUS_COLORS[bm.status]}
                />
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>🎟 {bm.ticket_amount} tickets</span>
              {bm.note && <span className="truncate max-w-40">📝 {bm.note}</span>}
            </div>
          </button>
        ))}
      </div>
    </PageWrapper>
  )
}
