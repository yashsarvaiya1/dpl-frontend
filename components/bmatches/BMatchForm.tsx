// components/bmatches/BMatchForm.tsx

'use client'

import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { useMatchList } from '@/hooks/useMatch'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'

interface FormValues {
  match: string
  ticket_amount: string
  note: string
}

interface Props {
  defaultValues?: Partial<FormValues>
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
  error?: string | null
  submitLabel?: string
}

export default function BMatchForm({
  defaultValues, onSubmit, isLoading, error, submitLabel = 'Save'
}: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues
  })
  const matchValue = watch('match')
  const { data: matchesData } = useMatchList({ page_size: 100 })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="space-y-1.5">
        <Label>Match</Label>
        <Select value={matchValue} onValueChange={val => setValue('match', val)}>
          <SelectTrigger className="min-h-12">
            <SelectValue placeholder="Select Match" />
          </SelectTrigger>
          <SelectContent>
            {matchesData?.results.map(m => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.team_1_detail?.name} vs {m.team_2_detail?.name} · {m.date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.match && <p className="text-xs text-destructive">{errors.match.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ticket_amount">Ticket Amount</Label>
        <Input
          id="ticket_amount"
          type="number"
          placeholder="e.g. 100"
          {...register('ticket_amount', { required: 'Ticket amount is required' })}
        />
        {errors.ticket_amount && (
          <p className="text-xs text-destructive">{errors.ticket_amount.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" placeholder="Any note for users..." {...register('note')} />
      </div>

      <Button type="submit" className="w-full min-h-12" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
