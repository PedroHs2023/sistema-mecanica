import { useState, useMemo } from 'react'
import { Plus, LayoutGrid, List, SlidersHorizontal, X, Search } from 'lucide-react'
import { KanbanBoard } from '../../components/kanban/KanbanBoard'
import { mockServiceOrders } from '../../mocks/service-orders'
import { mockMechanics } from '../../mocks/mechanics'
import type { ServiceOrderStatus, ServiceOrderPriority } from '../../types'
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '../../lib/utils'
import { cn } from '../../lib/utils'

type ViewMode = 'kanban' | 'list'

const ALL_STATUSES: ServiceOrderStatus[] = [
  'AGENDADO', 'EM_ANALISE', 'AGUARDANDO_APROVACAO',
  'EM_ANDAMENTO', 'CONCLUIDO', 'ENTREGUE', 'CANCELADO',
]
const ALL_PRIORITIES: ServiceOrderPriority[] = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']

interface Filters {
  search: string
  status: ServiceOrderStatus | ''
  mechanic: string
  priority: ServiceOrderPriority | ''
}

export function ServiceOrdersPage() {
  const [view, setView] = useState<ViewMode>('kanban')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '', status: '', mechanic: '', priority: '',
  })

  const filteredOrders = useMemo(() => mockServiceOrders.filter((o) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !o.plate.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q) &&
        !o.number.includes(q) &&
        !o.vehicle.toLowerCase().includes(q)
      ) return false
    }
    if (filters.status   && o.status     !== filters.status)   return false
    if (filters.mechanic && o.mechanicId !== filters.mechanic) return false
    if (filters.priority && o.priority   !== filters.priority) return false
    return true
  }), [filters])

  const activeFilterCount = [filters.status, filters.mechanic, filters.priority].filter(Boolean).length

  return (
    <div className="flex flex-col h-[calc(100vh-44px)] overflow-hidden">

      {/* ── Page header ───────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-t-border bg-t-topbar">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-[18px] font-bold text-t-text leading-tight tracking-tight">
              Ordens de Serviço
            </h1>
            <p className="text-[12px] text-t-muted mt-0.5">
              Diagnósticos, aprovações, execução e entrega dos veículos.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View toggle */}
            <div className="flex items-center bg-t-surface border border-t-border rounded-md p-[3px]">
              {(['kanban', 'list'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 h-6 rounded text-[11px] font-medium transition-colors',
                    view === v
                      ? 'bg-white dark:bg-white/10 text-t-text shadow-sm'
                      : 'text-t-muted hover:text-t-secondary',
                  )}
                >
                  {v === 'kanban' ? <LayoutGrid size={12} /> : <List size={12} />}
                  {v === 'kanban' ? 'Kanban' : 'Lista'}
                </button>
              ))}
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-1.5 h-7 px-3 rounded-md border text-[11px] font-medium transition-colors',
                showFilters || activeFilterCount > 0
                  ? 'border-accent/40 bg-orange-50 text-orange-700 dark:bg-accent/[0.08] dark:text-accent'
                  : 'border-t-border bg-t-card text-t-secondary hover:text-t-text hover:border-t-border-strong',
              )}
            >
              <SlidersHorizontal size={12} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="text-[9px] font-bold bg-accent text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Nova OS */}
            <button className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-[11px] font-semibold transition-colors shadow-sm">
              <Plus size={12} strokeWidth={2.5} />
              Nova OS
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex items-center">
            <Search size={12} className="absolute left-2.5 text-t-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Placa, cliente ou nº da OS..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="h-7 w-56 bg-t-surface border border-t-border rounded-md text-[11px] text-t-text placeholder:text-t-muted pl-7 pr-3 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-colors"
            />
          </div>

          {showFilters && (
            <>
              <FilterSelect
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v as ServiceOrderStatus | '' }))}
                placeholder="Status"
                options={ALL_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              />
              <FilterSelect
                value={filters.priority}
                onChange={(v) => setFilters((f) => ({ ...f, priority: v as ServiceOrderPriority | '' }))}
                placeholder="Prioridade"
                options={ALL_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
              />
              <FilterSelect
                value={filters.mechanic}
                onChange={(v) => setFilters((f) => ({ ...f, mechanic: v }))}
                placeholder="Mecânico"
                options={mockMechanics.map((m) => ({ value: m.id, label: m.name }))}
              />
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters({ search: '', status: '', mechanic: '', priority: '' })}
                  className="flex items-center gap-1 text-[11px] text-t-muted hover:text-danger transition-colors"
                >
                  <X size={11} /> Limpar
                </button>
              )}
            </>
          )}

          <span className="ml-auto text-[11px] text-t-muted">
            {filteredOrders.length} OS
          </span>
        </div>
      </div>

      {/* ── Board ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden px-5 pt-4 bg-t-bg">
        {view === 'kanban' ? (
          <KanbanBoard orders={filteredOrders} />
        ) : (
          <OSListView orders={filteredOrders} />
        )}
      </div>
    </div>
  )
}

// ── Filter select ─────────────────────────────────────────────────────────────

function FilterSelect({
  value, onChange, placeholder, options,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 bg-t-card border border-t-border rounded-md text-[11px] text-t-text pl-2.5 pr-6 focus:outline-none focus:ring-1 focus:ring-accent/40 appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ── List view ─────────────────────────────────────────────────────────────────

function OSListView({ orders }: { orders: typeof mockServiceOrders }) {
  const STATUS_COLOR: Record<string, string> = {
    AGENDADO: '#2563EB', EM_ANALISE: '#B45309', AGUARDANDO_APROVACAO: '#F97316',
    EM_ANDAMENTO: '#7C3AED', CONCLUIDO: '#16A34A', ENTREGUE: '#6B7280', CANCELADO: '#EF4444',
  }
  const STATUS_LABEL: Record<string, string> = {
    AGENDADO: 'Agendado', EM_ANALISE: 'Em Análise', AGUARDANDO_APROVACAO: 'Ag. Aprovação',
    EM_ANDAMENTO: 'Em Andamento', CONCLUIDO: 'Concluído', ENTREGUE: 'Entregue', CANCELADO: 'Cancelado',
  }

  return (
    <div className="rounded-lg border border-t-border bg-t-card overflow-hidden shadow-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-t-border bg-t-surface">
            {['OS', 'Veículo', 'Cliente', 'Prioridade', 'Status', 'Mecânico', 'Valor'].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-t-muted uppercase tracking-widest">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-t-border">
          {orders.map((o) => {
            const pc = PRIORITY_COLORS[o.priority]
            const sc = STATUS_COLOR[o.status]
            return (
              <tr key={o.id} className="hover:bg-t-card-hover transition-colors">
                <td className="px-4 py-2.5">
                  <span className="font-mono text-[10px] text-t-muted">#{o.number}</span>
                </td>
                <td className="px-4 py-2.5">
                  <p className="text-[12px] font-semibold text-t-text">{o.vehicle}</p>
                  <span className="font-mono text-[10px] text-t-muted bg-t-surface border border-t-border rounded px-1 py-0.5">
                    {o.plate}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-t-secondary">{o.customerName}</td>
                <td className="px-4 py-2.5">
                  <span
                    className="text-[10px] font-semibold uppercase rounded-[3px] px-1.5 py-0.5"
                    style={{ backgroundColor: `${pc}15`, color: pc }}
                  >
                    {PRIORITY_LABELS[o.priority]}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase rounded-[3px] px-1.5 py-0.5"
                    style={{ backgroundColor: `${sc}15`, color: sc }}
                  >
                    <span className="w-1 h-1 rounded-full bg-current" />
                    {STATUS_LABEL[o.status]}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#7C3AED' }}
                    >
                      {o.mechanic.initials}
                    </div>
                    <span className="text-[11px] text-t-secondary">{o.mechanic.name.split(' ')[0]}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  {o.estimatedValue > 0 ? (
                    <span className="text-[12px] font-semibold text-t-text">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.estimatedValue)}
                    </span>
                  ) : (
                    <span className="text-t-muted">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
