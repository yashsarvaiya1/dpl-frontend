// components/bmatches/BMatchDetailPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Pencil, Trash2, Ticket, BoxIcon,
  Trophy, ChevronRight, ChevronsUpDown, Check,
} from 'lucide-react'
import {
  useBMatch, useChangeBMatchStatus,
  useDeleteBMatch, useMyRooms, useOpenBox,
} from '@/hooks/useBMatch'
import { useUiStore }   from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import {
  isAdminOwned, BMATCH_STATUS_LABELS,
  BMATCH_STATUS_COLORS, IRREVERSIBLE_STATUSES,
} from '@/models/bmatch'
import { BMatchStatus } from '@/lib/types'
import PageWrapper    from '@/components/shared/PageWrapper'
import StatusBadge    from '@/components/shared/StatusBadge'
import ConfirmDialog  from '@/components/shared/ConfirmDialog'
import BRoomCard      from '@/components/rooms/BRoomCard'
import PositionsList  from './PositionsList'
import { Button }     from '@/components/ui/button'
import { Skeleton }   from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup,
  CommandItem, CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import BoxOpenFlow from './BoxOpenFlow'

interface Props { id: number }

const STATUS_OPTIONS: BMatchStatus[] = ['upcoming', 'active', 'closed', 'completed', 'cancelled']

// ── Box Open Result ───────────────────────────────────────────────────────────
function BoxOpenResult({
  boxValue,
  onOpenAnother,
}: {
  boxValue: string
  onOpenAnother: () => void
}) {
  return (
    <div className="animate-in zoom-in-90 fade-in duration-500">
      <div className="bg-primary/10 border-2 border-primary rounded-2xl p-6 text-center space-y-3">
        <div className="text-4xl">🎁</div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
            You opened
          </p>
          <p className="text-4xl font-black text-primary tabular-nums">
            {boxValue}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Your position has been assigned!
        </p>
        <Button variant="outline" size="sm" onClick={onOpenAnother}>
          Open Another Box
        </Button>
      </div>
    </div>
  )
}

// ── Status Combobox ───────────────────────────────────────────────────────────
function StatusCombobox({
  currentStatus,
  onChange,
}: {
  currentStatus: BMatchStatus
  onChange: (val: BMatchStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const options = STATUS_OPTIONS.filter(s => s !== currentStatus)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between h-11 px-3 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors text-muted-foreground"
        >
          <span>Select new status...</span>
          <ChevronsUpDown className="w-4 h-4 shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No options.</CommandEmpty>
            <CommandGroup>
              {options.map(s => (
                <CommandItem
                  key={s}
                  value={s}
                  onSelect={() => { onChange(s); setOpen(false) }}
                >
                  <Check className="w-4 h-4 mr-2 opacity-0" />
                  {BMATCH_STATUS_LABELS[s]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BMatchDetailPage({ id }: Props) {
  const router      = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const user        = useAuthStore(s => s.user)
  const isSuperUser = useAuthStore(s => s.isSuperUser())

  const { data: bmatch, isLoading } = useBMatch(id)
  const { data: myRooms }           = useMyRooms(id)
  const changeStatus = useChangeBMatchStatus()
  const deleteBMatch = useDeleteBMatch()

  const [pendingStatus,     setPendingStatus]     = useState<BMatchStatus | null>(null)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // ← custom tab state, no Shadcn Tabs
  const [activeTab, setActiveTab] = useState<'positions' | 'my-rooms'>('positions')

  const canManage  = bmatch && user ? isAdminOwned(bmatch, user.id, isSuperUser) : false
  const hasMyRooms = myRooms && myRooms.length > 0

  useEffect(() => {
    setHeaderTitle('BMatch')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  // Auto-switch to My Rooms tab once rooms load
  useEffect(() => {
    if (myRooms && myRooms.length > 0) setActiveTab('my-rooms')
  }, [myRooms])

  const handleStatusChange = (val: BMatchStatus) => {
    setPendingStatus(val)
    setShowStatusConfirm(true)
  }

  const handleConfirmStatus = async () => {
    if (!pendingStatus) return
    await changeStatus.mutateAsync({ id, status: pendingStatus })
    setPendingStatus(null)
    setShowStatusConfirm(false)
  }

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-28 w-full rounded-xl mb-4" />
      <Skeleton className="h-10 w-full rounded-xl mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </PageWrapper>
  )

  if (!bmatch) return null

  const isActive       = bmatch.status === 'active'
  const isIrreversible = IRREVERSIBLE_STATUSES.includes(bmatch.status)

  return (
    <PageWrapper>

      {/* ── Match Info ────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-base leading-tight">
            {bmatch.match_detail?.team_1_name} vs {bmatch.match_detail?.team_2_name}
          </p>
          <StatusBadge
            label={BMATCH_STATUS_LABELS[bmatch.status]}
            colorClass={BMATCH_STATUS_COLORS[bmatch.status]}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {bmatch.match_detail?.date}
          {bmatch.match_detail?.start_time && ` · ${bmatch.match_detail.start_time}`}
          {bmatch.match_detail?.end_time && ` – ${bmatch.match_detail.end_time}`}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5" />
            {bmatch.ticket_amount} tickets
          </span>
          {bmatch.created_by_name && <span>by {bmatch.created_by_name}</span>}
        </div>
        {bmatch.note && (
          <p className="text-xs bg-muted rounded-lg px-3 py-2 text-muted-foreground">
            📝 {bmatch.note}
          </p>
        )}
      </div>

      {/* ── Admin Controls ────────────────────────────── */}
      {canManage && (
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline" size="sm" className="flex-1 h-10"
            onClick={() => router.push(`/bmatches/${id}/edit`)}
          >
            <Pencil size={14} className="mr-1.5" /> Edit
          </Button>
          {!isIrreversible && (
            <Button
              variant="destructive" size="sm" className="h-10 w-10 p-0"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )}

      {/* ── Status Change ─────────────────────────────── */}
      {canManage && !isIrreversible && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Change Status</p>
          <StatusCombobox currentStatus={bmatch.status} onChange={handleStatusChange} />
        </div>
      )}

      {/* ── Open Box ──────────────────────────────────── */}
      {isActive && (
        <BoxOpenFlow
          bmatchId={id}
          ticketAmount={bmatch.ticket_amount ?? 0}
          onSuccess={() => {
            // my-rooms tab auto-refreshes via React Query invalidation in useOpenBox
          }}
        />
      )}

      {/* ── Custom Tab Bar ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-xl mb-4">
        <button
          onClick={() => setActiveTab('positions')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all',
            activeTab === 'positions'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          )}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          Positions
        </button>
        <button
          onClick={() => setActiveTab('my-rooms')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all',
            activeTab === 'my-rooms'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          )}
        >
          <BoxIcon className="w-3.5 h-3.5 shrink-0" />
          My Rooms
          {hasMyRooms && (
            <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold leading-none">
              {myRooms.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab Content ───────────────────────────────── */}
      {activeTab === 'positions' && (
        <PositionsList
          bmatchId={id}
          canOverride={canManage}
          matchId={bmatch.match}
        />
      )}

      {activeTab === 'my-rooms' && (
        <>
          {!hasMyRooms ? (
            <div className="text-center py-10 space-y-2">
              <BoxIcon className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? "You haven't opened any boxes yet."
                  : "You didn't participate in this BMatch."}
              </p>
              {isActive && (
                <p className="text-xs text-primary font-medium">
                  Open a box above ↑
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {myRooms.map(room => (
                <BRoomCard key={room.id} room={room} />
              ))}
              <button
                onClick={() => router.push('/rooms')}
                className="w-full flex items-center justify-center gap-1 text-xs text-primary font-medium py-2"
              >
                View all my rooms <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Dialogs ───────────────────────────────────── */}
      <ConfirmDialog
        open={showStatusConfirm}
        title={`Change to ${pendingStatus ? BMATCH_STATUS_LABELS[pendingStatus] : ''}?`}
        description={
          pendingStatus === 'completed'
            ? 'Irreversible. Winners declared and rewards issued.'
            : pendingStatus === 'cancelled'
            ? 'Irreversible. All rooms cancelled, participants refunded.'
            : `Change status to ${pendingStatus}?`
        }
        confirmLabel="Yes, Proceed"
        destructive={pendingStatus === 'completed' || pendingStatus === 'cancelled'}
        onConfirm={handleConfirmStatus}
        onCancel={() => { setShowStatusConfirm(false); setPendingStatus(null) }}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete BMatch"
        description="This will soft delete this BMatch. Are you sure?"
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await deleteBMatch.mutateAsync(id)
          router.push('/bmatches')
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

    </PageWrapper>
  )
}
