import { useState, useMemo } from 'react'
import { Plus, Search, X, Truck, Package, Phone, Mail, Clock, ChevronRight } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { mockSuppliers } from '../../mocks/suppliers'
import { mockParts } from '../../mocks/parts'
import { mockStockMovements } from '../../mocks/stock-movements'
import { formatDate, formatCurrency } from '../../lib/utils'
import type { Supplier, SupplierStatus } from '../../types'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<SupplierStatus, { bg: string; text: string; label: string }> = {
  ATIVO:   { bg: 'rgba(22,163,74,0.10)', text: '#16A34A', label: 'Ativo' },
  INATIVO: { bg: 'rgba(82,82,91,0.10)',  text: '#52525B', label: 'Inativo' },
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface Filters {
  search: string
  status: SupplierStatus | ''
}

export function SuppliersPage() {
  const [filters, setFilters] = useState<Filters>({ search: '', status: '' })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => mockSuppliers.filter((s) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !s.corporateName.toLowerCase().includes(q) &&
        !(s.tradeName ?? '').toLowerCase().includes(q) &&
        !s.document.includes(q) &&
        !(s.phone ?? '').includes(q)
      ) return false
    }
    if (filters.status && s.status !== filters.status) return false
    return true
  }), [filters])

  const selectedSupplier = selectedId ? mockSuppliers.find((s) => s.id === selectedId) ?? null : null

  // ── Summary stats ──────────────────────────────────────────────────────────
  const total       = mockSuppliers.length
  const ativos      = mockSuppliers.filter((s) => s.status === 'ATIVO').length
  const totalParts  = mockSuppliers.reduce((sum, s) => sum + s.partsCount, 0)
  const purchasesThisMonth = mockStockMovements.filter(
    (m) => m.type === 'ENTRADA_COMPRA' && m.createdAt.startsWith('2026-06')
  ).length

  const activeFilters = [filters.status].filter(Boolean).length

  return (
    <div className="flex flex-col h-[calc(100vh-44px)] overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-t-border bg-t-topbar">
        <PageHeader
          title="Fornecedores"
          subtitle="Gerencie fornecedores de peças e materiais da oficina."
          actions={
            <button className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-[11px] font-semibold transition-colors shadow-sm">
              <Plus size={12} strokeWidth={2.5} />
              Novo Fornecedor
            </button>
          }
        />

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2.5 mb-4 mt-4">
          {[
            { label: 'Total',             value: total,                color: '#2563EB' },
            { label: 'Ativos',            value: ativos,               color: '#16A34A' },
            { label: 'Peças Vinculadas',  value: totalParts,           color: '#7C3AED' },
            { label: 'Entradas no Mês',   value: purchasesThisMonth,   color: '#F97316' },
          ].map((s) => (
            <div
              key={s.label}
              className="relative rounded-lg border border-t-border bg-t-card overflow-hidden p-3"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: s.color }} />
              <p className="text-[10px] font-semibold text-t-muted uppercase tracking-[0.06em] mb-1 mt-0.5">
                {s.label}
              </p>
              <p className="text-[18px] font-bold text-t-text leading-none tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex items-center">
            <Search size={12} className="absolute left-2.5 text-t-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Razão social, nome fantasia ou CNPJ..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="h-7 w-72 bg-t-surface border border-t-border rounded-md text-[11px] text-t-text placeholder:text-t-muted pl-7 pr-3 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-colors"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as SupplierStatus | '' }))}
            className="h-7 bg-t-card border border-t-border rounded-md text-[11px] text-t-text pl-2.5 pr-6 focus:outline-none focus:ring-1 focus:ring-accent/40 appearance-none cursor-pointer"
          >
            <option value="">Status</option>
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
          </select>

          {(activeFilters > 0 || filters.search) && (
            <button
              onClick={() => setFilters({ search: '', status: '' })}
              className="flex items-center gap-1 text-[11px] text-t-muted hover:text-danger transition-colors"
            >
              <X size={11} /> Limpar
            </button>
          )}

          <span className="ml-auto text-[11px] text-t-muted">
            {filtered.length} fornecedor{filtered.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* ── Table + Drawer ────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 bg-t-bg"
        style={{ paddingRight: selectedId ? 340 : 20 }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Truck size={16} />}
            title="Nenhum fornecedor encontrado"
            description="Tente ajustar os filtros ou cadastre um novo fornecedor."
          />
        ) : (
          <div
            className="rounded-lg border border-t-border bg-t-card overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-t-border bg-t-surface">
                  {['Fornecedor', 'CNPJ', 'Contato', 'Peças', 'Prazo', 'Última Compra', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-[10px] font-semibold text-t-muted uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-t-border">
                {filtered.map((s) => {
                  const ss = STATUS_STYLE[s.status]
                  const isSelected = s.id === selectedId
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedId(isSelected ? null : s.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-t-surface' : 'hover:bg-t-card-hover'
                      }`}
                    >
                      {/* Fornecedor */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <SupplierAvatar name={s.corporateName} />
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-t-text leading-tight truncate max-w-[180px]">
                              {s.tradeName ?? s.corporateName}
                            </p>
                            {s.tradeName && (
                              <p className="text-[10px] text-t-muted leading-tight truncate max-w-[180px]">
                                {s.corporateName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CNPJ */}
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-[11px] text-t-secondary">{s.document}</span>
                      </td>

                      {/* Contato */}
                      <td className="px-4 py-2.5">
                        <div className="space-y-1">
                          {s.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-t-secondary">
                              <Phone size={10} className="text-t-muted flex-shrink-0" />
                              {s.phone}
                            </div>
                          )}
                          {s.email && (
                            <div className="flex items-center gap-1 text-[11px] text-t-muted">
                              <Mail size={10} className="flex-shrink-0" />
                              <span className="truncate max-w-[160px]">{s.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Peças */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Package size={11} className="text-t-muted" />
                          <span className={`text-[12px] font-semibold ${s.partsCount > 0 ? 'text-t-text' : 'text-t-muted'}`}>
                            {s.partsCount}
                          </span>
                        </div>
                      </td>

                      {/* Prazo */}
                      <td className="px-4 py-2.5">
                        {s.deliveryDays ? (
                          <div className="flex items-center gap-1">
                            <Clock size={10} className="text-t-muted" />
                            <span className="text-[11px] text-t-secondary">{s.deliveryDays}d</span>
                          </div>
                        ) : (
                          <span className="text-t-muted text-[11px]">—</span>
                        )}
                      </td>

                      {/* Última Compra */}
                      <td className="px-4 py-2.5">
                        {s.lastPurchaseDate ? (
                          <span className="text-[11px] text-t-text">{formatDate(s.lastPurchaseDate)}</span>
                        ) : (
                          <span className="text-t-muted text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
                          style={{ backgroundColor: ss.bg, color: ss.text }}
                        >
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {ss.label}
                        </span>
                      </td>

                      {/* Chevron */}
                      <td className="px-3 py-2.5 w-8">
                        <ChevronRight
                          size={13}
                          className={`text-t-muted transition-colors ${isSelected ? 'text-accent' : ''}`}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Drawer ────────────────────────────────────────────────────────── */}
      <SupplierDrawer supplier={selectedSupplier} onClose={() => setSelectedId(null)} />
    </div>
  )
}

// ── SupplierDrawer ─────────────────────────────────────────────────────────────

function SupplierDrawer({ supplier, onClose }: { supplier: Supplier | null; onClose: () => void }) {
  const linkedParts = supplier ? mockParts.filter((p) => p.supplierId === supplier.id) : []
  const purchases = supplier
    ? mockStockMovements
        .filter((m) => m.type === 'ENTRADA_COMPRA' && m.supplierName === supplier.tradeName)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5)
    : []

  const status = supplier ? STATUS_STYLE[supplier.status] : null

  return (
    <div
      className={`fixed right-0 top-[44px] bottom-0 w-[320px] z-[15] bg-t-card border-l border-t-border flex flex-col transition-transform duration-200 ease-out ${
        supplier ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {supplier && (
        <>
          {/* Header */}
          <div className="flex-shrink-0 border-b border-t-border px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  {status && (
                    <span
                      className="inline-flex items-center gap-1 text-[9px] font-bold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
                      style={{ backgroundColor: status.bg, color: status.text }}
                    >
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {status.label}
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-semibold text-t-text leading-snug">
                  {supplier.tradeName ?? supplier.corporateName}
                </p>
                {supplier.tradeName && (
                  <p className="text-[10px] text-t-muted mt-0.5 leading-tight">{supplier.corporateName}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-t-muted hover:text-t-text hover:bg-t-surface transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Info */}
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold text-t-muted uppercase tracking-[0.08em] mb-2.5">
                Dados Cadastrais
              </p>
              <div className="space-y-2">
                <DrawerRow label="CNPJ" value={supplier.document} mono />
                {supplier.phone && <DrawerRow label="Telefone" value={supplier.phone} />}
                {supplier.email && <DrawerRow label="E-mail" value={supplier.email} />}
                {supplier.deliveryDays && (
                  <DrawerRow label="Prazo de entrega" value={`${supplier.deliveryDays} dias`} />
                )}
                {supplier.lastPurchaseDate && (
                  <DrawerRow
                    label="Última compra"
                    value={formatDate(supplier.lastPurchaseDate)}
                  />
                )}
              </div>
            </div>

            <div className="border-t border-t-border mx-4" />

            {/* Linked parts */}
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold text-t-muted uppercase tracking-[0.08em] mb-2.5">
                Peças Vinculadas ({linkedParts.length})
              </p>
              {linkedParts.length === 0 ? (
                <p className="text-[11px] text-t-muted">Nenhuma peça vinculada.</p>
              ) : (
                <div className="space-y-1.5">
                  {linkedParts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-md bg-t-surface border border-t-border px-2.5 py-1.5"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-t-text leading-tight truncate">
                          {p.description}
                        </p>
                        <p className="text-[9px] text-t-muted font-mono">{p.internalCode}</p>
                      </div>
                      <span className="text-[10px] font-mono text-t-secondary flex-shrink-0">
                        {p.currentStock} {p.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent purchases */}
            {purchases.length > 0 && (
              <>
                <div className="border-t border-t-border mx-4" />
                <div className="px-4 py-3">
                  <p className="text-[9px] font-bold text-t-muted uppercase tracking-[0.08em] mb-2.5">
                    Últimas Entradas
                  </p>
                  <div className="space-y-2.5">
                    {purchases.map((m) => (
                      <div key={m.id} className="flex items-start gap-2">
                        <span
                          className="flex-shrink-0 w-9 h-5 flex items-center justify-center rounded text-[10px] font-bold"
                          style={{ backgroundColor: 'rgba(22,163,74,0.12)', color: '#16A34A' }}
                        >
                          +{m.quantity}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-t-text leading-tight truncate">
                            {m.partDescription}
                          </p>
                          {m.unitCost && (
                            <p className="text-[10px] text-t-muted">
                              {formatCurrency(m.unitCost)}/un
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-t-muted whitespace-nowrap flex-shrink-0">
                          {formatDate(m.createdAt.substring(0, 10))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DrawerRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[10px] text-t-muted flex-shrink-0">{label}</span>
      <span
        className={`text-[11px] font-medium text-t-text text-right ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

const AVATAR_PALETTE: [string, string][] = [
  ['rgba(37,99,235,0.14)',  '#2563EB'],
  ['rgba(124,58,237,0.14)', '#7C3AED'],
  ['rgba(22,163,74,0.14)',  '#16A34A'],
  ['rgba(234,88,12,0.14)',  '#C2410C'],
  ['rgba(8,145,178,0.14)',  '#0E7490'],
  ['rgba(180,83,9,0.14)',   '#B45309'],
]

function SupplierAvatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const [bg, color] = AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
      style={{ backgroundColor: bg, color }}
    >
      {initials}
    </div>
  )
}
