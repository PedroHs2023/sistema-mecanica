import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, X, Package, CheckCircle2, Clock, FileText, AlertCircle, Search, FileCode } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { PageHeader } from '../../components/layout/PageHeader'
import { mockPurchases } from '../../mocks/purchases'
import type { Purchase, PurchaseStatus } from '../../types'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<PurchaseStatus, { label: string; color: string }> = {
  RASCUNHO:               { label: 'Rascunho',         color: '#6b7280' },
  AGUARDANDO_RECEBIMENTO: { label: 'Aguard. Recebimento', color: '#f59e0b' },
  RECEBIDA:               { label: 'Recebida',          color: '#22c55e' },
  CANCELADA:              { label: 'Cancelada',         color: '#ef4444' },
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function PurchaseDrawer({ purchase, onClose }: { purchase: Purchase; onClose: () => void }) {
  const s = STATUS_STYLE[purchase.status]
  return (
    <div className="fixed right-0 top-[44px] bottom-0 w-[320px] z-[15] bg-t-card border-l border-t-border flex flex-col transition-transform duration-200 translate-x-0">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-t-border">
        <div>
          <p className="text-xs text-t-muted">{purchase.number}</p>
          <p className="text-sm font-semibold text-t-text">{purchase.supplierName}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-t-surface text-t-muted">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* status + meta */}
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${s.color}15`, color: s.color }}
          >
            {s.label}
          </span>
          {purchase.xmlAttached && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
              XML Anexado
            </span>
          )}
        </div>

        {/* info */}
        <div className="rounded-lg border border-t-border bg-t-surface p-3 space-y-2">
          <Row label="Data do pedido" value={formatDate(purchase.date)} />
          <Row label="Recebida em"    value={purchase.receivedAt ? formatDate(purchase.receivedAt) : '—'} />
          <Row label="Responsável"    value={purchase.responsibleUser} />
          <Row label="Total de itens" value={String(purchase.totalItems)} />
          <Row label="Valor total"    value={formatCurrency(purchase.totalValue)} bold />
        </div>

        {/* items */}
        <div>
          <p className="text-xs font-semibold text-t-muted uppercase tracking-wide mb-2">Itens</p>
          <div className="space-y-1.5">
            {purchase.items.map(item => (
              <div key={item.id} className="rounded border border-t-border bg-t-surface p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-t-text truncate">{item.description}</p>
                    <p className="text-xs text-t-muted">{item.internalCode}</p>
                  </div>
                  {item.isNew && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 shrink-0">
                      Novo
                    </span>
                  )}
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-t-secondary">
                  <span>{item.quantity}x {formatCurrency(item.unitCost)}</span>
                  <span className="font-medium text-t-text">{formatCurrency(item.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* notes */}
        {purchase.notes && (
          <div>
            <p className="text-xs font-semibold text-t-muted uppercase tracking-wide mb-1">Observações</p>
            <p className="text-xs text-t-secondary leading-relaxed bg-t-surface rounded p-2 border border-t-border">
              {purchase.notes}
            </p>
          </div>
        )}
      </div>

      {/* footer total */}
      <div className="border-t border-t-border px-4 py-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-t-muted">Total da compra</span>
          <span className="text-base font-bold text-t-text">{formatCurrency(purchase.totalValue)}</span>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-t-muted">{label}</span>
      <span className={cn('text-t-text', bold && 'font-semibold')}>{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PurchasesPage() {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState<PurchaseStatus | ''>('')
  const [selectedId, setSelected] = useState<string | null>(null)

  const thisMonth = '2026-06'

  const monthPurchases = mockPurchases.filter(p => p.date.startsWith(thisMonth) || p.createdAt.startsWith(thisMonth))
  const totalMonth     = monthPurchases.reduce((s, p) => s + p.totalValue, 0)
  const waiting        = mockPurchases.filter(p => p.status === 'AGUARDANDO_RECEBIMENTO').length
  const received       = mockPurchases.filter(p => p.status === 'RECEBIDA').length
  const activeSupplierIds = new Set(mockPurchases.filter(p => p.status !== 'CANCELADA').map(p => p.supplierId))

  const filtered = useMemo(() => {
    let list = [...mockPurchases]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.number.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q)
      )
    }
    if (statusFilter) list = list.filter(p => p.status === statusFilter)
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [search, statusFilter])

  const navigate = useNavigate()
  const selected = selectedId ? mockPurchases.find(p => p.id === selectedId) ?? null : null

  const cards = [
    { label: 'Compras no mês',     value: String(monthPurchases.length), color: '#6366f1', icon: FileText },
    { label: 'Valor comprado',      value: formatCurrency(totalMonth),    color: '#22c55e', icon: Package },
    { label: 'Aguardando receb.',   value: String(waiting),               color: '#f59e0b', icon: Clock },
    { label: 'Recebidas',           value: String(received),              color: '#3b82f6', icon: CheckCircle2 },
    { label: 'Fornecedores ativos', value: String(activeSupplierIds.size),color: '#a855f7', icon: AlertCircle },
  ]

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden flex flex-col">
      {/* header area */}
      <div
        className="flex-1 overflow-y-auto flex flex-col transition-all duration-200"
        style={{ paddingRight: selected ? 340 : 20 }}
      >
        <div className="px-5 pt-5">
          <PageHeader
            title="Compras"
            subtitle="Pedidos e recebimento de mercadorias"
            actions={
              <button
                onClick={() => navigate('/estoque/importar?open=xml')}
                className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-t-border bg-t-card text-[11px] font-medium text-t-secondary hover:text-t-text transition-colors"
              >
                <FileCode size={11} />
                Importar XML da Nota
              </button>
            }
          />

          {/* summary cards */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {cards.map(card => {
              const Icon = card.icon
              return (
                <div key={card.label} className="relative rounded-lg border border-t-border bg-t-card overflow-hidden p-3">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: card.color }} />
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-t-muted">{card.label}</p>
                    <Icon size={14} style={{ color: card.color }} />
                  </div>
                  <p className="text-xl font-bold text-t-text">{card.value}</p>
                </div>
              )
            })}
          </div>

          {/* filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-muted" />
              <input
                type="text"
                placeholder="Buscar por número ou fornecedor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-t-surface border border-t-border rounded text-t-text placeholder:text-t-muted focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value as PurchaseStatus | '')}
              className="text-sm bg-t-surface border border-t-border rounded px-2.5 py-1.5 text-t-text focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_STYLE).map(([k, v]) => (
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
                  {['Número', 'Fornecedor', 'Data', 'Itens', 'Valor', 'XML', 'Status', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-t-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const s = STATUS_STYLE[p.status]
                  const isSelected = selectedId === p.id
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(isSelected ? null : p.id)}
                      className={cn(
                        'border-b border-t-border last:border-0 cursor-pointer transition-colors',
                        isSelected ? 'bg-blue-500/5' : i % 2 === 0 ? 'bg-t-card hover:bg-t-card-hover' : 'bg-t-surface hover:bg-t-card-hover'
                      )}
                    >
                      <td className="px-3 py-2.5 text-xs font-mono text-t-secondary">{p.number}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-t-text">{p.supplierName}</td>
                      <td className="px-3 py-2.5 text-xs text-t-secondary">{formatDate(p.date)}</td>
                      <td className="px-3 py-2.5 text-xs text-t-secondary">{p.totalItems}</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-t-text">{formatCurrency(p.totalValue)}</td>
                      <td className="px-3 py-2.5">
                        {p.xmlAttached
                          ? <span className="text-xs text-blue-500">Sim</span>
                          : <span className="text-xs text-t-muted">Não</span>
                        }
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${s.color}15`, color: s.color }}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <ChevronRight size={14} className={cn('text-t-muted transition-transform', isSelected && 'rotate-180')} />
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-t-muted">
                      Nenhuma compra encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* drawer */}
      {selected && (
        <PurchaseDrawer purchase={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
