import { Link } from 'react-router-dom'
import { Paperclip, MessageSquare, Wrench, CalendarDays } from 'lucide-react'
import type { ServiceOrder } from '../../types'
import {
  PRIORITY_LABELS, PRIORITY_COLORS, TYPE_LABELS, TYPE_COLORS,
  formatDate, formatCurrency,
} from '../../lib/utils'

interface ServiceOrderCardProps {
  order: ServiceOrder
}

export function ServiceOrderCard({ order }: ServiceOrderCardProps) {
  const priorityColor = PRIORITY_COLORS[order.priority]
  const typeStyle     = TYPE_COLORS[order.type]

  return (
    <Link to={`/ordens-servico/${order.id}`} className="block group">
      <article
        className="relative rounded-lg border border-t-border bg-t-card hover:bg-t-card-hover hover:shadow-card-hover transition-all duration-150 overflow-hidden cursor-pointer"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Priority side strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ backgroundColor: priorityColor }}
        />

        <div className="pl-3.5 pr-3 pt-2.5 pb-2">
          {/* Badges */}
          <div className="flex items-center gap-1 mb-2">
            <span
              className="inline-flex items-center gap-0.5 rounded-[3px] px-1.5 py-[2px] text-[9px] font-semibold uppercase tracking-[0.04em] leading-none"
              style={{ backgroundColor: `${priorityColor}18`, color: priorityColor }}
            >
              {PRIORITY_LABELS[order.priority]}
            </span>
            <span
              className="inline-flex items-center rounded-[3px] px-1.5 py-[2px] text-[9px] font-semibold uppercase tracking-[0.04em] leading-none"
              style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
            >
              {TYPE_LABELS[order.type]}
            </span>
          </div>

          {/* OS number */}
          <p className="text-[9px] font-mono text-t-muted mb-1 leading-none tracking-wide">
            #{order.number}
          </p>

          {/* Vehicle */}
          <h3 className="text-[12px] font-semibold text-t-text leading-snug mb-1 truncate">
            {order.vehicle}
          </h3>

          {/* Plate + customer */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="font-mono text-[10px] font-bold tracking-widest text-t-secondary bg-t-surface border border-t-border rounded-[3px] px-1.5 py-[2px] leading-none">
              {order.plate}
            </span>
            <span className="text-[11px] text-t-muted truncate min-w-0">{order.customerName}</span>
          </div>

          {/* Date + value */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="flex items-center gap-1 text-[10px] text-t-muted">
              <CalendarDays size={10} strokeWidth={1.5} />
              {formatDate(order.entryDate)}
            </span>
            {order.estimatedValue > 0 && (
              <span className="text-[11px] font-semibold text-t-text">
                {formatCurrency(order.estimatedValue)}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-t-border">
            <div className="flex items-center gap-2 text-t-muted">
              {order.partsCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px]">
                  <Wrench size={10} strokeWidth={1.5} /> {order.partsCount}
                </span>
              )}
              {order.commentsCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px]">
                  <MessageSquare size={10} strokeWidth={1.5} /> {order.commentsCount}
                </span>
              )}
              {order.attachmentsCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px]">
                  <Paperclip size={10} strokeWidth={1.5} /> {order.attachmentsCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-t-muted hidden sm:block">
                {order.mechanic.name.split(' ')[0]}
              </span>
              <MechAvatar initials={order.mechanic.initials} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function MechAvatar({ initials }: { initials: string }) {
  const COLORS = [
    ['rgba(59,130,246,0.15)',  '#2563EB'],
    ['rgba(139,92,246,0.15)',  '#7C3AED'],
    ['rgba(22,163,74,0.15)',   '#16A34A'],
    ['rgba(234,88,12,0.15)',   '#EA580C'],
    ['rgba(219,39,119,0.15)',  '#DB2777'],
    ['rgba(8,145,178,0.15)',   '#0891B2'],
  ]
  const [bg, text] = COLORS[initials.charCodeAt(0) % COLORS.length]
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 uppercase"
      style={{ backgroundColor: bg, color: text }}
    >
      {initials.slice(0, 2)}
    </div>
  )
}
