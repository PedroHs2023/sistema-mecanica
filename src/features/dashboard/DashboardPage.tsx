import { Link } from 'react-router-dom'
import {
  DollarSign, ClipboardList, Clock, AlertCircle,
  AlertTriangle, Package, Calendar, ArrowRight, CheckCircle2,
} from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { mockServiceOrders } from '../../mocks/service-orders'
import { mockParts } from '../../mocks/inventory'
import { TYPE_LABELS, TYPE_COLORS, PRIORITY_COLORS, formatDate, formatCurrency, getStockStatus } from '../../lib/utils'

const SCHEDULE_MOCK = [
  { time: '08:30', customer: 'João Pereira',    vehicle: 'Honda Civic 2018',    plate: 'ABC-1D23', type: 'REVISAO'     as const },
  { time: '10:00', customer: 'Ana Rodrigues',   vehicle: 'Chevrolet Onix 2021', plate: 'MNO-3H45', type: 'DIAGNOSTICO' as const },
  { time: '13:30', customer: 'Pedro Alves',     vehicle: 'Ford Ka 2019',        plate: 'JKL-0G12', type: 'TROCA_PECA'  as const },
  { time: '15:00', customer: 'Transportes ABC', vehicle: 'Volkswagen Gol 2016', plate: 'GHI-7F89', type: 'GARANTIA'    as const },
]

const STATUS_COLOR: Record<string, string> = {
  AGENDADO: '#2563EB', EM_ANALISE: '#B45309', AGUARDANDO_APROVACAO: '#F97316',
  EM_ANDAMENTO: '#7C3AED', CONCLUIDO: '#16A34A', ENTREGUE: '#6B7280', CANCELADO: '#EF4444',
}
const STATUS_LABEL: Record<string, string> = {
  AGENDADO: 'Agendado', EM_ANALISE: 'Em Análise', AGUARDANDO_APROVACAO: 'Ag. Aprovação',
  EM_ANDAMENTO: 'Em Andamento', CONCLUIDO: 'Concluído', ENTREGUE: 'Entregue', CANCELADO: 'Cancelado',
}

export function DashboardPage() {
  const openOS        = mockServiceOrders.filter((o) => !['ENTREGUE', 'CANCELADO'].includes(o.status))
  const inProgress    = mockServiceOrders.filter((o) => o.status === 'EM_ANDAMENTO')
  const awaitApproval = mockServiceOrders.filter((o) => o.status === 'AGUARDANDO_APROVACAO')
  const lowStock      = mockParts.filter((p) => getStockStatus(p.currentStock, p.minimumStock) !== 'NORMAL')
  const totalRevenue  = mockServiceOrders
    .filter((o) => o.financialStatus === 'PAGA')
    .reduce((a, o) => a + (o.finalValue ?? o.estimatedValue), 0)

  const metrics = [
    { label: 'Faturamento Mês',   value: formatCurrency(totalRevenue), icon: <DollarSign size={15} />,   color: '#16A34A', change: '+12% vs mês anterior', trend: 'up' as const },
    { label: 'OS Abertas',         value: openOS.length,                icon: <ClipboardList size={15} />, color: '#2563EB' },
    { label: 'Em Andamento',       value: inProgress.length,            icon: <Clock size={15} />,         color: '#7C3AED' },
    { label: 'Aguard. Aprovação',  value: awaitApproval.length,         icon: <AlertCircle size={15} />,   color: '#C2410C', change: 'Requer atenção',       trend: 'down' as const },
    { label: 'Contas Vencidas',    value: 0,                            icon: <AlertTriangle size={15} />, color: '#DC2626' },
    { label: 'Estoque Baixo',      value: lowStock.length,              icon: <Package size={15} />,       color: '#B45309', change: 'Reposição necessária',  trend: 'down' as const },
  ]

  return (
    <div className="p-5 max-w-[1400px]">
      <PageHeader
        title="Dashboard"
        subtitle="Terça-feira, 10 de junho de 2026"
        actions={
          <Link to="/ordens-servico"
            className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-t-border bg-t-card text-[11px] font-medium text-t-secondary hover:text-t-text hover:border-t-border-strong transition-colors shadow-card"
          >
            Ver OS <ArrowRight size={11} />
          </Link>
        }
      />

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="relative rounded-lg border border-t-border bg-t-card hover:shadow-card-md transition-shadow overflow-hidden p-4"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-lg" style={{ backgroundColor: m.color }} />
            <div className="flex items-start justify-between gap-2 mt-1">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-t-muted uppercase tracking-[0.06em] mb-2">{m.label}</p>
                <p className="text-[22px] font-bold text-t-text leading-none tracking-tight">{m.value}</p>
                {m.change && (
                  <p className="mt-1.5 text-[10px] font-medium" style={{ color: m.trend === 'up' ? '#16A34A' : m.color }}>
                    {m.change}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${m.color}1E`, color: m.color }}>
                {m.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent OS */}
          <Panel
            title="Últimas Ordens de Serviço"
            action={
              <Link to="/ordens-servico" className="text-[11px] text-accent hover:text-accent-hover flex items-center gap-1 transition-colors">
                Ver todas <ArrowRight size={10} />
              </Link>
            }
          >
            <div className="divide-y divide-t-border">
              {mockServiceOrders.slice(0, 6).map((o) => {
                const pc = PRIORITY_COLORS[o.priority]
                const ts = TYPE_COLORS[o.type]
                const sc = STATUS_COLOR[o.status]
                return (
                  <Link key={o.id} to={`/ordens-servico/${o.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-t-card-hover transition-colors"
                  >
                    <div className="w-[3px] h-8 rounded-full flex-shrink-0" style={{ backgroundColor: pc }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-mono text-t-muted">#{o.number}</span>
                        <span className="text-[9px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
                          style={{ backgroundColor: ts.bg, color: ts.text }}>
                          {TYPE_LABELS[o.type]}
                        </span>
                      </div>
                      <p className="text-[12px] font-semibold text-t-text truncate leading-tight">{o.vehicle}</p>
                      <p className="text-[10px] text-t-muted">{o.customerName} · <span className="font-mono">{o.plate}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
                        style={{ backgroundColor: `${sc}15`, color: sc }}>
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {STATUS_LABEL[o.status]}
                      </span>
                      <span className="text-[10px] text-t-muted">{formatDate(o.entryDate)}</span>
                    </div>
                    <SmallAvatar initials={o.mechanic.initials} />
                  </Link>
                )
              })}
            </div>
          </Panel>

          {/* OS by stage */}
          <Panel title="OS por Etapa">
            <div className="grid grid-cols-3 gap-2 px-4 pb-3">
              {[
                { label: 'Agendado',      status: 'AGENDADO',             color: '#2563EB' },
                { label: 'Em Análise',    status: 'EM_ANALISE',           color: '#B45309' },
                { label: 'Ag. Aprovação', status: 'AGUARDANDO_APROVACAO', color: '#F97316' },
                { label: 'Em Andamento',  status: 'EM_ANDAMENTO',         color: '#7C3AED' },
                { label: 'Concluído',     status: 'CONCLUIDO',            color: '#16A34A' },
                { label: 'Entregue',      status: 'ENTREGUE',             color: '#6B7280' },
              ].map(({ label, status, color }) => (
                <div key={status}
                  className="flex items-center justify-between rounded-md px-3 py-2 border border-t-border bg-t-surface hover:bg-t-card-hover transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[11px] text-t-secondary">{label}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-t-text">
                    {mockServiceOrders.filter((o) => o.status === status).length}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-4">
          <Panel
            title="Agenda de Hoje"
            icon={<Calendar size={12} className="text-accent" />}
            action={<Link to="/agenda" className="text-[11px] text-accent hover:text-accent-hover transition-colors">Ver agenda</Link>}
          >
            <div className="divide-y divide-t-border">
              {SCHEDULE_MOCK.map((e, i) => {
                const ts = TYPE_COLORS[e.type]
                return (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-t-card-hover transition-colors">
                    <span className="text-[11px] font-mono font-semibold text-t-muted w-10 flex-shrink-0">{e.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-t-text truncate leading-tight">{e.customer}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-t-muted truncate">{e.vehicle}</span>
                        <span className="font-mono text-[9px] text-t-muted bg-t-surface border border-t-border rounded px-1">
                          {e.plate}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none flex-shrink-0"
                      style={{ backgroundColor: ts.bg, color: ts.text }}>
                      {TYPE_LABELS[e.type]}
                    </span>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel
            title="Alertas de Estoque"
            icon={<Package size={12} className="text-warning" />}
            action={<Link to="/estoque" className="text-[11px] text-accent hover:text-accent-hover transition-colors">Ver estoque</Link>}
          >
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <CheckCircle2 size={18} className="text-success opacity-70" />
                <p className="text-[11px] text-t-muted">Estoque normalizado</p>
              </div>
            ) : (
              <div className="divide-y divide-t-border">
                {lowStock.map((p) => {
                  const s = getStockStatus(p.currentStock, p.minimumStock)
                  const color = s === 'SEM_ESTOQUE' ? '#DC2626' : '#CA8A04'
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-t-card-hover transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-t-text truncate">{p.description}</p>
                        <p className="text-[10px] text-t-muted">{p.internalCode}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-semibold" style={{ color }}>
                          {s === 'SEM_ESTOQUE' ? 'Sem estoque' : 'Baixo'}
                        </p>
                        <p className="text-[10px] text-t-muted">{p.currentStock}/{p.minimumStock}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Panel({
  title, icon, action, children,
}: {
  title: string
  icon?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-t-border bg-t-card overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-t-border bg-t-surface">
        <h2 className="text-[12px] font-semibold text-t-text flex items-center gap-1.5">
          {icon}{title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function SmallAvatar({ initials }: { initials: string }) {
  const COLORS = [
    ['rgba(37,99,235,0.15)',  '#2563EB'],
    ['rgba(124,58,237,0.15)', '#7C3AED'],
    ['rgba(22,163,74,0.15)',  '#16A34A'],
    ['rgba(234,88,12,0.15)',  '#EA580C'],
  ]
  const [bg, text] = COLORS[initials.charCodeAt(0) % COLORS.length]
  return (
    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 uppercase"
      style={{ backgroundColor: bg, color: text }}>
      {initials.slice(0, 2)}
    </div>
  )
}
