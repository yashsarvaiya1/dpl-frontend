// components/bmatches/BMatchEditPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBMatch, useUpdateBMatch } from '@/hooks/useBMatch'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import BMatchForm from './BMatchForm'
import { Skeleton } from '@/components/ui/skeleton'

interface Props { id: number }

export default function BMatchEditPage({ id }: Props) {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { data: bmatch, isLoading }     = useBMatch(id)
  const { mutateAsync, isPending, error } = useUpdateBMatch()

  useEffect(() => {
    setHeaderTitle('Edit BMatch')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  if (isLoading) return (
    <PageWrapper>
      <Skeleton className="h-12 w-full rounded-xl" />
    </PageWrapper>
  )

  if (!bmatch) return (
    <PageWrapper>
      <p className="text-center text-sm text-destructive py-12">BMatch not found.</p>
    </PageWrapper>
  )

  const apiError = (error as any)?.response?.data
  const errorMessage = apiError?.detail ?? apiError?.non_field_errors?.[0]
    ?? (error ? 'Failed to update BMatch.' : undefined)

  return (
    <PageWrapper>
      <BMatchForm
        defaultValues={{
          match:         String(bmatch.match),
          ticket_amount: String(bmatch.ticket_amount),
          note:          bmatch.note ?? '',
        }}
        onSubmit={async (data) => {
          await mutateAsync({
            id,
            data: {
              match:         Number(data.match),
              ticket_amount: Number(data.ticket_amount),
              note:          data.note || undefined,
            },
          })
          router.push(`/bmatches/${id}`)
        }}
        isLoading={isPending}
        error={errorMessage}
        submitLabel="Update BMatch"
      />
    </PageWrapper>
  )
}
