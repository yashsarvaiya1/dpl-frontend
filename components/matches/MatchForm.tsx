// components/matches/MatchForm.tsx

'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { useTeamList } from '@/hooks/useTeam'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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

// ── Reusable team combobox ──────────────────────────────────────────────────
function TeamCombobox({
  value,
  onChange,
  exclude,
  placeholder,
}: {
  value: string
  onChange: (val: string) => void
  exclude?: string
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const { data: teamsData } = useTeamList({ page_size: 100 })
  const teams = teamsData?.results.filter(t => String(t.id) !== exclude) ?? []
  const selected = teams.find(t => String(t.id) === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full flex items-center justify-between h-12 px-3 rounded-lg border border-input bg-background text-sm',
            'hover:bg-accent transition-colors',
            !selected && 'text-muted-foreground'
          )}
        >
          <span className="truncate">{selected?.name ?? placeholder}</span>
          <ChevronsUpDown className="w-4 h-4 shrink-0 text-muted-foreground ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandList>
            <CommandEmpty>No teams found.</CommandEmpty>
            <CommandGroup>
              {teams.map(t => (
                <CommandItem
                  key={t.id}
                  value={t.name}
                  onSelect={() => {
                    onChange(String(t.id))
                    setOpen(false)
                  }}
                >
                  <Check className={cn(
                    'w-4 h-4 mr-2',
                    value === String(t.id) ? 'opacity-100' : 'opacity-0'
                  )} />
                  {t.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ── Main Form ───────────────────────────────────────────────────────────────
export default function MatchForm({
  defaultValues, onSubmit, isLoading, error, submitLabel = 'Save'
}: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      team_1:     '',
      team_2:     '',
      date:       '',
      start_time: '',
      end_time:   '',
      ...defaultValues,
    },
  })

  const team1 = watch('team_1')
  const team2 = watch('team_2')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label>Team 1</Label>
        <TeamCombobox
          value={team1}
          onChange={val => setValue('team_1', val)}
          exclude={team2}
          placeholder="Select Team 1"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Team 2</Label>
        <TeamCombobox
          value={team2}
          onChange={val => setValue('team_2', val)}
          exclude={team1}
          placeholder="Select Team 2"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Match Date</Label>
        <Input
          id="date" type="date" className="h-12"
          {...register('date', { required: 'Date is required' })}
        />
        {errors.date && (
          <p className="text-xs text-destructive">{errors.date.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="start_time">Start Time</Label>
          <Input id="start_time" type="time" className="h-12" {...register('start_time')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_time">End Time</Label>
          <Input id="end_time" type="time" className="h-12" {...register('end_time')} />
        </div>
      </div>

      <Button type="submit" className="w-full h-12" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
