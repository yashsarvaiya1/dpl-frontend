// components/bmatches/BMatchDetailPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { useBMatch, useChangeBMatchStatus, useDeleteBMatch, useMyRooms, useOpenBox } from '@/hooks/useBMatch'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { isAdminOwned, BMATCH_STATUS_LABELS, BMATCH_STATUS_COLORS, IRREVERSIBLE_STATUSES } from '@/models/bmatch'
import { BMatchStatus } from '@/lib/types'
import PageWrapper from '@/components/shared/PageWrapper'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import BRoomCard from '@/components/rooms/BRoomCard'
import PositionsList from './PositionsList'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'

interface Props { id: number }

const STATUS_OPTIONS: BMatchStatus[] = ['upcoming', 'active', 'closed', 'completed', 'cancelled']

export default function BMatchDetailPage({ id }: Props) {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const user = useAuthStore(s => s.user)
  const isSuperUser = useAuthStore(s => s.isSuperUser())

  const { data: bmatch, isLoading } = useBMatch(id)
  const { data: myRooms } = useMyRooms(id)
  const openBox = useOpenBox()
  const changeStatus = useChangeBMatchStatus()
  const deleteBMatch = useDeleteBMatch()

  const [pendingStatus, setPendingStatus] = useState<BMatchStatus | null>(null)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [openBoxResult, setOpenBoxResult] = useState<string | null>(null)

  const canManage = bmatch && user
    ? isAdminOwned(bmatch, user.id, isSuperUser)
    : false

  useEffect(() => {
    setHeaderTitle('BMatch Detail')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

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

  const handleOpenBox = async () => {
    const result = await openBox.mutateAsync(id)
    setOpenBoxResult(result.box_value)
  }

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-24 w-full rounded-xl mb-4" />
      <Skeleton className="h-12 w-full rounded-xl mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </PageWrapper>
  )

  if (!bmatch) return null

  const isActive = bmatch.status === 'active'
  const isIrreversible = IRREVERSIBLE_STATUSES.includes(bmatch.status)

  return (
    <PageWrapper>
      {/* Match Info Card */}
      <div className="bg-card border rounded-xl p-4 mb-4 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-bold text-base">
            {bmatch.match_detail?.team_1_detail?.name} vs {bmatch.match_detail?.team_2_detail?.name}
          </p>
          <StatusBadge
            label={BMATCH_STATUS_LABELS[bmatch.status]}
            colorClass={BMATCH_STATUS_COLORS[bmatch.status]}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {bmatch.match_detail?.date} · {bmatch.match_detail?.start_time} – {bmatch.match_detail?.end_time}
        </p>
        <p className="text-sm font-medium">🎟 {bmatch.ticket_amount} tickets to open</p>
        {bmatch.note && <p className="text-xs text-muted-foreground">📝 {bmatch.note}</p>}
        <p className="text-xs text-muted-foreground">by {bmatch.created_by_name}</p>
      </div>

      {/* Admin Controls */}
      {canManage && (
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" className="flex-1"
            onClick={() => router.push(`/bmatches/${id}/edit`)}>
            <Pencil size={14} className="mr-1" /> Edit
          </Button>
          {!isIrreversible && (
            <Button variant="destructive" size="sm"
              onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )}

      {/* Status Change — Admin only */}
      {canManage && !isIrreversible && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1.5">Change Status</p>
          <Select onValueChange={val => handleStatusChange(val as BMatchStatus)}>
            <SelectTrigger className="min-h-11">
              <SelectValue placeholder="Select new status..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS
                .filter(s => s !== bmatch.status && !IRREVERSIBLE_STATUSES.includes(bmatch.status))
                .map(s => (
                  <SelectItem key={s} value={s}>{BMATCH_STATUS_LABELS[s]}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Open Box — Active BMatch only */}
      {isActive && (
        <div className="mb-6">
          {openBoxResult ? (
            <div className="bg-primary/10 border border-primary rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">You opened</p>
              <p className="text-2xl font-bold text-primary">{openBoxResult}</p>
              <Button
                variant="outline" size="sm" className="mt-3"
                onClick={() => setOpenBoxResult(null)}
              >
                Open Another Box
              </Button>
            </div>
          ) : (
            <Button
              className="w-full min-h-13 text-base font-semibold"
              onClick={handleOpenBox}
              disabled={openBox.isPending}
            >
              {openBox.isPending ? 'Opening...' : '🎲 Open Box'}
            </Button>
          )}
          {openBox.isError && (
            <p className="text-xs text-destructive mt-2 text-center">
              {(openBox.error as any)?.response?.data?.detail || 'Failed to open box.'}
            </p>
          )}
        </div>
      )}

      {/* Positions */}
      <PositionsList bmatchId={id} canOverride={canManage} matchId={bmatch.match} />

      {/* My Rooms */}
      {myRooms && myRooms.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-sm mb-3">My Rooms ({myRooms.length})</h2>
          <div className="space-y-3">
            {myRooms.map(room => (
              <BRoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      )}

      {/* Status Confirm */}
      <ConfirmDialog
        open={showStatusConfirm}
        title={`Change to ${pendingStatus ? BMATCH_STATUS_LABELS[pendingStatus] : ''}?`}
        description={
          pendingStatus === 'completed'
            ? 'This is irreversible. Winners will be declared and transactions created. Unassigned positions will split reward equally. Proceed?'
            : pendingStatus === 'cancelled'
            ? 'This is irreversible. All rooms will be cancelled and participants refunded. Proceed?'
            : `Change status to ${pendingStatus}?`
        }
        confirmLabel="Yes, Proceed"
        destructive={pendingStatus === 'completed' || pendingStatus === 'cancelled'}
        onConfirm={handleConfirmStatus}
        onCancel={() => { setShowStatusConfirm(false); setPendingStatus(null) }}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete BMatch"
        description="This will soft delete the BMatch. Are you sure?"
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
