import { X, Package, MapPin, Barcode, Tag, TrendingUp, Building2, Truck, Clock } from 'lucide-react'
import { mockSuppliers } from '../../mocks/suppliers'
import { mockStockMovements } from '../../mocks/stock-movements'
import { formatCurrency, formatDate } from '../../lib/utils'
import type { Part, PartStatus, StockMovementType } from '../../types'

// ── Constants ─────────────────────────────────────────────────────────────────

export const PART_STATUS_STYLE: Record<PartStatus, { bg: string; text: string; label: string }> = {
  NORMAL:      { bg: 'rgba(22,163,74,0.10)',  text: '#16A34A', label: 'Normal' },
  BAIXO:       { bg: 'rgba(180,83,9,0.10)',   text: '#B45309', label: 'Estoque Baixo' },
  SEM_ESTOQUE: { bg: 'rgba(239,68,68,0.10)',  text: '#EF4444', label: 'Sem Estoque' },
  INATIVO:     { bg: 'rgba(82,82,91,0.10)',   text: '#52525B', label: 'Inativo' },
}

const MOVEMENT_STYLE: Record<StockMovementType, { label: string; color: string; sign: '+' | '−' }> = {
  ENTRADA_COMPRA:       { label: 'Entrada Compra',   color: '#16A34A', sign: '+' },
  SAIDA_OS:             { label: 'Saída OS',          color: '#B45309', sign: '−' },
  ESTORNO_OS:           { label: 'Estorno OS',        color: '#2563EB', sign: '+' },
  AJUSTE_POSITIVO:      { label: 'Ajuste +',          color: '#16A34A', sign: '+' },
  AJUSTE_NEGATIVO:      { label: 'Ajuste −',          color: '#EF4444', sign: '−' },
  DEVOLUCAO_FORNECEDOR: { label: 'Dev. Fornecedor',   color: '#7C3AED', sign: '−' },
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PartDrawerProps {
  part: Part | null
  onClose: () => void
}

export function PartDrawer({ part, onClose }: PartDrawerProps) {
  const supplier = part?.supplierId
    ? mockSuppliers.find((s) => s.id === part.supplierId)
    : null

  const movements = part
    ? mockStockMovements
        .filter((m) => m.partId === part.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6)
    : []

  const stockPct = part
    ? Math.min((part.currentStock / Math.max(part.minimumStock * 2, 1)) * 100, 100)
    : 0
  const barColor = !part
    ? '#16A34A'
    : part.currentStock === 0
    ? '#EF4444'
    : part.currentStock <= part.minimumStock
    ? '#B45309'
    : '#16A34A'

  const margin = part && part.averageCost > 0
    ? ((part.salePrice - part.averageCost) / part.averageCost) * 100
    : 0

  const status = part ? PART_STATUS_STYLE[part.status] : null

  return (
    <div
      className={`fixed right-0 top-[44px] bottom-0 w-[320px] z-[15] bg-t-card border-l border-t-border flex flex-col transition-transform duration-200 ease-out ${
        part ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {part && (
        <>
          {/* Header */}
          <div className="flex-shrink-0 border-b border-t-border px-4 py-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-[10px] text-t-muted bg-t-surface border border-t-border rounded px-1.5 py-[2px]">
                    {part.internalCode}
                  </span>
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
                <p className="text-[13px] font-semibold text-t-text leading-snug">{part.description}</p>
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
            <Section label="Identificação">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <InfoRow icon={<Tag size={10} />} label="Categoria" value={part.category} />
                <InfoRow icon={<Package size={10} />} label="Unidade" value={part.unit} />
                {part.location && (
                  <InfoRow icon={<MapPin size={10} />} label="Localização" value={part.location} />
                )}
                {part.manufacturerCode && (
                  <InfoRow label="Cód. Fabricante" value={part.manufacturerCode} mono />
                )}
                {part.barcode && (
                  <InfoRow icon={<Barcode size={10} />} label="Cód. Barras" value={part.barcode} mono />
                )}
                {part.ncm && (
                  <InfoRow label="NCM" value={part.ncm} mono />
                )}
              </div>
            </Section>

            <Divider />

            {/* Stock */}
            <Section label="Estoque">
              <div className="flex items-center justify-between text-[10px] text-t-muted mb-1.5">
                <span>
                  Atual:{' '}
                  <span className="font-semibold text-t-text">
                    {part.currentStock} {part.unit}
                  </span>
                </span>
                <span>
                  Mín:{' '}
                  <span className="font-semibold text-t-text">
                    {part.minimumStock} {part.unit}
                  </span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-t-surface border border-t-border overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${stockPct}%`, backgroundColor: barColor }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-t-muted">{stockPct.toFixed(0)}% do alvo</span>
                <span className="font-medium" style={{ color: barColor }}>
                  {part.currentStock > part.minimumStock
                    ? `+${part.currentStock - part.minimumStock} acima do mín`
                    : part.currentStock === 0
                    ? 'Sem estoque'
                    : `${part.currentStock - part.minimumStock} abaixo do mín`}
                </span>
              </div>
              {part.lastMovementDate && (
                <p className="text-[10px] text-t-muted mt-2 flex items-center gap-1">
                  <Clock size={9} />
                  Última mov.: {formatDate(part.lastMovementDate)}
                </p>
              )}
            </Section>

            <Divider />

            {/* Values */}
            <Section label="Valores">
              <div className="space-y-1.5">
                <ValueRow label="Custo médio" value={formatCurrency(part.averageCost)} />
                <ValueRow label="Preço de venda" value={formatCurrency(part.salePrice)} highlight />
                <ValueRow
                  label="Margem estimada"
                  value={`${margin.toFixed(1)}%`}
                  valueColor={margin >= 30 ? '#16A34A' : margin >= 15 ? '#B45309' : '#EF4444'}
                  icon={<TrendingUp size={10} />}
                />
                <ValueRow
                  label="Valor em estoque"
                  value={formatCurrency(part.currentStock * part.averageCost)}
                />
              </div>
            </Section>

            {/* Supplier */}
            {supplier && (
              <>
                <Divider />
                <Section label="Fornecedor">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 flex-shrink-0 rounded-md bg-t-surface border border-t-border flex items-center justify-center">
                      <Truck size={12} className="text-t-muted" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-t-text leading-tight">
                        {supplier.tradeName ?? supplier.corporateName}
                      </p>
                      <p className="text-[10px] text-t-muted mt-0.5 truncate">
                        {supplier.corporateName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {supplier.phone && (
                          <span className="text-[10px] text-t-secondary">{supplier.phone}</span>
                        )}
                        {supplier.deliveryDays && (
                          <span className="text-[10px] text-t-muted">
                            · {supplier.deliveryDays}d entrega
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Section>
              </>
            )}

            {/* Movements */}
            {movements.length > 0 && (
              <>
                <Divider />
                <Section label="Últimas Movimentações">
                  <div className="space-y-2.5">
                    {movements.map((m) => {
                      const ms = MOVEMENT_STYLE[m.type]
                      return (
                        <div key={m.id} className="flex items-start gap-2">
                          <span
                            className="flex-shrink-0 w-9 h-5 flex items-center justify-center rounded text-[10px] font-bold"
                            style={{
                              backgroundColor: `${ms.color}14`,
                              color: ms.color,
                            }}
                          >
                            {ms.sign}{m.quantity}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-t-text leading-tight">
                              {ms.label}
                            </p>
                            {m.relatedServiceOrderNumber && (
                              <p className="text-[10px] text-t-muted">
                                OS {m.relatedServiceOrderNumber}
                              </p>
                            )}
                            {m.supplierName && !m.relatedServiceOrderNumber && (
                              <p className="text-[10px] text-t-muted">{m.supplierName}</p>
                            )}
                            {m.reason && (
                              <p className="text-[10px] text-t-muted italic truncate">{m.reason}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-t-muted whitespace-nowrap flex-shrink-0">
                            {formatDate(m.createdAt.substring(0, 10))}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Section>
              </>
            )}

            {/* Metadata */}
            <div className="px-4 py-3 border-t border-t-border">
              <p className="text-[10px] text-t-muted">
                Cadastrado em {formatDate(part.createdAt)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[9px] font-bold text-t-muted uppercase tracking-[0.08em] mb-2.5">
        {label}
      </p>
      {children}
    </div>
  )
}

function Divider() {
  return <div className="border-t border-t-border mx-4" />
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-t-muted mb-0.5">
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <span className={`text-[11px] font-medium text-t-text ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function ValueRow({
  label,
  value,
  highlight = false,
  valueColor,
  icon,
}: {
  label: string
  value: string
  highlight?: boolean
  valueColor?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 text-[11px] text-t-secondary">
        {icon}
        {label}
      </div>
      <span
        className={`text-[11px] font-semibold font-mono ${highlight ? 'text-t-text' : 'text-t-secondary'}`}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
    </div>
  )
}
