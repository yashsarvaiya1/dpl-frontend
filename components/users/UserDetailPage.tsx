// components/users/UserDetailPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import {
  useUser, useDeleteUser, useClearPassword,
  useDeactivateUser, useActivateUser,
  useAddTickets, useRemoveTickets,
} from '@/hooks/useUser'
import { useTransactionList } from '@/hooks/useTransaction'
import PageWrapper from '@/components/shared/PageWrapper'
import { TransactionItem } from '@/components/shared/TransactionItem'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Pencil, Trash2, KeyRound,
  ShieldOff, ShieldCheck, Plus, Minus, ChevronRight, Ticket,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { id: number }

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function UserDetailPage({ id }: Props) {
  const router     = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()

  // ← use isElevated() helper, not isSuperUser() alone
  const isElevated  = useAuthStore(s => s.isElevated())
  const isSuperUser = useAuthStore(s => s.isSuperUser())
  const currentUser = useAuthStore(s => s.user)

  const { data: user, isLoading, isError } = useUser(id)

  const { mutate: deleteUser,    isPending: isDeleting    } = useDeleteUser()
  const { mutate: clearPassword, isPending: isClearing    } = useClearPassword()
  const { mutate: deactivate,    isPending: isDeactivating } = useDeactivateUser()
  const { mutate: activate,      isPending: isActivating  } = useActivateUser()
  const { mutateAsync: addTickets,    isPending: isAdding    } = useAddTickets()
  const { mutateAsync: removeTickets, isPending: isRemoving  } = useRemoveTickets()

  const { data: txData } = useTransactionList({
    user: id,
    page_size: 5,
    ordering: '-created_at',
  })

  const [ticketAmount, setTicketAmount] = useState('')

  useEffect(() => {
    setHeaderTitle('User Details')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  if (isLoading) return (
    <PageWrapper>
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </PageWrapper>
  )

  if (isError || !user) return (
    <PageWrapper>
      <p className="text-center text-sm text-destructive py-12">Failed to load user.</p>
    </PageWrapper>
  )

  const isSelf = currentUser?.id === user.id

  // Superuser can manage anyone
  // Admin can manage regular users only (not other admins or superusers)
  // Nobody can manage themselves via this page (use Profile instead)
  const canManage = isSuperUser
    ? true
    : isElevated && !isSelf && !user.is_staff && !user.is_superuser

  const handleAddTickets = async () => {
    const amt = Number(ticketAmount)
    if (!amt || amt <= 0) return
    await addTickets({ id, amount: amt })
    setTicketAmount('')
  }

  const handleRemoveTickets = async () => {
    const amt = Number(ticketAmount)
    if (!amt || amt <= 0) return
    await removeTickets({ id, amount: amt })
    setTicketAmount('')
  }

  const roleLabel       = user.is_superuser ? 'Superuser' : user.is_staff ? 'Admin' : 'User'
  const roleBadgeVariant: 'default' | 'secondary' | 'outline' =
    user.is_superuser ? 'default' : user.is_staff ? 'secondary' : 'outline'

  return (
    <PageWrapper>
      <div className="space-y-4">

        {/* ── Avatar + Info ──────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 pt-4 pb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold select-none">
            {(user.username || user.mobile_number || '?')[0].toUpperCase()}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">{user.username || '—'}</h2>
            <p className="text-sm text-muted-foreground">{user.mobile_number}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Badge variant={roleBadgeVariant}>{roleLabel}</Badge>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              user.is_active
                ? 'bg-green-500/10 text-green-600'
                : 'bg-destructive/10 text-destructive'
            )}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* ── Info Card ──────────────────────────────────── */}
        <div className="rounded-xl border border-border divide-y divide-border bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ticket className="w-4 h-4" /> Tickets
            </div>
            <span className="text-sm font-bold tabular-nums">{user.tickets ?? 0}</span>
          </div>
          <InfoRow
            label="Password Set"
            value={user.has_password_set ? 'Yes' : 'No — Pending setup'}
          />
          <InfoRow
            label="Joined"
            value={new Date(user.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          />
        </div>

        {/* ── Ticket Management ──────────────────────────── */}
        {canManage && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-sm font-semibold">Manage Tickets</p>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Enter ticket amount"
              value={ticketAmount}
              onChange={e => setTicketAmount(e.target.value)}
              className="h-11"
              min={1}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-11 text-green-600 border-green-500/30 hover:bg-green-500/10"
                onClick={handleAddTickets}
                disabled={isAdding || !ticketAmount || Number(ticketAmount) <= 0}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
              <Button
                variant="outline"
                className="h-11 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleRemoveTickets}
                disabled={isRemoving || !ticketAmount || Number(ticketAmount) <= 0}
              >
                <Minus className="w-4 h-4 mr-1.5" />
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        )}

        {/* ── Recent Transactions ────────────────────────── */}
        {txData && txData.results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-sm font-semibold">Recent Transactions</p>
              <button
                onClick={() => router.push(`/transactions?user=${id}`)}
                className="flex items-center gap-0.5 text-xs text-primary font-medium"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="rounded-xl border border-border divide-y divide-border bg-card">
              {txData.results.slice(0, 5).map(tx => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        )}

        {/* ── Actions ────────────────────────────────────── */}
        {canManage && (
          <div className="space-y-3 pb-4">
            <Button
              variant="outline" className="w-full h-12"
              onClick={() => router.push(`/users/${id}/edit`)}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit User
            </Button>

            {/* Clear Password */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full h-12" disabled={isClearing}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  {isClearing ? 'Clearing...' : 'Clear Password'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Password?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The user will need to set a new password on next login.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => clearPassword(id)}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Deactivate / Activate */}
            {user.is_active ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-orange-600 border-orange-500/30 hover:bg-orange-500/10"
                    disabled={isDeactivating}
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    {isDeactivating ? 'Deactivating...' : 'Deactivate User'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate User?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This user will be unable to access the app.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deactivate(id)}>
                      Deactivate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="outline"
                className="w-full h-12 text-green-600 border-green-500/30 hover:bg-green-500/10"
                onClick={() => activate(id)}
                disabled={isActivating}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {isActivating ? 'Activating...' : 'Activate User'}
              </Button>
            )}

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full h-12" disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete User'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will soft delete the user. They won't be able to log in.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteUser(id, {
                      onSuccess: () => router.replace('/users'),
                    })}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
