// components/profile/ProfilePage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useUser } from '@/hooks/useUser'
import { useTransactionList } from '@/hooks/useTransaction'
import { authService } from '@/services/authService'
import PageWrapper from '@/components/shared/PageWrapper'
import { TransactionItem } from '@/components/shared/TransactionItem'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LogOut, Moon, Sun, Ticket, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

export default function ProfilePage() {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const storedUser    = useAuthStore(s => s.user)
  const setUser       = useAuthStore(s => s.setUser)
  const refreshToken  = useAuthStore(s => s.refreshToken)
  const clearAuth     = useAuthStore(s => s.clearAuth)
  const { theme, setTheme } = useTheme()

  const { data: freshUser }       = useUser(storedUser?.id ?? 0)
  const { data: txData }          = useTransactionList({
    user: storedUser?.id,
    page_size: 5,
    ordering: '-created_at',
  })

  // Sync fresh data into store (partial merge — won't overwrite unrelated fields)
  useEffect(() => {
    if (freshUser) setUser(freshUser)
  }, [freshUser])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setHeaderTitle('Profile')
    setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  const user = freshUser ?? storedUser

  const handleLogout = async () => {
    try { if (refreshToken) await authService.logout(refreshToken) } catch (_) {}
    finally { clearAuth(); router.replace('/login') }
  }

  const roleLabel       = user?.is_superuser ? 'Superuser' : user?.is_staff ? 'Admin' : 'User'
  const roleBadgeVariant: 'default' | 'secondary' | 'outline' =
    user?.is_superuser ? 'default' : user?.is_staff ? 'secondary' : 'outline'

  return (
    // noPadding=false (default) — PageWrapper handles top/bottom padding
    <PageWrapper>
      <div className="space-y-4">

        {/* ── Avatar + Info ────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 pt-4 pb-2">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold select-none">
            {(user?.username || user?.mobile_number || '?')[0].toUpperCase()}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{user?.username || '—'}</h2>
            <p className="text-sm text-muted-foreground">{user?.mobile_number}</p>
          </div>
          <Badge variant={roleBadgeVariant}>{roleLabel}</Badge>
        </div>

        {/* ── Info Card ────────────────────────────────── */}
        <div className="rounded-xl border border-border divide-y divide-border bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ticket className="w-4 h-4" /> Tickets
            </div>
            <span className="text-sm font-bold tabular-nums">{user?.tickets ?? 0}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              user?.is_active
                ? 'bg-green-500/10 text-green-600'
                : 'bg-destructive/10 text-destructive'
            )}>
              {user?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>

        {/* ── Recent Transactions (last 5 only) ────────── */}
        {txData && txData.results.length > 0 && (
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
            {/* Fixed height list — not scrollable here, 5 items max */}
            <div className="rounded-xl border border-border divide-y divide-border bg-card">
              {txData.results.slice(0, 5).map(tx => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        )}

        {/* ── Theme Toggle ─────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                {theme === 'dark'
                  ? <Moon className="w-4 h-4 text-muted-foreground" />
                  : <Sun className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch app appearance</p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        {/* ── Logout ───────────────────────────────────── */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full h-12">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the login page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleLogout}
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* bottom breathing room */}
        <div className="h-2" />
      </div>
    </PageWrapper>
  )
}
