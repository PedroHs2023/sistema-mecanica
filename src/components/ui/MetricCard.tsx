import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  accentColor?: string
}

export function MetricCard({ label, value, icon, change, trend = 'neutral', accentColor }: MetricCardProps) {
  const trendColor = trend === 'up' ? '#22C55E' : trend === 'down' ? '#EF4444' : undefined
  return (
    <div className="relative rounded-lg border border-t-border bg-t-card hover:bg-t-card-hover transition-colors overflow-hidden p-3.5" style={{ boxShadow: 'var(--shadow-card)' }}>
      {accentColor && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: accentColor, opacity: 0.5 }} />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-t-muted uppercase tracking-[0.06em] mb-1.5">{label}</p>
          <p className="text-[20px] font-bold text-t-text leading-none tracking-tight">{value}</p>
          {change && (
            <p className="mt-1 text-[10px] font-medium" style={{ color: trendColor ?? 'var(--text-muted)' }}>{change}</p>
          )}
        </div>
        {icon && accentColor && (
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatPillProps {
  label: string
  value: number
  color: string
}

export function StatPill({ label, value, color }: StatPillProps) {
  return (
    <div className="flex items-center justify-between rounded-md px-3 py-2 border border-t-border bg-t-surface">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[11px] text-t-secondary">{label}</span>
      </div>
      <span className="text-[12px] font-semibold text-t-text">{value}</span>
    </div>
  )
}
