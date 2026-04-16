// components/teams/AddPlayerDialog.tsx

'use client'

import { useState } from 'react'
import { useCreatePlayer } from '@/hooks/usePlayer'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  teamId: number
  onClose: () => void
}

export default function AddPlayerDialog({ open, teamId, onClose }: Props) {
  const [name, setName]             = useState('')
  const [error, setError]           = useState<string | undefined>()
  const { mutateAsync, isPending }  = useCreatePlayer()

  const handleClose = () => {
    setName('')
    setError(undefined)
    onClose()
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    setError(undefined)
    try {
      await mutateAsync({ name: name.trim(), team: teamId })
      setName('')
      // keep dialog open so admin can add multiple players quickly
    } catch (err: unknown) {
      const resData = (err as any)?.response?.data
      setError(resData?.name?.[0] ?? resData?.detail ?? 'Failed to add player.')
    }
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Player</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="player-name">Player Name</Label>
          <Input
            id="player-name"
            placeholder="e.g. Virat Kohli"
            className="h-12"
            value={name}
            onChange={e => setName(e.target.value)}
            // ← Enter key submits
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit() } }}
            autoFocus
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Done</AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
          >
            {isPending ? 'Adding...' : 'Add'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
