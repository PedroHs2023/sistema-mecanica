import { useState, useMemo } from 'react'
import { ChevronRight, X, Search, FileText, CheckCircle2, AlertCircle, Ban, Send } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { PageHeader } from '../../components/layout/PageHeader'
import { mockInvoices } from '../../mocks/invoices'
import type { Invoice, InvoiceStatus, FiscalStatus } from '../../types'

// ─── Config ───────────────────────────────────────────────────────────────────

const INV_STATUS_STYLE: Record<InvoiceStatus, { label: string; color: string }> = {
  ABERTA:      { label: 'Em aberto',    color: '#6366f1' },
  PAGA_PARCIAL:{ label: 'Pago parcial', color: '#f59e0b' },
  PAGA:        { label: 'Paga',         color: '#22c55e' },
  CANCELADA:   { label: 'Cancelada',    color: '#6b7280' },
}

const FISCAL_STYLE: Record<FiscalStatus, { label: string; color: string }> = {
  NAO_EMITIDO: { label: 'Não emitido', color: '#6b7280' },
  PENDENTE:    { label: 'Pendente',    color: '#f59e0b' },
  AUTORIZADO:  { label: 'Autorizado',  color: '#22c55e' },
  REJEITADO:   { label: 'Rejeitado',   color: '#ef4444' },
}

const PAYMENT_LABELS: Record<string, string> = {
  PIX:             'PIX',
  BOLETO:          'Boleto',
  CARTAO_CREDITO:  'Cartão Crédito',
  CARTAO_DEBITO:   'Cartão Débito',
  DINHEIRO:        'Dinheiro',
  TRANSFERENCIA:   'Transferência',
}

const TODAY = '2026-06-10'

// ─── Drawer ───────────────────────────────────────────────────────────────────

function InvoiceDrawer({ inv, onClose }: { inv: Invoice; onClose: () => void }) {
  const s  = INV_STATUS_STYLE[inv.status]
  const fs = FISCAL_STYLE[inv.fiscalStatus]
  const isOverdue = inv.status === 'ABERTA' && inv.dueDate && inv.dueDate < TODAY

  return (
    <div className="fixed right-0 top-[44px] bottom-0 w-[320px] z-[15] bg-t-card border-l border-t-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-t-border">
        <div>
          <p className="text-xs text-t-muted font-mono">{inv.number}</p>
          <p className="text-sm font-semibold text-t-text">{inv.customerName}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-t-surface text-t-muted">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* badges */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
            {s.label}
          </span>
          {isOverdue && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
              Vencida
            </span>
          )}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${fs.color}15`, color: fs.color }}>
            NF: {fs.label}
          </span>
        </div>

        {/* info */}
        <div className="rounded-lg border border-t-border bg-t-surface p-3 space-y-2">
          <Row label="OS"          value={inv.serviceOrderNumber} />
          <Row label="Veículo"     value={inv.vehicle} />
          <Row label="Placa"       value={inv.plate} mono />
          <Row label="Emitida em"  value={formatDate(inv.issuedAt)} />
          {inv.dueDate && <Row label="Vencimento" value={formatDate(inv.dueDate)} />}
          {inv.paidAt  && <Row label="Pago em"    value={formatDate(inv.paidAt)} />}
          {inv.paymentMethod && <Row label="Pagamento" value={PAYMENT_LABELS[inv.paymentMethod] ?? inv.paymentMethod} />}
        </div>

        {/* values */}
        <div className="rounded-lg border border-t-border bg-t-surface p-3 space-y-2">
          <Row label="Peças"    value={formatCurrency(inv.partsValue)} />
          <Row label="Serviços" value={formatCurrency(inv.servicesValue)} />
          <div className="border-t border-t-border pt-2 mt-1">
            <Row label="Total" value={formatCurrency(inv.totalValue)} bold />
          </div>
          {inv.paidValue !== undefined && inv.paidValue !== inv.totalValue && (
            <Row label="Pago" value={formatCurrency(inv.paidValue)} />
          )}
        </div>

        {/* notes */}
        {inv.notes && (
          <div>
            <p className="text-xs font-semibold text-t-muted uppercase tracking-wide mb-1">Observações</p>
            <p className="text-xs text-t-secondary leading-relaxed bg-t-surface rounded p-2 border border-t-border">
              {inv.notes}
            </p>
          </div>
        )}

        {/* fiscal actions (disabled — no backend) */}
        <div>
          <p className="text-xs font-semibold text-t-muted uppercase tracking-wide mb-2">Ações Fiscais</p>
          <div className="space-y-2">
            <button disabled className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded border border-t-border text-t-muted bg-t-surface opacity-50 cursor-not-allowed">
              <Send size={12} />
              Emitir NF-e (em breve)
            </button>
            <button disabled className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded border border-t-border text-t-muted bg-t-surface opacity-50 cursor-not-allowed">
              <FileText size={12} />
              Baixar XML (em breve)
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-t-border px-4 py-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-t-muted">Valor total</span>
          <span className="text-base font-bold text-t-text">{formatCurrency(inv.totalValue)}</span>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-t-muted">{label}</span>
      <span className={cn('text-t-text', bold && 'font-semibold', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function BillingPage() {
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState<InvoiceStatus | ''>('')
  const [selectedId, setSelected]   = useState<string | null>(null)

  const overdue = mockInvoices.filter(i => i.status === 'ABERTA' && i.dueDate && i.dueDate < TODAY)
  const paid    = mockInvoices.filter(i => i.status === 'PAGA')
  const open    = mockInvoices.filter(i => i.status === 'ABERTA')

  const totalPaid = paid.reduce((s, i) => s + (i.paidValue ?? i.totalValue), 0)
  const totalOpen = open.reduce((s, i) => s + i.totalValue, 0)

  const cards = [
    { label: 'Total faturas',    value: String(mockInvoices.length),         color: '#6366f1', Icon: FileText },
    { label: 'Em aberto',        value: formatCurrency(totalOpen),            color: '#6366f1', Icon: CheckCircle2 },
    { label: 'Recebido',         value: formatCurrency(totalPaid),            color: '#22c55e', Icon: CheckCircle2 },
    { label: 'Vencidas',         value: String(overdue.length),               color: '#ef4444', Icon: AlertCircle },
    { label: 'Canceladas',       value: String(mockInvoices.filter(i=>i.status==='CANCELADA').length), color: '#6b7280', Icon: Ban },
  ]

  const filtered = useMemo(() => {
    let list = [...mockInvoices]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.number.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        i.serviceOrderNumber.toLowerCase().includes(q)
      )
    }
    if (statusFilter) list = list.filter(i => i.status === statusFilter)
    return list.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
  }, [search, statusFilter])

  const selected = selectedId ? mockInvoices.find(i => i.id === selectedId) ?? null : null

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden flex flex-col">
      <div
        className="flex-1 overflow-y-auto flex flex-col transition-all duration-200"
        style={{ paddingRight: selected ? 340 : 20 }}
      >
        <div className="px-5 pt-5">
          <PageHeader title="Faturamento" subtitle="Faturas e documentos fiscais" />

          {/* summary cards */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {cards.map(({ label, value, color, Icon }) => (
              <div key={label} className="relative rounded-lg border border-t-border bg-t-card overflow-hidden p-3">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-t-muted">{label}</p>
                  <Icon size={14} style={{ color }} />
                </div>
                <p className="text-lg font-bold text-t-text">{value}</p>
              </div>
            ))}
          </div>

          {/* filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-muted" />
              <input
                type="text"
                placeholder="Buscar por nº, cliente ou OS..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-t-surface border border-t-border rounded text-t-text placeholder:text-t-muted focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value as InvoiceStatus | '')}
              className="text-sm bg-t-surface border border-t-border rounded px-2.5 py-1.5 text-t-text focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              {Object.entries(INV_STATUS_STYLE).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* table */}
        <div className="px-5 pb-5">
          <div className="rounded-lg border border-t-border overflow-hidden bg-t-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-t-border bg-t-surface">
                  {['Fatura', 'OS', 'Cliente', 'Veículo', 'Emissão', 'Vencimento', 'Total', 'Fiscal', 'Status', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-t-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => {
                  const s   = INV_STATUS_STYLE[inv.status]
                  const fs  = FISCAL_STYLE[inv.fiscalStatus]
                  const isOverdue = inv.status === 'ABERTA' && inv.dueDate && inv.dueDate < TODAY
                  const isSel = selectedId === inv.id
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelected(isSel ? null : inv.id)}
                      className={cn(
                        'border-b border-t-border last:border-0 cursor-pointer transition-colors',
                        isSel ? 'bg-blue-500/5' : i % 2 === 0 ? 'bg-t-card hover:bg-t-card-hover' : 'bg-t-surface hover:bg-t-card-hover'
                      )}
                    >
                      <td className="px-3 py-2.5 text-xs font-mono text-t-secondary">{inv.number}</td>
                      <td className="px-3 py-2.5 text-xs font-mono text-t-muted">{inv.serviceOrderNumber}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-t-text">{inv.customerName}</td>
                      <td className="px-3 py-2.5 text-xs text-t-secondary">{inv.plate}</td>
                      <td className="px-3 py-2.5 text-xs text-t-secondary">{formatDate(inv.issuedAt)}</td>
                      <td className={cn('px-3 py-2.5 text-xs', isOverdue ? 'text-red-500 font-medium' : 'text-t-secondary')}>
                        {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                        {isOverdue && ' ⚠'}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-t-text">{formatCurrency(inv.totalValue)}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${fs.color}15`, color: fs.color }}>
                          {fs.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <ChevronRight size={14} className={cn('text-t-muted transition-transform', isSel && 'rotate-180')} />
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-sm text-t-muted">
                      Nenhuma fatura encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <InvoiceDrawer inv={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
