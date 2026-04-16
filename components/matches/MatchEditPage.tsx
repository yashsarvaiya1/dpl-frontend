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
  const { data: match, isLoading }      = useMatch(id)
  const { mutateAsync, isPending }      = useUpdateMatch()
  // ← string | undefined, NOT null — fixes TS error
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    setHeaderTitle('Edit Match')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-12 w-full rounded-xl" />
    </PageWrapper>
  )

  if (!match) return (
    <PageWrapper>
      <p className="text-center text-sm text-destructive py-12">Match not found.</p>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <MatchForm
        defaultValues={{
          team_1:     String(match.team_1),
          team_2:     String(match.team_2),
          date:       match.date ?? '',           // ← null → '' fixes TS
          start_time: match.start_time ?? '',     // ← null → ''
          end_time:   match.end_time ?? '',       // ← null → ''
        }}
        onSubmit={async (data) => {
          setError(undefined)
          try {
            await mutateAsync({
              id,
              data: {
                team_1:     Number(data.team_1),
                team_2:     Number(data.team_2),
                date:       data.date,
                start_time: data.start_time,
                end_time:   data.end_time,
              },
            })
            router.push(`/matches/${id}`)
          } catch (err: unknown) {
            const resData = (err as any)?.response?.data
            setError(
              resData?.date?.[0]
              ?? resData?.non_field_errors?.[0]
              ?? resData?.detail
              ?? 'Failed to update match.'
            )
          }
        }}
        isLoading={isPending}
        error={error}
        submitLabel="Update Match"
      />
    </PageWrapper>
  )
}
