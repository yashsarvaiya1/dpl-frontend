// components/users/UserDetailPage.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import {
  useUser, useDeleteUser, useClearPassword,
  useDeactivateUser, useActivateUser,
  useAddTickets, useRemoveTickets,
} from "@/hooks/useUser";
import { useTransactionList } from "@/hooks/useTransaction";
import PageWrapper from "@/components/shared/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, KeyRound, ShieldOff, ShieldCheck, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { id: number }

const REASON_LABELS: Record<string, string> = {
  admin_add: 'Admin Added',
  admin_remove: 'Admin Removed',
  box_open: 'Box Opened',
  win_reward: 'Win Reward',
  refund: 'Refund',
}

export default function UserDetailPage({ id }: Props) {
  const router = useRouter();
  const setHeaderTitle = useUiStore((s) => s.setHeaderTitle);
  const setShowBack = useUiStore((s) => s.setShowBack);
  const isSuperUser = useAuthStore((s) => s.isSuperUser);
  const currentUser = useAuthStore((s) => s.user);

  const { data: user, isLoading, isError } = useUser(id);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: clearPassword, isPending: isClearing } = useClearPassword();
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateUser();
  const { mutate: activate, isPending: isActivating } = useActivateUser();
  const { mutateAsync: addTickets, isPending: isAdding } = useAddTickets();
  const { mutateAsync: removeTickets, isPending: isRemoving } = useRemoveTickets();

  const { data: txData } = useTransactionList({ user: id, page_size: 5 });

  const [ticketAmount, setTicketAmount] = useState('');

  useEffect(() => {
    setHeaderTitle("User Details");
    setShowBack(true);
    return () => setShowBack(false);
  }, [setHeaderTitle, setShowBack]);

  if (isLoading) return (
    <PageWrapper>
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </PageWrapper>
  );

  if (isError || !user) return (
    <PageWrapper>
      <p className="text-center text-sm text-destructive py-12">Failed to load user.</p>
    </PageWrapper>
  );

  const canManageAdmin = isSuperUser();
  const isSelf = currentUser?.id === user.id;
  const canManageThisUser = canManageAdmin
    ? true
    : !isSelf && !user.is_staff && !user.is_superuser;

  const handleAddTickets = async () => {
    const amt = Number(ticketAmount);
    if (!amt || amt <= 0) return;
    await addTickets({ id, amount: amt });
    setTicketAmount('');
  };

  const handleRemoveTickets = async () => {
    const amt = Number(ticketAmount);
    if (!amt || amt <= 0) return;
    await removeTickets({ id, amount: amt });
    setTicketAmount('');
  };

  return (
    <PageWrapper>
      <div className="space-y-6">

        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
            {(user.username || user.mobile_number || "?")[0].toUpperCase()}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">{user.username || "—"}</h2>
            <p className="text-sm text-muted-foreground">{user.mobile_number}</p>
          </div>
          <div className="flex items-center gap-2">
            {user.is_superuser && <Badge>Superuser</Badge>}
            {user.is_staff && !user.is_superuser && <Badge variant="secondary">Admin</Badge>}
            {!user.is_staff && !user.is_superuser && <Badge variant="outline">User</Badge>}
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl border border-border divide-y divide-border">
          <InfoRow label="Tickets" value={String(user.tickets ?? 0)} />
          <InfoRow
            label="Password Set"
            value={user.has_password_set ? "Yes" : "No — Pending setup"}
          />
          <InfoRow
            label="Joined"
            value={new Date(user.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          />
        </div>

        {/* Ticket Management — Admin only */}
        {canManageThisUser && (
          <div className="rounded-xl border border-border p-4 space-y-3">
            <p className="text-sm font-semibold">Manage Tickets</p>
            <Input
              type="number"
              placeholder="Enter ticket amount"
              value={ticketAmount}
              onChange={e => setTicketAmount(e.target.value)}
              className="h-11"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-11 text-green-600 border-green-200 hover:bg-green-50"
                onClick={handleAddTickets}
                disabled={isAdding || !ticketAmount}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {isAdding ? 'Adding...' : 'Add Tickets'}
              </Button>
              <Button
                variant="outline"
                className="h-11 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleRemoveTickets}
                disabled={isRemoving || !ticketAmount}
              >
                <Minus className="w-4 h-4 mr-1.5" />
                {isRemoving ? 'Removing...' : 'Remove Tickets'}
              </Button>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {txData && txData.results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Recent Transactions</p>
              <button
                onClick={() => router.push('/transactions')}
                className="text-xs text-primary"
              >
                View All
              </button>
            </div>
            <div className="rounded-xl border border-border divide-y divide-border">
              {txData.results.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm">{REASON_LABELS[tx.reason] || tx.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={cn(
                    "font-bold text-sm",
                    tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500'
                  )}>
                    {tx.transaction_type === 'credit' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {canManageThisUser && (
          <div className="space-y-3">
            <Button variant="outline" className="w-full h-12"
              onClick={() => router.push(`/users/${id}/edit`)}>
              <Pencil className="w-4 h-4 mr-2" /> Edit User
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full h-12" disabled={isClearing}>
                  <KeyRound className="w-4 h-4 mr-2" /> Clear Password
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
                  <AlertDialogAction onClick={() => clearPassword(id)}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {user.is_active ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline"
                    className="w-full h-12 text-orange-600 border-orange-200"
                    disabled={isDeactivating}>
                    <ShieldOff className="w-4 h-4 mr-2" /> Deactivate User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate User?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This user will be logged out and unable to access the app.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deactivate(id)}>Deactivate</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="outline"
                className="w-full h-12 text-green-600 border-green-200"
                onClick={() => activate(id)} disabled={isActivating}>
                <ShieldCheck className="w-4 h-4 mr-2" /> Activate User
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full h-12" disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete User
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
                    onClick={() => deleteUser(id, { onSuccess: () => router.replace("/users") })}
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
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
