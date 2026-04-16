// components/dashboard/DashboardPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useDashboard } from '@/hooks/useDashboard'
import { useUser } from '@/hooks/useUser'
import { useTransactionList } from '@/hooks/useTransaction'
import PageWrapper from '@/components/shared/PageWrapper'
import { TransactionItem } from '@/components/shared/TransactionItem'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users, Trophy, Ticket, TrendingUp,
  TrendingDown, Activity, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BMatch } from '@/lib/types'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// ── Shared ────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-card border rounded-xl p-4 flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', color)}>
        <Icon size={16} />
      </div>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-primary/10 text-primary',
  upcoming:  'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  closed:    'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
}

// ── Admin Dashboard ───────────────────────────────────────
function AdminDashboard() {
  const router = useRouter()
  const { data, isLoading } = useDashboard()

  if (isLoading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
  )

  if (!data) return null

  const chartData = data.chart.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }))

  return (
    <div className="space-y-5">

      {/* User Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Users" value={data.users.total}
          sub={`+${data.users.new_this_month} this month`}
          icon={Users} color="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          label="Active Users" value={data.users.active}
          icon={Activity} color="bg-green-500/10 text-green-600"
        />
        <StatCard
          label="Active BMatches" value={data.bmatches.active}
          sub={`${data.bmatches.upcoming} upcoming`}
          icon={Trophy} color="bg-purple-500/10 text-purple-600"
        />
        <StatCard
          label="Tickets in Play" value={data.tickets.total_in_circulation}
          sub={`${data.tickets.total_debited} used total`}
          icon={Ticket} color="bg-orange-500/10 text-orange-600"
        />
      </div>

      {/* Ticket Flow Chart */}
      <div className="bg-card border rounded-xl p-4">
        <p className="text-sm font-semibold mb-4">Ticket Flow — Last 7 Days</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradCredit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDebit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="credit" stroke="#22c55e"
              fill="url(#gradCredit)" name="Credited" strokeWidth={2} />
            <Area type="monotone" dataKey="debit"  stroke="#ef4444"
              fill="url(#gradDebit)"  name="Debited"  strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* BMatch Breakdown */}
      <div className="bg-card border rounded-xl p-4">
        <p className="text-sm font-semibold mb-3">BMatch Breakdown</p>
        <div className="space-y-2">
          {(['active', 'upcoming', 'closed', 'completed', 'cancelled'] as const).map(s => (
            <div key={s} className="flex items-center justify-between">
              <span className={cn(
                'text-xs px-2.5 py-0.5 rounded-full font-medium capitalize',
                STATUS_COLORS[s]
              )}>{s}</span>
              <span className="text-sm font-bold tabular-nums">{data.bmatches[s]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent BMatches — uses flat team names from MatchSummary */}
      {data.recent_bmatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-sm font-semibold">Recent BMatches</p>
            <button
              onClick={() => router.push('/bmatches')}
              className="flex items-center gap-0.5 text-xs text-primary font-medium"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {data.recent_bmatches.map((bm: BMatch) => (
              <button
                key={bm.id}
                onClick={() => router.push(`/bmatches/${bm.id}`)}
                className="w-full flex items-center justify-between p-3 bg-card border rounded-xl text-left active:scale-[0.98] transition-transform"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {/* ← flat names from MatchSummary, not team_1_detail.name */}
                    {bm.match_detail?.team_1_name} vs {bm.match_detail?.team_2_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bm.ticket_amount} tickets · {bm.match_detail?.date}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                    STATUS_COLORS[bm.status]
                  )}>{bm.status}</span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── User Dashboard ────────────────────────────────────────
function UserDashboard() {
  const router     = useRouter()
  const storedUser = useAuthStore(s => s.user)

  const { data: user }             = useUser(storedUser?.id ?? 0)
  // Fetch all-time totals with page_size=100 for accurate credit/debit sum
  const { data: allTxData }        = useTransactionList({
    user: storedUser?.id,
    page_size: 100,
    ordering: '-created_at',
  })
  // Separate last-5 for the preview list
  const { data: recentTxData, isLoading } = useTransactionList({
    user: storedUser?.id,
    page_size: 5,
    ordering: '-created_at',
  })

  const totalCredited = allTxData?.results
    .filter(t => t.transaction_type === 'credit')
    .reduce((a, t) => a + t.amount, 0) ?? 0

  const totalDebited = allTxData?.results
    .filter(t => t.transaction_type === 'debit')
    .reduce((a, t) => a + t.amount, 0) ?? 0

  return (
    <div className="space-y-5">

      {/* Balance + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border rounded-xl p-4 text-center">
          <Ticket size={20} className="mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Ticket Balance</p>
          <p className="text-2xl font-bold tabular-nums">{user?.tickets ?? 0}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <Activity size={20} className="mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Status</p>
          <p className={cn(
            'text-base font-bold mt-0.5',
            user?.is_active ? 'text-green-600' : 'text-destructive'
          )}>
            {user?.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      {/* All-time Totals — computed from full history, not last 5 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border rounded-xl p-4 text-center">
          <TrendingUp size={20} className="mx-auto text-green-500 mb-1" />
          <p className="text-xs text-muted-foreground">Total Credited</p>
          <p className="text-xl font-bold tabular-nums">{totalCredited}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <TrendingDown size={20} className="mx-auto text-red-500 mb-1" />
          <p className="text-xs text-muted-foreground">Total Used</p>
          <p className="text-xl font-bold tabular-nums">{totalDebited}</p>
        </div>
      </div>

      {/* Recent Transactions — last 5 preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <p className="text-sm font-semibold">Recent Transactions</p>
          <button
            onClick={() => router.push('/transactions')}
            className="flex items-center gap-0.5 text-xs text-primary font-medium"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && (!recentTxData || recentTxData.results.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No transactions yet.
          </p>
        )}

        {recentTxData && recentTxData.results.length > 0 && (
          <div className="rounded-xl border border-border divide-y divide-border bg-card">
            {recentTxData.results.slice(0, 5).map(tx => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────
export default function DashboardPage() {
  const { setHeaderTitle, setShowBack } = useUiStore()
  const isElevated = useAuthStore(s => s.isElevated())

  useEffect(() => {
    setHeaderTitle(isElevated ? 'Dashboard' : 'Home')
    setShowBack(false)
  }, [setHeaderTitle, setShowBack, isElevated])

  return (
    <PageWrapper>
      {isElevated ? <AdminDashboard /> : <UserDashboard />}
    </PageWrapper>
  )
}
