// components/teams/AddPlayerDialog.tsx

'use client'

import { useState } from 'react'
import { useCreatePlayer } from '@/hooks/usePlayer'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogFooter,
  AlertDialogCancel
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
  const [name, setName] = useState('')
  const { mutateAsync, isPending } = useCreatePlayer()

  const handleSubmit = async () => {
    if (!name.trim()) return
    await mutateAsync({ name: name.trim(), team: teamId })
    setName('')
    onClose()
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
            placeholder="Enter player name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setName(''); onClose() }}>
            Cancel
          </AlertDialogCancel>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? 'Adding...' : 'Add'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
