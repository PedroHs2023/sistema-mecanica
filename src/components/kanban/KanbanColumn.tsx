import { Plus, MoreHorizontal, ClipboardList } from 'lucide-react'
import type { ServiceOrder, ServiceOrderStatus } from '../../types'
import { STATUS_LABELS } from '../../lib/utils'
import { ServiceOrderCard } from './ServiceOrderCard'

const COLUMN_ACCENT: Record<ServiceOrderStatus, string> = {
  AGENDADO:             '#2563EB',
  EM_ANALISE:           '#B45309',
  AGUARDANDO_APROVACAO: '#F97316',
  EM_ANDAMENTO:         '#7C3AED',
  CONCLUIDO:            '#16A34A',
  ENTREGUE:             '#6B7280',
  CANCELADO:            '#EF4444',
}

interface KanbanColumnProps {
  status: ServiceOrderStatus
  orders: ServiceOrder[]
  onAddOrder?: () => void
}

export function KanbanColumn({ status, orders, onAddOrder }: KanbanColumnProps) {
  const accent = COLUMN_ACCENT[status]
  const label  = STATUS_LABELS[status]

  return (
    <div className="flex flex-col w-[268px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          <span className="text-[12px] font-semibold text-t-text">{label}</span>
          <span
            className="text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none"
            style={{ backgroundColor: `${accent}18`, color: accent }}
          >
            {orders.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover/col:opacity-100 transition-opacity">
          <ColBtn onClick={onAddOrder}><Plus size={12} /></ColBtn>
          <ColBtn><MoreHorizontal size={12} /></ColBtn>
        </div>
      </div>

      {/* Top accent line */}
      <div
        className="h-[2px] w-full mb-3 rounded-full"
        style={{ backgroundColor: accent, opacity: 0.4 }}
      />

      {/* Cards scroll area */}
      <div className="group/col flex-1 space-y-2 min-h-[80px] overflow-y-auto overflow-x-hidden pr-0.5">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border border-dashed border-t-border">
            <ClipboardList size={14} className="text-t-muted" strokeWidth={1.5} />
            <p className="text-[11px] text-t-muted">Sem OS</p>
          </div>
        ) : (
          orders.map((order) => (
            <ServiceOrderCard key={order.id} order={order} />
          ))
        )}
      </div>

      {/* Add button */}
      <button
        onClick={onAddOrder}
        className="mt-2 w-full flex items-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] text-t-muted hover:text-t-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
      >
        <Plus size={11} />
        Adicionar OS
      </button>
    </div>
  )
}

function ColBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-6 h-6 rounded flex items-center justify-center text-t-muted hover:text-t-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
    >
      {children}
    </button>
  )
}
