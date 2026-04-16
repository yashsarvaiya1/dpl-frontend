// components/matches/MatchForm.tsx

'use client'

import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { useTeamList } from '@/hooks/useTeam'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'

interface FormValues {
  team_1: string
  team_2: string
  date: string
  start_time: string
  end_time: string
}

interface Props {
  defaultValues?: Partial<FormValues>
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
  error?: string | null
  submitLabel?: string
}

export default function MatchForm({
  defaultValues, onSubmit, isLoading, error, submitLabel = 'Save'
}: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues
  })
  const { data: teamsData } = useTeamList({ page_size: 100 })
  const team1 = watch('team_1')
  const team2 = watch('team_2')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="space-y-1.5">
        <Label>Team 1</Label>
        <Select
          value={team1}
          onValueChange={val => setValue('team_1', val)}
        >
          <SelectTrigger className="min-h-12">
            <SelectValue placeholder="Select Team 1" />
          </SelectTrigger>
          <SelectContent>
            {teamsData?.results
              .filter(t => String(t.id) !== team2)
              .map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Team 2</Label>
        <Select
          value={team2}
          onValueChange={val => setValue('team_2', val)}
        >
          <SelectTrigger className="min-h-12">
            <SelectValue placeholder="Select Team 2" />
          </SelectTrigger>
          <SelectContent>
            {teamsData?.results
              .filter(t => String(t.id) !== team1)
              .map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Match Date</Label>
        <Input id="date" type="date" {...register('date', { required: 'Date is required' })} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="start_time">Start Time</Label>
          <Input id="start_time" type="time" {...register('start_time')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_time">End Time</Label>
          <Input id="end_time" type="time" {...register('end_time')} />
        </div>
      </div>

      <Button type="submit" className="w-full min-h-12" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
