// components/shared/Providers.tsx

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,    // ← refetch when tab regains focus
        refetchOnReconnect: true,      // ← refetch on network reconnect
        staleTime: 30 * 1000,          // ← data stale after 30 seconds
        retry: 1,                      // ← only retry once on failure
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
