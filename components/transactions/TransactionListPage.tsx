// components/transactions/TransactionListPage.tsx

'use client'

import { useEffect } from 'react'
import { useTransactionList } from '@/hooks/useTransaction'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import PageWrapper from '@/components/shared/PageWrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const REASON_LABELS: Record<string, string> = {
  admin_add: 'Admin Added',
  admin_remove: 'Admin Removed',
  box_open: 'Box Opened',
  win_reward: 'Win Reward',
  refund: 'Refund',
}

export default function TransactionListPage() {
  const { setHeaderTitle } = useUiStore()
  const isAdmin = useAuthStore(s => s.isAdmin())
  const isSuperUser = useAuthStore(s => s.isSuperUser())
  const { data, isLoading } = useTransactionList()

  useEffect(() => {
    setHeaderTitle('Ticket History')
  }, [setHeaderTitle])

  return (
    <PageWrapper>
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.results.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No transactions yet.</p>
      )}

      <div className="space-y-2">
        {data?.results.map(tx => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 bg-card border rounded-xl min-h-14"
          >
            <div>
              <p className="text-sm font-medium">{REASON_LABELS[tx.reason] || tx.reason}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {(isAdmin || isSuperUser) && (
                  <span>{tx.username || tx.mobile_number}</span>
                )}
                <span>{new Date(tx.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
            <span className={cn(
              'font-bold text-base',
              tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500'
            )}>
              {tx.transaction_type === 'credit' ? '+' : '-'}{tx.amount}
            </span>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
