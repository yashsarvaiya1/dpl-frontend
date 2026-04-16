// components/matches/MatchNewPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateMatch } from '@/hooks/useMatch'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import MatchForm from './MatchForm'

export default function MatchNewPage() {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { mutateAsync, isPending } = useCreateMatch()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHeaderTitle('New Match')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  const handleSubmit = async (data: {
    team_1: string; team_2: string
    date: string; start_time: string; end_time: string
  }) => {
    setError(null)
    try {
      await mutateAsync({
        team_1: Number(data.team_1),
        team_2: Number(data.team_2),
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
      })
      router.push('/matches')
    } catch (err: any) {
      const data = err?.response?.data
      if (data?.date) setError(data.date[0] || data.date)
      else if (data?.non_field_errors) setError(data.non_field_errors[0])
      else if (data?.detail) setError(data.detail)
      else setError('Failed to create match. One or both teams already have a match on this date.')
    }
  }

  return (
    <PageWrapper>
      <MatchForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        error={error}
        submitLabel="Create Match"
      />
    </PageWrapper>
  )
}
