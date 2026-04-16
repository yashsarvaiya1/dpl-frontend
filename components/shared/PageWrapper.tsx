// components/shared/PageWrapper.tsx

import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export default function PageWrapper({ children, className, noPadding }: PageWrapperProps) {
  return (
    <div
      className={cn(
        'max-w-md mx-auto',
        // ← removed min-h-[calc(100dvh-7rem)] — AppShell owns height now
        !noPadding && 'px-4 py-4',
        className
      )}
    >
      {children}
    </div>
  )
}
