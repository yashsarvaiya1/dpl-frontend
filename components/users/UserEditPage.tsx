// components/users/UserEditPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/stores/uiStore'
import { useUser, useUpdateUser } from '@/hooks/useUser'
import PageWrapper from '@/components/shared/PageWrapper'
import UserForm from './UserForm'

interface Props { id: number }

export default function UserEditPage({ id }: Props) {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { data: user, isLoading }             = useUser(id)
  const { mutate: updateUser, isPending, error } = useUpdateUser()

  useEffect(() => {
    setHeaderTitle('Edit User')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  if (isLoading) return (
    <PageWrapper>
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </PageWrapper>
  )

  if (!user) return (
    <PageWrapper>
      <p className="text-center text-sm text-destructive py-12">User not found.</p>
    </PageWrapper>
  )

  const apiError = (error as any)?.response?.data
  const errorMessage = apiError?.mobile_number?.[0]
    || apiError?.detail
    || (error ? 'Failed to update user. Please try again.' : undefined)

  return (
    <PageWrapper>
      <UserForm
        isEdit
        defaultValues={{
          username:      user.username || '',
          mobile_number: user.mobile_number,
          is_staff:      user.is_staff,
          is_active:     user.is_active,
          tickets:       user.tickets ?? 0,
        }}
        isPending={isPending}
        error={errorMessage}
        onSubmit={(data) =>
          updateUser(
            { id, payload: data },
            { onSuccess: () => router.replace(`/users/${id}`) }
          )
        }
      />
    </PageWrapper>
  )
}
