// components/matches/MatchEditPage.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMatch, useUpdateMatch } from '@/hooks/useMatch'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import MatchForm from './MatchForm'
import { Skeleton } from '@/components/ui/skeleton'

interface Props { id: number }

export default function MatchEditPage({ id }: Props) {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { data: match, isLoading } = useMatch(id)
  const { mutateAsync, isPending } = useUpdateMatch()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHeaderTitle('Edit Match')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  if (isLoading) return <PageWrapper><Skeleton className="h-12 w-full" /></PageWrapper>

  return (
    <PageWrapper>
      <MatchForm
        defaultValues={{
          team_1: String(match?.team_1),
          team_2: String(match?.team_2),
          date: match?.date,
          start_time: match?.start_time,
          end_time: match?.end_time,
        }}
        onSubmit={async (data) => {
          setError(null)
          try {
            await mutateAsync({
              id,
              data: {
                team_1: Number(data.team_1),
                team_2: Number(data.team_2),
                date: data.date,
                start_time: data.start_time,
                end_time: data.end_time,
              }
            })
            router.push(`/matches/${id}`)
          } catch (err: any) {
            const resData = err?.response?.data
            if (resData?.date) setError(resData.date[0] || resData.date)
            else if (resData?.non_field_errors) setError(resData.non_field_errors[0])
            else if (resData?.detail) setError(resData.detail)
            else setError('Failed to update match.')
          }
        }}
        isLoading={isPending}
        error={error}
        submitLabel="Update Match"
      />
    </PageWrapper>
  )
}
