// components/auth/PasswordPage.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import GuestGuard from '@/components/shared/GuestGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronLeft, Eye, EyeOff, Ticket } from 'lucide-react'

function PasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const setAuth      = useAuthStore(s => s.setAuth)

  const mobile      = searchParams.get('mobile') || ''
  const hasPassword = searchParams.get('hasPassword') === 'true'

  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [error,           setError]           = useState('')

  useEffect(() => {
    if (!mobile) router.replace('/login')
  }, [mobile, router])

  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: () => authService.login(mobile, password),
    onSuccess: (data) => { setAuth(data.user, data.access, data.refresh); router.replace('/') },
    onError: () => setError('Incorrect password. Please try again.'),
  })

  const { mutate: setPasswordMutation, isPending: isSetPending } = useMutation({
    mutationFn: () => authService.setPassword(mobile, password, confirmPassword),
    onSuccess: (data) => { setAuth(data.user, data.access, data.refresh); router.replace('/') },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail
        || err?.response?.data?.confirm_password?.[0]
        || 'Failed to set password. Please try again.'
      setError(msg)
    },
  })

  const isPending = isLoginPending || isSetPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!hasPassword && password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    hasPassword ? login() : setPasswordMutation()
  }

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto px-6">
      <div className="flex-1 flex flex-col justify-center gap-8 py-10">

        {/* Header */}
        <div className="space-y-4">
          <button
            onClick={() => router.replace('/login')}
            className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors -ml-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {hasPassword ? 'Enter Password' : 'Create Password'}
              </h1>
              <p className="text-muted-foreground text-sm">{mobile}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">
              {hasPassword ? 'Password' : 'New Password'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                className="h-12 text-base pr-12"
                autoComplete={hasPassword ? 'current-password' : 'new-password'}
                autoFocus
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password — only for new password */}
          {!hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                  className="h-12 text-base pr-12"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isPending || !password.trim()}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Please wait...
              </span>
            ) : hasPassword ? 'Login' : 'Set Password & Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function PasswordPage() {
  return (
    <GuestGuard>
      <PasswordForm />
    </GuestGuard>
  )
}
