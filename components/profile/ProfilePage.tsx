// components/profile/ProfilePage.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { useUser } from "@/hooks/useUser";
import { authService } from "@/services/authService";
import PageWrapper from "@/components/shared/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { LogOut, Moon, Sun, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const setHeaderTitle = useUIStore((s) => s.setHeaderTitle);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const storedUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data: freshUser } = useUser(storedUser?.id ?? 0);

  // Sync fresh API data into store
  useEffect(() => {
    if (freshUser) setUser(freshUser);
  }, [freshUser, setUser]);

  // Always use freshest data, fallback to store
  const user = freshUser ?? storedUser;

  useEffect(() => {
    setHeaderTitle("Profile");
  }, [setHeaderTitle]);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch (_) {}
    finally {
      clearAuth();
      router.replace("/login");
    }
  };

  const roleLabel = user?.is_superuser
    ? "Superuser"
    : user?.is_staff
    ? "Admin"
    : "User";

  const roleBadgeVariant = user?.is_superuser
    ? "default"
    : user?.is_staff
    ? "secondary"
    : "outline";

  return (
    <PageWrapper>
      <div className="space-y-6">

        {/* Avatar + Info */}
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
            {(user?.username || user?.mobile_number || "?")[0].toUpperCase()}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">
              {user?.username || "—"}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.mobile_number}</p>
          </div>
          <Badge variant={roleBadgeVariant}>{roleLabel}</Badge>
        </div>

        {/* Stats */}
        <div className="rounded-xl border border-border divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ticket className="w-4 h-4" />
              Tickets
            </div>
            <span className="text-sm font-semibold">{user?.tickets ?? 0}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                user?.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {user?.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="rounded-xl border border-border">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">
                  Switch app appearance
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>

        {/* Logout */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full h-12">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
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

      </div>
    </PageWrapper>
  );
}
