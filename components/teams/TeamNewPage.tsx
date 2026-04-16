// components/teams/TeamNewPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateTeam } from '@/hooks/useTeam'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import TeamForm from './TeamForm'

export default function TeamNewPage() {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { mutateAsync, isPending, error } = useCreateTeam()

  useEffect(() => {
    setHeaderTitle('New Team')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  const apiError     = (error as any)?.response?.data
  const errorMessage = apiError?.name?.[0] ?? apiError?.detail
    ?? (error ? 'Failed to create team.' : undefined)

  return (
    <PageWrapper>
      <TeamForm
        onSubmit={async (data) => {
          await mutateAsync(data)
          router.push('/teams')
        }}
        isLoading={isPending}
        error={errorMessage}
        submitLabel="Create Team"
      />
    </PageWrapper>
  )
}
