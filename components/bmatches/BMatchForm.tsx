// components/bmatches/BMatchForm.tsx

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { useMatchList } from '@/hooks/useMatch'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      match:         '',
      ticket_amount: '',
      note:          '',
      ...defaultValues,
    },
  })

  const matchValue = watch('match')
  const { data: matchesData } = useMatchList({ page_size: 100 })
  const matches   = matchesData?.results ?? []
  const selected  = matches.find(m => String(m.id) === matchValue)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Match Combobox */}
      <div className="space-y-1.5">
        <Label>Match</Label>
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
              <span className="truncate">
                {selected
                  ? `${selected.team_1_detail?.name} vs ${selected.team_2_detail?.name} · ${selected.date}`
                  : 'Select Match'}
              </span>
              <ChevronsUpDown className="w-4 h-4 shrink-0 text-muted-foreground ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search match..." />
              <CommandList>
                <CommandEmpty>No matches found.</CommandEmpty>
                <CommandGroup>
                  {matches.map(m => (
                    <CommandItem
                      key={m.id}
                      value={`${m.team_1_detail?.name} vs ${m.team_2_detail?.name} ${m.date}`}
                      onSelect={() => {
                        setValue('match', String(m.id))
                        setOpen(false)
                      }}
                    >
                      <Check className={cn(
                        'w-4 h-4 mr-2 shrink-0',
                        matchValue === String(m.id) ? 'opacity-100' : 'opacity-0'
                      )} />
                      <span className="truncate">
                        {m.team_1_detail?.name} vs {m.team_2_detail?.name}
                        <span className="text-muted-foreground ml-1">· {m.date}</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.match && (
          <p className="text-xs text-destructive">{errors.match.message}</p>
        )}
      </div>

      {/* Ticket Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="ticket_amount">Ticket Amount</Label>
        <Input
          id="ticket_amount"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 100"
          className="h-12"
          {...register('ticket_amount', { required: 'Ticket amount is required', min: 1 })}
        />
        {errors.ticket_amount && (
          <p className="text-xs text-destructive">{errors.ticket_amount.message}</p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          placeholder="Any note for users..."
          className="h-12"
          {...register('note')}
        />
      </div>

      <Button type="submit" className="w-full h-12" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
