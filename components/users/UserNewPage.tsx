// components/users/UserNewPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/stores/uiStore'
import { useCreateUser } from '@/hooks/useUser'
import { CreateUserPayload } from '@/lib/types'   // ← from lib/types
import PageWrapper from '@/components/shared/PageWrapper'
import UserForm from './UserForm'

export default function UserNewPage() {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { mutate: createUser, isPending, error } = useCreateUser()

  useEffect(() => {
    setHeaderTitle('New User')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  const apiError = (error as any)?.response?.data
  const errorMessage = apiError?.mobile_number?.[0]
    || apiError?.detail
    || (error ? 'Failed to create user. Please try again.' : undefined)

  return (
    <PageWrapper>
      <UserForm
        isPending={isPending}
        error={errorMessage}
        onSubmit={(data) =>
          createUser(data as CreateUserPayload, {
            onSuccess: () => router.replace('/users'),
          })
        }
      />
    </PageWrapper>
  )
}
