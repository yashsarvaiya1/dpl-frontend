// components/teams/TeamEditPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTeam, useUpdateTeam } from '@/hooks/useTeam'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import TeamForm from './TeamForm'
import { Skeleton } from '@/components/ui/skeleton'

interface Props { id: number }

export default function TeamEditPage({ id }: Props) {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { data: team, isLoading } = useTeam(id)
  const { mutateAsync, isPending, error } = useUpdateTeam()

  useEffect(() => {
    setHeaderTitle('Edit Team')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  if (isLoading) return <PageWrapper><Skeleton className="h-12 w-full" /></PageWrapper>

  return (
    <PageWrapper>
      <TeamForm
        defaultValues={{ name: team?.name }}
        onSubmit={async (data) => {
          await mutateAsync({ id, data })
          router.push(`/teams/${id}`)
        }}
        isLoading={isPending}
        error={error ? 'Failed to update team.' : null}
        submitLabel="Update Team"
      />
    </PageWrapper>
  )
}
