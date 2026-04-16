// components/auth/LoginPage.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import GuestGuard from '@/components/shared/GuestGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Ticket } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')

  const { mutate: checkMobile, isPending } = useMutation({
    mutationFn: () => authService.checkMobile(mobile),
    onSuccess: (data) => {
      if (!data.exists) { setError('No account found with this mobile number.'); return }
      if (!data.is_active) { setError('Your account has been deactivated. Contact admin.'); return }
      const params = new URLSearchParams({
        mobile,
        hasPassword: String(data.has_password_set),
      })
      router.push(`/password?${params.toString()}`)
    },
    onError: () => setError('No account found with this mobile number.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!mobile.trim()) return
    checkMobile()
  }

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto px-6">
      {/* Push form to center but leave room for keyboard */}
      <div className="flex-1 flex flex-col justify-center gap-10 py-10">

        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">DPL</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your mobile number to continue
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              inputMode="numeric"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={e => { setMobile(e.target.value); setError('') }}
              className="h-12 text-base"
              autoComplete="tel"
              autoFocus
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isPending || !mobile.trim()}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Checking...
              </span>
            ) : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  )
}
