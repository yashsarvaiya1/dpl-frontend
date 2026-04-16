// components/users/UserListPage.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";
import { useUsers } from "@/hooks/useUser";
import PageWrapper from "@/components/shared/PageWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { User } from "@/models/user";
import { cn } from "@/lib/utils";

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
      {initials || "?"}
    </div>
  );
}

function UserCard({ user, onClick }: { user: User; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-left"
    >
      <UserAvatar name={user.username || user.mobile_number} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">
            {user.username || "—"}
          </span>
          {user.is_superuser && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Superuser
            </Badge>
          )}
          {user.is_staff && !user.is_superuser && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Admin
            </Badge>
          )}
          {!user.is_staff && !user.is_superuser && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              User
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {user.mobile_number}
        </p>
      </div>
      <div className="shrink-0">
        <span
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full",
            user.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {user.is_active ? "Active" : "Inactive"}
        </span>
      </div>
    </button>
  );
}

export default function UserListPage() {
  const router = useRouter();
  const setHeaderTitle = useUIStore((s) => s.setHeaderTitle);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    setHeaderTitle("Users");
  }, [setHeaderTitle]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = useUsers(
    debouncedSearch ? { search: debouncedSearch } : undefined
  );

  return (
    <PageWrapper>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {/* List */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <p className="text-center text-sm text-destructive py-12">
          Failed to load users. Please try again.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {data?.results?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">
              No users found.
            </p>
          )}
          {data?.results?.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => router.push(`/users/${user.id}`)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <Button
        onClick={() => router.push("/users/new")}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </PageWrapper>
  );
}
