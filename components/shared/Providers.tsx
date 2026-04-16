// components/shared/Providers.tsx

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        staleTime: 30 * 1000,
        retry: (failureCount, error: any) => {
          // Don't retry on 401/403/404
          const status = error?.response?.status
          if ([401, 403, 404].includes(status)) return false
          return failureCount < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
