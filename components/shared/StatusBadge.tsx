// components/shared/StatusBadge.tsx

import { cn } from '@/lib/utils'

interface Props {
  label: string
  colorClass: string
  className?: string
}

export default function StatusBadge({ label, colorClass, className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      colorClass,
      className
    )}>
      {label}
    </span>
  )
}
