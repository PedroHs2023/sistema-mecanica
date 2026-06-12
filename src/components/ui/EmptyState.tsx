import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}>
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-t-surface border border-t-border flex items-center justify-center text-t-muted mb-3">
          {icon}
        </div>
      )}
      <p className="text-[12px] font-semibold text-t-secondary mb-0.5">{title}</p>
      {description && <p className="text-[11px] text-t-muted max-w-xs">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
