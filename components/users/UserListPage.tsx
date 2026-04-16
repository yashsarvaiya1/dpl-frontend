// components/users/UserListPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/stores/uiStore'
import { useUsers } from '@/hooks/useUser'
import PageWrapper from '@/components/shared/PageWrapper'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, Ticket } from 'lucide-react'
import { User } from '@/lib/types'   // ← from lib/types, not models/user
import { cn } from '@/lib/utils'

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 select-none">
      {initials || '?'}
    </div>
  )
}

function UserCard({ user, onClick }: { user: User; onClick: () => void }) {
  const roleBadgeVariant: 'default' | 'secondary' | 'outline' =
    user.is_superuser ? 'default' : user.is_staff ? 'secondary' : 'outline'
  const roleLabel = user.is_superuser ? 'Superuser' : user.is_staff ? 'Admin' : 'User'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card active:scale-[0.98] transition-transform text-left"
    >
      <UserAvatar name={user.username || user.mobile_number} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">
            {user.username || '—'}
          </span>
          <Badge variant={roleBadgeVariant} className="text-[10px] px-1.5 py-0 shrink-0">
            {roleLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{user.mobile_number}</p>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className={cn(
          'text-[10px] font-medium px-2 py-0.5 rounded-full',
          user.is_active
            ? 'bg-green-500/10 text-green-600'
            : 'bg-destructive/10 text-destructive'
        )}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
        {/* Ticket count badge */}
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Ticket className="w-3 h-3" />
          {user.tickets ?? 0}
        </span>
      </div>
    </button>
  )
}

export default function UserListPage() {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    setHeaderTitle('Users')
    setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isError } = useUsers(
    debouncedSearch ? { search: debouncedSearch } : undefined
  )

  return (
    <PageWrapper>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or mobile..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-18 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-center text-sm text-destructive py-12">
          Failed to load users. Please try again.
        </p>
      )}

      {/* List */}
      {!isLoading && !isError && (
        <div className="space-y-3">
          {data?.results?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">
              No users found.
            </p>
          )}
          {data?.results?.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => router.push(`/users/${user.id}`)}
            />
          ))}
        </div>
      )}

      {/* FAB — positioned above BottomNav */}
      <Button
        onClick={() => router.push('/users/new')}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-xl z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </PageWrapper>
  )
}
