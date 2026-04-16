// components/transactions/TransactionListPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTransactionList } from '@/hooks/useTransaction'
import { useUsers } from '@/hooks/useUser'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import PageWrapper from '@/components/shared/PageWrapper'
import { REASON_LABELS } from '@/components/shared/TransactionItem'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TicketTransaction, TransactionReason, TransactionType } from '@/lib/types'
import { Filter, X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Filters {
  user?: string        // user id as string for select
  transaction_type?: TransactionType | ''
  reason?: TransactionReason | ''
  date_from?: string   // YYYY-MM-DD
  date_to?: string
}

// ── Transaction Row ────────────────────────────────────────────────────────────
function TransactionRow({
  tx,
  showUser,
}: {
  tx: TicketTransaction
  showUser: boolean
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">
            {REASON_LABELS[tx.reason] ?? tx.reason}
          </p>
          <span className={cn(
            'text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0',
            tx.transaction_type === 'credit'
              ? 'bg-green-500/10 text-green-600'
              : 'bg-destructive/10 text-destructive'
          )}>
            {tx.transaction_type}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
          {showUser && (tx.username || tx.mobile_number) && (
            <span className="font-medium text-foreground/70">
              {tx.username || tx.mobile_number}
            </span>
          )}
          <span>
            {new Date(tx.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
          {showUser && tx.reference_bmatch && (
            <span className="text-primary/70">
              BMatch #{tx.reference_bmatch}
            </span>
          )}
        </div>
      </div>
      <span className={cn(
        'font-bold text-base tabular-nums shrink-0',
        tx.transaction_type === 'credit' ? 'text-green-600' : 'text-destructive'
      )}>
        {tx.transaction_type === 'credit' ? '+' : '−'}{tx.amount}
      </span>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TransactionListPage() {
  const { setHeaderTitle, setShowBack } = useUiStore()
  const isElevated  = useAuthStore(s => s.isElevated())
  const currentUser = useAuthStore(s => s.user)

  const searchParams = useSearchParams()
  const userIdParam  = searchParams.get('user')   // pre-fill from UserDetailPage

  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    user:             userIdParam ?? '',
    transaction_type: '',
    reason:           '',
    date_from:        '',
    date_to:          '',
  })

  // Users list for admin user-filter dropdown
  const { data: usersData } = useUsers(
    isElevated ? { page_size: 200 } : undefined
  )

  // Build query params for API
  const queryParams: Record<string, unknown> = {
    ordering:  '-created_at',
    page_size: 100,
  }

  if (isElevated) {
    if (filters.user)             queryParams.user             = Number(filters.user)
    if (filters.transaction_type) queryParams.transaction_type = filters.transaction_type
    if (filters.reason)           queryParams.reason           = filters.reason
    if (filters.date_from)        queryParams.created_at__date__gte = filters.date_from
    if (filters.date_to)          queryParams.created_at__date__lte = filters.date_to
  } else {
    // Normal users always see only their own
    queryParams.user = currentUser?.id
  }

  const { data, isLoading, isError } = useTransactionList(queryParams)

  const hasActiveFilters = isElevated && (
    !!filters.user || !!filters.transaction_type ||
    !!filters.reason || !!filters.date_from || !!filters.date_to
  )

  const clearFilters = () => setFilters({
    user: '', transaction_type: '', reason: '', date_from: '', date_to: '',
  })

  const setFilter = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters(prev => ({ ...prev, [key]: val }))

  useEffect(() => {
    setHeaderTitle('Ticket History')
    setShowBack(!!userIdParam)
  }, [setHeaderTitle, setShowBack, userIdParam])

  // Pre-fill user filter if coming from UserDetailPage
  useEffect(() => {
    if (userIdParam) {
      setFilters(prev => ({ ...prev, user: userIdParam }))
      setShowFilters(true)
    }
  }, [userIdParam])

  return (
    <PageWrapper>
      <div className="space-y-4">

        {/* ── Filter Toggle (admin only) ───────────────── */}
        {isElevated && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(p => !p)}
              className={cn(
                'flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors',
                showFilters || hasActiveFilters
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-destructive font-medium"
              >
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>
        )}

        {/* ── Filter Panel ─────────────────────────────── */}
        {isElevated && showFilters && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">

            {/* User filter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">User</p>
              <Select
                value={filters.user ?? ''}
                onValueChange={val => setFilter('user', val === 'all' ? '' : val)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {usersData?.results.map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.username || u.mobile_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type filter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Type</p>
              <Select
                value={filters.transaction_type ?? ''}
                onValueChange={val =>
                  setFilter('transaction_type', val === 'all' ? '' : val as TransactionType)
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason filter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Reason</p>
              <Select
                value={filters.reason ?? ''}
                onValueChange={val =>
                  setFilter('reason', val === 'all' ? '' : val as TransactionReason)
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  {Object.entries(REASON_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">From</p>
                <Input
                  type="date"
                  className="h-10 text-sm"
                  value={filters.date_from ?? ''}
                  max={filters.date_to || undefined}
                  onChange={e => setFilter('date_from', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">To</p>
                <Input
                  type="date"
                  className="h-10 text-sm"
                  value={filters.date_to ?? ''}
                  min={filters.date_from || undefined}
                  onChange={e => setFilter('date_to', e.target.value)}
                />
              </div>
            </div>

          </div>
        )}

        {/* ── Loading ───────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* ── Error ────────────────────────────────────── */}
        {isError && (
          <p className="text-center text-sm text-destructive py-12">
            Failed to load transactions.
          </p>
        )}

        {/* ── Empty ────────────────────────────────────── */}
        {!isLoading && !isError && data?.results.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm text-muted-foreground">No transactions found.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-primary font-medium">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── List ─────────────────────────────────────── */}
        {!isLoading && !isError && data && data.results.length > 0 && (
          <>
            {/* Summary row for admin */}
            {isElevated && (
              <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                <span>{data.count ?? data.results.length} transactions</span>
                <span className="flex gap-3">
                  <span className="text-green-600 font-medium">
                    +{data.results
                        .filter(t => t.transaction_type === 'credit')
                        .reduce((a, t) => a + t.amount, 0)}
                  </span>
                  <span className="text-destructive font-medium">
                    −{data.results
                        .filter(t => t.transaction_type === 'debit')
                        .reduce((a, t) => a + t.amount, 0)}
                  </span>
                </span>
              </div>
            )}

            <div className="rounded-xl border border-border divide-y divide-border bg-card">
              {data.results.map(tx => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  showUser={isElevated}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </PageWrapper>
  )
}
