import type { ServiceOrder, ServiceOrderStatus } from '../../types'
import { KanbanColumn } from './KanbanColumn'

const COLUMN_ORDER: ServiceOrderStatus[] = [
  'AGENDADO', 'EM_ANALISE', 'AGUARDANDO_APROVACAO',
  'EM_ANDAMENTO', 'CONCLUIDO', 'ENTREGUE',
]

interface KanbanBoardProps {
  orders: ServiceOrder[]
  onAddOrder?: (status?: ServiceOrderStatus) => void
}

export function KanbanBoard({ orders, onAddOrder }: KanbanBoardProps) {
  const grouped = COLUMN_ORDER.reduce<Record<ServiceOrderStatus, ServiceOrder[]>>(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status)
      return acc
    },
    {} as Record<ServiceOrderStatus, ServiceOrder[]>,
  )

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-0.5 kanban-scroll">
      {COLUMN_ORDER.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          orders={grouped[status]}
          onAddOrder={() => onAddOrder?.(status)}
        />
      ))}
      {/* Trailing padding */}
      <div className="w-2 flex-shrink-0 self-stretch" />
    </div>
  )
}
