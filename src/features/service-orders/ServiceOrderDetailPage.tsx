import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, Truck, XCircle, Clock,
  Car, User, Wrench, FileText, DollarSign,
  CalendarDays, Package, MessageSquare, Paperclip,
  ChevronRight, AlertCircle,
} from 'lucide-react'
import { mockServiceOrders } from '../../mocks/service-orders'
import { Avatar } from '../../components/ui/Avatar'
import {
  PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, TYPE_LABELS, TYPE_COLORS,
  formatDateFull, formatCurrency, formatDateTime,
} from '../../lib/utils'
import type { ServiceOrderStatus } from '../../types'

const NEXT_STATUS: Partial<Record<ServiceOrderStatus, ServiceOrderStatus>> = {
  AGENDADO: 'EM_ANALISE',
  EM_ANALISE: 'AGUARDANDO_APROVACAO',
  AGUARDANDO_APROVACAO: 'EM_ANDAMENTO',
  EM_ANDAMENTO: 'CONCLUIDO',
  CONCLUIDO: 'ENTREGUE',
}

const NEXT_ACTION_LABEL: Partial<Record<ServiceOrderStatus, string>> = {
  AGENDADO: 'Iniciar Análise',
  EM_ANALISE: 'Enviar p/ Aprovação',
  AGUARDANDO_APROVACAO: 'Aprovar OS',
  EM_ANDAMENTO: 'Concluir',
  CONCLUIDO: 'Entregar Veículo',
}

const STATUS_COLORS: Record<ServiceOrderStatus, string> = {
  AGENDADO: '#2563EB', EM_ANALISE: '#B45309', AGUARDANDO_APROVACAO: '#F97316',
  EM_ANDAMENTO: '#7C3AED', CONCLUIDO: '#16A34A', ENTREGUE: '#6B7280', CANCELADO: '#EF4444',
}

export function ServiceOrderDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const order    = mockServiceOrders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertCircle size={32} className="text-t-muted" />
        <p className="text-[13px] text-t-secondary">Ordem de serviço não encontrada.</p>
        <button
          onClick={() => navigate('/ordens-servico')}
          className="h-7 px-3 rounded-md border border-t-border bg-t-card text-[11px] font-medium text-t-secondary hover:text-t-text transition-colors"
        >
          Voltar para OS
        </button>
      </div>
    )
  }

  const priorityColor = PRIORITY_COLORS[order.priority]
  const typeStyle     = TYPE_COLORS[order.type]
  const statusColor   = STATUS_COLORS[order.status]
  const nextAction    = NEXT_STATUS[order.status]
  const nextLabel     = NEXT_ACTION_LABEL[order.status]
  const canCancel     = !['ENTREGUE', 'CANCELADO'].includes(order.status)

  const totalParts    = order.parts.reduce((a, p) => a + p.total, 0)
  const totalServices = order.services.reduce((a, s) => a + s.total, 0)
  const total         = order.finalValue ?? (totalParts + totalServices || order.estimatedValue)

  const priorityBg =
    order.priority === 'URGENTE' ? 'rgba(239,68,68,0.10)' :
    order.priority === 'ALTA'    ? 'rgba(249,115,22,0.10)' :
    order.priority === 'MEDIA'   ? 'rgba(234,179,8,0.10)'  :
                                   'rgba(34,197,94,0.10)'

  return (
    <div className="p-5 max-w-[1160px]">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[11px] text-t-muted mb-4">
        <Link to="/ordens-servico" className="hover:text-t-secondary transition-colors flex items-center gap-1">
          <ArrowLeft size={11} /> Ordens de Serviço
        </Link>
        <ChevronRight size={10} />
        <span className="text-t-text font-medium">OS #{order.number}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[18px] font-bold text-t-text tracking-tight">OS #{order.number}</h1>

          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase rounded-full px-2.5 py-1 leading-none"
            style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {STATUS_LABELS[order.status]}
          </span>

          <span
            className="text-[10px] font-semibold uppercase rounded-[3px] px-2 py-1 leading-none"
            style={{ backgroundColor: priorityBg, color: priorityColor }}
          >
            {PRIORITY_LABELS[order.priority]}
          </span>

          <span
            className="text-[10px] font-semibold uppercase rounded-[3px] px-2 py-1 leading-none"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
          >
            {TYPE_LABELS[order.type]}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {canCancel && (
            <ActionBtn variant="danger" icon={<XCircle size={12} />}>Cancelar</ActionBtn>
          )}
          {nextAction && nextLabel && (
            <ActionBtn variant="primary" icon={
              nextAction === 'ENTREGUE' ? <Truck size={12} /> : <CheckCircle2 size={12} />
            }>
              {nextLabel}
            </ActionBtn>
          )}
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-4">

        {/* ── Left column ───────────────────────────── */}
        <div className="space-y-3">

          <DetailSection icon={<Car size={12} />} title="Dados do Veículo">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Veículo"  value={order.vehicle} />
              <Field label="Placa"    value={order.plate} mono />
              <Field label="Cliente"  value={order.customerName} />
              <Field label="Entrada"  value={formatDateFull(order.entryDate)} />
            </div>
          </DetailSection>

          {order.symptoms && (
            <DetailSection icon={<AlertCircle size={12} />} title="Sintomas Relatados">
              <p className="text-[12px] text-t-secondary leading-relaxed">{order.symptoms}</p>
            </DetailSection>
          )}

          {order.diagnosis && (
            <DetailSection icon={<FileText size={12} />} title="Diagnóstico">
              <p className="text-[12px] text-t-secondary leading-relaxed">{order.diagnosis}</p>
            </DetailSection>
          )}

          <DetailSection icon={<Package size={12} />} title={`Peças (${order.parts.length})`}>
            {order.parts.length === 0 ? (
              <p className="text-[11px] text-t-muted">Nenhuma peça adicionada.</p>
            ) : (
              <div className="rounded-md border border-t-border overflow-hidden">
                <div className="grid grid-cols-[1fr_52px_76px_76px] px-3 py-2 bg-t-surface text-[10px] font-semibold text-t-muted uppercase tracking-wider">
                  <span>Descrição</span><span className="text-center">Qtd.</span>
                  <span className="text-right">Unit.</span><span className="text-right">Total</span>
                </div>
                {order.parts.map((p) => (
                  <div key={p.partId}
                    className="grid grid-cols-[1fr_52px_76px_76px] px-3 py-2 border-t border-t-border text-[12px] hover:bg-t-card-hover transition-colors"
                  >
                    <span className="text-t-text truncate">{p.description}</span>
                    <span className="text-center text-t-secondary">{p.quantity}</span>
                    <span className="text-right text-t-secondary">{formatCurrency(p.unitPrice)}</span>
                    <span className="text-right font-semibold text-t-text">{formatCurrency(p.total)}</span>
                  </div>
                ))}
                <div className="flex justify-end px-3 py-2 border-t border-t-border bg-t-surface">
                  <span className="text-[11px] text-t-muted mr-3">Subtotal:</span>
                  <span className="text-[12px] font-bold text-t-text">{formatCurrency(totalParts)}</span>
                </div>
              </div>
            )}
          </DetailSection>

          <DetailSection icon={<Wrench size={12} />} title={`Serviços (${order.services.length})`}>
            {order.services.length === 0 ? (
              <p className="text-[11px] text-t-muted">Nenhum serviço adicionado.</p>
            ) : (
              <div className="rounded-md border border-t-border overflow-hidden">
                <div className="grid grid-cols-[1fr_52px_76px_76px] px-3 py-2 bg-t-surface text-[10px] font-semibold text-t-muted uppercase tracking-wider">
                  <span>Descrição</span><span className="text-center">Horas</span>
                  <span className="text-right">R$/h</span><span className="text-right">Total</span>
                </div>
                {order.services.map((s) => (
                  <div key={s.id}
                    className="grid grid-cols-[1fr_52px_76px_76px] px-3 py-2 border-t border-t-border text-[12px] hover:bg-t-card-hover transition-colors"
                  >
                    <span className="text-t-text truncate">{s.description}</span>
                    <span className="text-center text-t-secondary">{s.hours}h</span>
                    <span className="text-right text-t-secondary">
                      {s.hourlyRate > 0 ? formatCurrency(s.hourlyRate) : '—'}
                    </span>
                    <span className="text-right font-semibold">
                      {s.total > 0
                        ? <span className="text-t-text">{formatCurrency(s.total)}</span>
                        : <span className="text-[#16A34A] text-[10px] font-semibold">Garantia</span>
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>

          <DetailSection icon={<Clock size={12} />} title="Histórico">
            <div className="relative pl-5">
              <div className="absolute left-[5px] top-1 bottom-1 w-px bg-t-border" />
              <div className="space-y-3">
                {[...order.statusHistory].reverse().map((entry, i) => {
                  const c = STATUS_COLORS[entry.status]
                  return (
                    <div key={i} className="relative">
                      <span
                        className="absolute -left-5 top-[3px] w-2.5 h-2.5 rounded-full border-2 border-t-card"
                        style={{ backgroundColor: i === 0 ? c : `${c}40` }}
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
                          style={{ backgroundColor: `${c}18`, color: c }}
                        >
                          {STATUS_LABELS[entry.status]}
                        </span>
                        <span className="text-[10px] text-t-muted">{formatDateTime(entry.changedAt)}</span>
                        <span className="text-[10px] text-t-secondary">por {entry.changedBy}</span>
                      </div>
                      {entry.note && (
                        <p className="mt-0.5 text-[11px] text-t-secondary">{entry.note}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </DetailSection>
        </div>

        {/* ── Right column ──────────────────────────── */}
        <div className="space-y-3">

          <DetailSection icon={<DollarSign size={12} />} title="Resumo Financeiro" accent>
            <div className="space-y-2">
              <FinRow label="Peças"    value={formatCurrency(totalParts)} />
              <FinRow label="Serviços" value={formatCurrency(totalServices)} />
              {totalParts + totalServices === 0 && order.estimatedValue > 0 && (
                <FinRow label="Estimado" value={formatCurrency(order.estimatedValue)} />
              )}
              <div className="border-t border-t-border pt-2 flex justify-between items-baseline">
                <span className="text-[12px] font-semibold text-t-text">Total</span>
                <span className="text-[18px] font-bold text-t-text tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>
              {order.financialStatus && <FinStatusBadge status={order.financialStatus} />}
            </div>
          </DetailSection>

          <DetailSection icon={<User size={12} />} title="Cliente">
            <p className="text-[13px] font-semibold text-t-text">{order.customerName}</p>
            <p className="text-[11px] text-t-muted mt-0.5">ID: {order.customerId}</p>
          </DetailSection>

          <DetailSection icon={<Wrench size={12} />} title="Mecânico">
            <div className="flex items-center gap-2.5">
              <Avatar initials={order.mechanic.initials} size="md" />
              <div>
                <p className="text-[12px] font-semibold text-t-text">{order.mechanic.name}</p>
                {order.mechanic.specialty && (
                  <p className="text-[10px] text-t-muted">{order.mechanic.specialty}</p>
                )}
              </div>
            </div>
          </DetailSection>

          <DetailSection icon={<CalendarDays size={12} />} title="Datas">
            <div className="space-y-2">
              <Field label="Entrada"            value={formatDateFull(order.entryDate)} />
              {order.estimatedDelivery && (
                <Field label="Previsão Entrega" value={formatDateFull(order.estimatedDelivery)} />
              )}
              {order.deliveredAt && (
                <Field label="Entregue em"      value={formatDateFull(order.deliveredAt)} accent />
              )}
            </div>
          </DetailSection>

          <DetailSection icon={<MessageSquare size={12} />} title="Interações">
            <div className="space-y-1">
              <InteractionBtn icon={<MessageSquare size={12} />}
                label="Comentários" count={order.commentsCount} color="#3B82F6" />
              <InteractionBtn icon={<Paperclip size={12} />}
                label="Anexos" count={order.attachmentsCount} color="#8B5CF6" />
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailSection({
  icon, title, children, accent,
}: {
  icon?: React.ReactNode
  title: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-lg border bg-t-card p-4 ${accent ? 'border-accent/25' : 'border-t-border'}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        {icon && <span className={accent ? 'text-accent' : 'text-t-muted'}>{icon}</span>}
        <h3 className="text-[12px] font-semibold text-t-text">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-t-muted uppercase tracking-[0.06em] mb-0.5">{label}</p>
      <p className={`text-[12px] font-medium ${mono ? 'font-mono tracking-wider' : ''} ${accent ? 'text-accent' : 'text-t-text'}`}>
        {value}
      </p>
    </div>
  )
}

function FinRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-t-muted">{label}</span>
      <span className="text-[12px] font-medium text-t-text">{value}</span>
    </div>
  )
}

function FinStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    ABERTA:   { label: 'Em Aberto', color: '#3B82F6' },
    PAGA:     { label: 'Paga',      color: '#22C55E' },
    VENCIDA:  { label: 'Vencida',   color: '#EF4444' },
    CANCELADA:{ label: 'Cancelada', color: '#52525B' },
  }
  const { label, color } = map[status] ?? { label: status, color: '#9CA3AF' }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase rounded-[3px] px-2 py-1 leading-none"
      style={{ backgroundColor: `${color}18`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

function InteractionBtn({ icon, label, count, color }: {
  icon: React.ReactNode; label: string; count: number; color: string
}) {
  return (
    <button className="w-full flex items-center justify-between rounded-md px-3 py-2 bg-t-surface border border-t-border hover:bg-t-card-hover transition-colors">
      <span className="flex items-center gap-2 text-[12px] text-t-secondary" style={{ color }}>
        {icon}
        <span className="text-t-secondary">{label}</span>
      </span>
      <span
        className="text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {count}
      </span>
    </button>
  )
}

function ActionBtn({ children, variant, icon }: {
  children: React.ReactNode
  variant: 'primary' | 'danger'
  icon?: React.ReactNode
}) {
  const base = 'flex items-center gap-1.5 h-7 px-3 rounded-md text-[11px] font-semibold transition-colors'
  const styles = variant === 'primary'
    ? `${base} bg-gray-900 hover:bg-black text-white dark:bg-t-text dark:text-gray-900`
    : `${base} border border-danger/30 bg-danger/[0.08] text-danger hover:bg-danger/[0.15]`
  return (
    <button className={styles}>
      {icon}{children}
    </button>
  )
}
