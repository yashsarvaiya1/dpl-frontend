// components/shared/StatusBadge.tsx

import { cn } from '@/lib/utils'

interface Props {
  label: string
  colorClass: string
  className?: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ label, colorClass, className, size = 'sm' }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      colorClass,
      className
    )}>
      {label}
    </span>
  )
}
