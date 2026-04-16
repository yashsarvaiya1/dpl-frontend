// components/users/UserForm.tsx

'use client'

import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/stores/authStore'
import { CreateUserPayload, UpdateUserPayload } from '@/lib/types'  // ← from lib/types now
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'

export type UserFormValues = {
  username: string
  mobile_number: string
  is_staff: boolean
  is_active: boolean
  tickets: number
}

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void
  isPending: boolean
  error?: string
  isEdit?: boolean
}

export default function UserForm({
  defaultValues,
  onSubmit,
  isPending,
  error,
  isEdit = false,
}: UserFormProps) {
  // ← isSuperUser is a function in the store — call it correctly
  const isSuperUser = useAuthStore(s => s.isSuperUser())

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      username:      '',
      mobile_number: '',
      is_staff:      false,
      is_active:     true,
      tickets:       0,
      ...defaultValues,
    },
  })

  const isStaff  = watch('is_staff')
  const isActive = watch('is_active')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Full Name</Label>
        <Input
          id="username"
          placeholder="e.g. Raj Mehta"
          className="h-12"
          {...register('username')}
        />
      </div>

      {/* Mobile */}
      <div className="space-y-2">
        <Label htmlFor="mobile_number">
          Mobile Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="mobile_number"
          type="tel"
          inputMode="numeric"
          placeholder="e.g. 9876543210"
          className="h-12"
          disabled={isEdit}
          {...register('mobile_number', {
            required: 'Mobile number is required',
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Enter a valid 10-digit mobile number',
            },
          })}
        />
        {errors.mobile_number && (
          <p className="text-xs text-destructive">{errors.mobile_number.message}</p>
        )}
      </div>

      {/* Tickets */}
      <div className="space-y-2">
        <Label htmlFor="tickets">Tickets</Label>
        <Input
          id="tickets"
          type="number"
          inputMode="numeric"
          min={0}
          className="h-12"
          {...register('tickets', { valueAsNumber: true, min: 0 })}
        />
      </div>

      {/* Admin toggle — superuser only */}
      {isSuperUser && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div>
            <p className="text-sm font-medium">Admin Access</p>
            <p className="text-xs text-muted-foreground">Grant this user admin privileges</p>
          </div>
          <Switch
            checked={isStaff}
            onCheckedChange={val => setValue('is_staff', val)}
          />
        </div>
      )}

      {/* Active toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
        <div>
          <p className="text-sm font-medium">Active</p>
          <p className="text-xs text-muted-foreground">Inactive users cannot log in</p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={val => setValue('is_active', val)}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full h-12 text-base" disabled={isPending}>
        {isPending
          ? isEdit ? 'Saving...' : 'Creating...'
          : isEdit ? 'Save Changes' : 'Create User'}
      </Button>
    </form>
  )
}
