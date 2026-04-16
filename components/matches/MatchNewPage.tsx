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
  const { mutateAsync, isPending }      = useCreateMatch()
  const [error, setError]               = useState<string | undefined>(undefined)

  useEffect(() => {
    setHeaderTitle('New Match')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  return (
    <PageWrapper>
      <MatchForm
        onSubmit={async (data) => {
          setError(undefined)
          try {
            await mutateAsync({
              team_1:     Number(data.team_1),
              team_2:     Number(data.team_2),
              date:       data.date,
              start_time: data.start_time,
              end_time:   data.end_time,
            })
            router.push('/matches')
          } catch (err: unknown) {
            const resData = (err as any)?.response?.data
            setError(
              resData?.date?.[0]
              ?? resData?.non_field_errors?.[0]
              ?? resData?.detail
              ?? 'Failed to create match. Teams may already have a match on this date.'
            )
          }
        }}
        isLoading={isPending}
        error={error}
        submitLabel="Create Match"
      />
    </PageWrapper>
  )
}
