// components/bmatches/BMatchNewPage.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateBMatch } from '@/hooks/useBMatch'
import { useUiStore } from '@/stores/uiStore'
import PageWrapper from '@/components/shared/PageWrapper'
import BMatchForm from './BMatchForm'

export default function BMatchNewPage() {
  const router = useRouter()
  const { setHeaderTitle, setShowBack } = useUiStore()
  const { mutateAsync, isPending, error } = useCreateBMatch()

  useEffect(() => {
    setHeaderTitle('New BMatch')
    setShowBack(true)
    return () => setShowBack(false)
  }, [setHeaderTitle, setShowBack])

  return (
    <PageWrapper>
      <BMatchForm
        onSubmit={async (data) => {
          await mutateAsync({
            match: Number(data.match),
            ticket_amount: Number(data.ticket_amount),
            note: data.note || undefined,
          })
          router.push('/bmatches')
        }}
        isLoading={isPending}
        error={error ? 'Failed to create BMatch.' : null}
        submitLabel="Create BMatch"
      />
    </PageWrapper>
  )
}
