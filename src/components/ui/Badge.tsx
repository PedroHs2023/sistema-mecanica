import type { ReactNode, CSSProperties } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'muted'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-dark-text-secondary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  purple: 'bg-violet/15 text-violet',
  muted: 'bg-white/5 text-dark-text-muted',
}

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
  style?: CSSProperties
  dot?: boolean
}

export function Badge({ children, variant = 'default', className, style, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5',
        'text-[10px] font-medium leading-tight tracking-wide uppercase',
        variantClasses[variant],
        className,
      )}
      style={style}
    >
      {dot && <span className="w-1 h-1 rounded-full bg-current opacity-70 flex-shrink-0" />}
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  label: string
  color: string
  bgColor: string
  className?: string
}

export function StatusBadge({ label, color, bgColor, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5',
        'text-[10px] font-medium leading-tight tracking-wide uppercase',
        className,
      )}
      style={{ backgroundColor: bgColor, color }}
    >
      <span className="w-1 h-1 rounded-full bg-current opacity-80 flex-shrink-0" />
      {label}
    </span>
  )
}
