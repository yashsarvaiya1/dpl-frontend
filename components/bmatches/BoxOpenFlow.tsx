// components/bmatches/BoxOpenFlow.tsx

'use client'

import { useState } from 'react'
import { BoxIcon, Ticket, X } from 'lucide-react'
import { useOpenBox } from '@/hooks/useBMatch'
import { useAuthStore } from '@/stores/authStore'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { cn } from '@/lib/utils'

interface Props {
  bmatchId: number
  ticketAmount: number
  onSuccess?: (boxValue: string) => void
}

type FlowStep = 'idle' | 'confirm' | 'picking' | 'revealed'

const BOX_EMOJIS = ['📦', '🎁', '🎲', '🎯', '🎰', '🎪', '🃏', '🎴', '🀄', '🎮']

export default function BoxOpenFlow({ bmatchId, ticketAmount, onSuccess }: Props) {
  const tickets   = useAuthStore(s => s.user?.tickets ?? 0)
  const openBox   = useOpenBox()

  const [step, setStep]           = useState<FlowStep>('idle')
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [revealedValue, setRevealedValue] = useState<string | null>(null)
  const [pendingResult, setPendingResult] = useState<{ box_value: string } | null>(null)
  const [error, setError]         = useState<string | null>(null)

  const hasEnoughTickets = tickets >= ticketAmount

  // Step 1 → show confirm dialog
  const handleClickOpen = () => {
    setError(null)
    setStep('confirm')
  }

  // Step 2 → call API, then show boxes
  const handleConfirm = async () => {
    setStep('picking')
    try {
      const result = await openBox.mutateAsync(bmatchId)
      setPendingResult(result)
      // Don't reveal yet — user must click a box
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to open box.')
      setStep('idle')
    }
  }

  // Step 3 → user picks a box → reveal
  const handlePickBox = (idx: number) => {
    if (!pendingResult || selectedIdx !== null) return
    setSelectedIdx(idx)
    setTimeout(() => {
      setRevealedValue(pendingResult.box_value)
      setStep('revealed')
      onSuccess?.(pendingResult.box_value)
    }, 600) // flip delay
  }

  // Reset for another round
  const handleReset = () => {
    setStep('idle')
    setSelectedIdx(null)
    setRevealedValue(null)
    setPendingResult(null)
    setError(null)
  }

  return (
    <div className="mb-6">

      {/* ── Idle — main CTA button ─────────────────── */}
      {step === 'idle' && (
        <>
          <button
            onClick={handleClickOpen}
            disabled={!hasEnoughTickets}
            className={cn(
              'w-full h-14 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all',
              'bg-primary text-primary-foreground',
              !hasEnoughTickets && 'opacity-50 cursor-not-allowed',
              hasEnoughTickets && 'active:scale-[0.97] hover:opacity-90'
            )}
          >
            <BoxIcon className="w-5 h-5" />
            🎲 Open a Box
          </button>
          {!hasEnoughTickets && (
            <p className="text-xs text-destructive text-center mt-2">
              You need {ticketAmount} tickets. You have {tickets}.
            </p>
          )}
          {error && (
            <p className="text-xs text-destructive text-center mt-2">{error}</p>
          )}
        </>
      )}

      {/* ── Confirm Dialog ─────────────────────────── */}
      <ConfirmDialog
        open={step === 'confirm'}
        title="Open a Box?"
        description={
          `This will deduct ${ticketAmount} ticket${ticketAmount > 1 ? 's' : ''} from your balance. ` +
          `You currently have ${tickets} ticket${tickets !== 1 ? 's' : ''}.`
        }
        confirmLabel={`Open — ${ticketAmount} 🎟️`}
        onConfirm={handleConfirm}
        onCancel={() => setStep('idle')}
      />

      {/* ── Picking — 10 boxes grid ────────────────── */}
      {(step === 'picking' || step === 'revealed') && (
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            {step === 'picking' && selectedIdx === null && (
              <>
                <p className="font-bold text-base">Pick a Box!</p>
                <p className="text-xs text-muted-foreground">Tap any box to reveal your position</p>
              </>
            )}
            {step === 'revealed' && (
              <>
                <p className="font-bold text-base text-primary">You got it! 🎉</p>
                <p className="text-xs text-muted-foreground">Your position has been assigned</p>
              </>
            )}
          </div>

          {/* 10 box grid — 5 cols × 2 rows */}
          <div className="grid grid-cols-5 gap-2">
            {BOX_EMOJIS.map((emoji, idx) => {
              const isPicked   = selectedIdx === idx
              const isRevealed = isPicked && step === 'revealed'
              const isDisabled = selectedIdx !== null && !isPicked

              return (
                <button
                  key={idx}
                  onClick={() => handlePickBox(idx)}
                  disabled={isDisabled || step === 'revealed'}
                  className={cn(
                    'aspect-square rounded-xl flex items-center justify-center text-2xl',
                    'border-2 transition-all duration-500',
                    // default state
                    !isPicked && !isDisabled && 'border-border bg-card hover:border-primary hover:scale-105 active:scale-95',
                    // dimmed — another box was picked
                    isDisabled && 'border-border bg-muted opacity-30 scale-95',
                    // picked + flipping
                    isPicked && !isRevealed && 'border-primary bg-primary/10 scale-110 animate-pulse',
                    // revealed
                    isRevealed && 'border-primary bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30',
                  )}
                >
                  {isRevealed ? (
                    <span className="text-sm font-black leading-tight text-center px-1">
                      {revealedValue}
                    </span>
                  ) : (
                    <span className={cn(isPicked && !isRevealed ? 'animate-spin' : '')}>
                      {emoji}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Open Another + Close */}
          {step === 'revealed' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleReset}
                className="flex-1 h-10 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                Open Another Box
              </button>
              <button
                onClick={handleReset}
                className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
