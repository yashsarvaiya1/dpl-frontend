// components/shared/TransactionItem.tsx

import { cn } from '@/lib/utils'
import { TicketTransaction } from '@/lib/types'

export const REASON_LABELS: Record<string, string> = {
  admin_add:    'Admin Added',
  admin_remove: 'Admin Removed',
  box_open:     'Box Opened',
  win_reward:   'Win Reward',
  refund:       'Refund',
}

export function TransactionItem({ tx }: { tx: TicketTransaction }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">
          {REASON_LABELS[tx.reason] ?? tx.reason}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(tx.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      </div>
      <span className={cn(
        'font-bold text-sm ml-4 shrink-0',
        tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500'
      )}>
        {tx.transaction_type === 'credit' ? '+' : '−'}{tx.amount}
      </span>
    </div>
  )
}
