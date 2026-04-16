// components/users/UserDetailPage.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import {
  useUser,
  useDeleteUser,
  useClearPassword,
  useDeactivateUser,
  useActivateUser,
} from "@/hooks/useUser";
import PageWrapper from "@/components/shared/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, KeyRound, ShieldOff, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id: number;
}

export default function UserDetailPage({ id }: Props) {
  const router = useRouter();
  const setHeaderTitle = useUIStore((s) => s.setHeaderTitle);
  const isSuperUser = useAuthStore((s) => s.isSuperUser);
  const currentUser = useAuthStore((s) => s.user);

  const { data: user, isLoading, isError } = useUser(id);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: clearPassword, isPending: isClearing } = useClearPassword();
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateUser();
  const { mutate: activate, isPending: isActivating } = useActivateUser();
  const setShowBack = useUIStore((s) => s.setShowBack);

  useEffect(() => {
    setHeaderTitle("User Details");
    setShowBack(true);
    return () => setShowBack(false);
  }, [setHeaderTitle, setShowBack]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (isError || !user) {
    return (
      <PageWrapper>
        <p className="text-center text-sm text-destructive py-12">
          Failed to load user.
        </p>
      </PageWrapper>
    );
  }

  // ✅ Permission logic AFTER user data is confirmed loaded
  const canManageAdmin = isSuperUser();
  const isSelf = currentUser?.id === user.id;
  const canManageThisUser = canManageAdmin
    ? true // superuser can manage everyone including themselves
    : !isSelf && !user.is_staff && !user.is_superuser;

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
            <p className="text-sm text-muted-foreground">
              {user.mobile_number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user.is_superuser && <Badge>Superuser</Badge>}
            {user.is_staff && !user.is_superuser && (
              <Badge variant="secondary">Admin</Badge>
            )}
            {!user.is_staff && !user.is_superuser && (
              <Badge variant="outline">User</Badge>
            )}
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                user.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700",
              )}
            >
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
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
        </div>

        {/* Actions */}
        {canManageThisUser && (
          <div className="space-y-3">
            {/* Edit */}
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => router.push(`/users/${id}/edit`)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit User
            </Button>

            {/* Clear Password */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12"
                  disabled={isClearing}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Clear Password
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

            {/* Activate / Deactivate */}
            {user.is_active ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-orange-600 border-orange-200"
                    disabled={isDeactivating}
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Deactivate User
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
                    <AlertDialogAction onClick={() => deactivate(id)}>
                      Deactivate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="outline"
                className="w-full h-12 text-green-600 border-green-200"
                onClick={() => activate(id)}
                disabled={isActivating}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Activate User
              </Button>
            )}

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full h-12"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will soft delete the user. They won't be able to log
                    in.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() =>
                      deleteUser(id, {
                        onSuccess: () => router.replace("/users"),
                      })
                    }
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
