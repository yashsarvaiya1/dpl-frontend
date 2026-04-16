// components/teams/TeamForm.tsx

'use client'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'   // ← AlertDescription

interface FormValues { name: string }

interface Props {
  defaultValues?: Partial<FormValues>
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
  error?: string | null
  submitLabel?: string
}

export default function TeamForm({
  defaultValues, onSubmit, isLoading, error, submitLabel = 'Save'
}: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: defaultValues?.name ?? '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          placeholder="e.g. Mumbai Indians"
          className="h-12"
          {...register('name', { required: 'Team name is required' })}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full h-12" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
