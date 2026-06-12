import { useState, useMemo } from 'react'
import { Plus, Search, X, ChevronRight, Gauge, Wrench, User, Calendar, ClipboardList } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { mockVehicles } from '../../mocks/vehicles'
import { mockServiceOrders } from '../../mocks/service-orders'
import { TYPE_LABELS, TYPE_COLORS, STATUS_LABELS, formatDate, cn } from '../../lib/utils'
import type { FuelType, VehicleStatus, Vehicle } from '../../types'

// ── Constants ─────────────────────────────────────────────────────────────────

const FUEL_LABELS: Record<FuelType, string> = {
  GASOLINA: 'Gasolina', ETANOL: 'Etanol', FLEX: 'Flex',
  DIESEL: 'Diesel', ELETRICO: 'Elétrico', HIBRIDO: 'Híbrido',
}
const FUEL_COLORS: Record<FuelType, { bg: string; text: string }> = {
  GASOLINA: { bg: 'rgba(249,115,22,0.10)',  text: '#C2410C' },
  ETANOL:   { bg: 'rgba(22,163,74,0.10)',   text: '#16A34A' },
  FLEX:     { bg: 'rgba(37,99,235,0.10)',   text: '#2563EB' },
  DIESEL:   { bg: 'rgba(124,58,237,0.10)',  text: '#7C3AED' },
  ELETRICO: { bg: 'rgba(8,145,178,0.10)',   text: '#0E7490' },
  HIBRIDO:  { bg: 'rgba(180,83,9,0.10)',    text: '#B45309' },
}
const VEHICLE_STATUS: Record<VehicleStatus, { bg: string; text: string; label: string }> = {
  ATIVO:         { bg: 'rgba(22,163,74,0.10)',  text: '#16A34A', label: 'Ativo' },
  EM_MANUTENCAO: { bg: 'rgba(180,83,9,0.10)',   text: '#B45309', label: 'Em Manutenção' },
  SEM_OS:        { bg: 'rgba(82,82,91,0.10)',   text: '#52525B', label: 'Sem OS' },
}
const STATUS_HEX: Record<string, string> = {
  AGENDADO: '#2563EB', EM_ANALISE: '#B45309', AGUARDANDO_APROVACAO: '#F97316',
  EM_ANDAMENTO: '#7C3AED', CONCLUIDO: '#16A34A', ENTREGUE: '#6B7280', CANCELADO: '#EF4444',
}

const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)

// ── Page ──────────────────────────────────────────────────────────────────────

interface Filters {
  search: string
  brand: string
  fuel: FuelType | ''
  status: VehicleStatus | ''
}

export function VehiclesPage() {
  const [filters, setFilters] = useState<Filters>({ search: '', brand: '', fuel: '', status: '' })
  const [previewId, setPreviewId] = useState<string | null>(null)

  const selectedVehicle = useMemo(
    () => mockVehicles.find((v) => v.id === previewId) ?? null,
    [previewId],
  )

  const filtered = useMemo(() => mockVehicles.filter((v) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !v.plate.toLowerCase().includes(q) &&
        !v.model.toLowerCase().includes(q) &&
        !v.brand.toLowerCase().includes(q) &&
        !v.customerName.toLowerCase().includes(q)
      ) return false
    }
    if (filters.brand  && v.brand  !== filters.brand)  return false
    if (filters.fuel   && v.fuel   !== filters.fuel)   return false
    if (filters.status && v.status !== filters.status) return false
    return true
  }), [filters])

  // ── Summary ────────────────────────────────────────────────────────────────
  const total         = mockVehicles.length
  const comOS         = mockVehicles.filter((v) => v.openServiceOrders > 0).length
  const thisMonth     = new Set(
    mockServiceOrders
      .filter((o) => o.entryDate.startsWith('2026-06'))
      .map((o) => o.vehicleId),
  ).size
  const garantia      = mockServiceOrders.filter(
    (o) => ['GARANTIA', 'RETORNO'].includes(o.type) && !['ENTREGUE', 'CANCELADO'].includes(o.status),
  ).length
  const revisaoProxima = mockVehicles.filter(
    (v) => v.nextRevisionKm && v.currentKm && (v.nextRevisionKm - v.currentKm) <= 5000,
  ).length

  const brands  = [...new Set(mockVehicles.map((v) => v.brand))].sort()
  const hasFilters = [filters.brand, filters.fuel, filters.status].some(Boolean)

  return (
    <div className="flex flex-col h-[calc(100vh-44px)] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-t-border bg-t-topbar">

        <PageHeader
          title="Veículos"
          subtitle="Consulte veículos cadastrados, histórico de manutenção e dados técnicos."
          className="mb-4"
          actions={
            <button className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-[11px] font-semibold transition-colors shadow-sm">
              <Plus size={12} strokeWidth={2.5} />
              Novo Veículo
            </button>
          }
        />

        {/* Summary chips */}
        <div className="grid grid-cols-5 gap-2.5 mb-4">
          {[
            { label: 'Total',           value: total,        color: '#2563EB' },
            { label: 'Em Manutenção',   value: comOS,        color: '#B45309' },
            { label: 'Atend. no Mês',   value: thisMonth,    color: '#7C3AED' },
            { label: 'Ret. Garantia',   value: garantia,     color: '#F97316' },
            { label: 'Revisão Próxima', value: revisaoProxima, color: '#16A34A' },
          ].map((s) => (
            <div
              key={s.label}
              className="relative rounded-lg border border-t-border bg-t-card overflow-hidden px-3 py-2.5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: s.color }} />
              <p className="text-[10px] font-semibold text-t-muted uppercase tracking-[0.06em] mb-1 mt-0.5">{s.label}</p>
              <p className="text-[20px] font-bold text-t-text leading-none tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex items-center">
            <Search size={12} className="absolute left-2.5 text-t-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Placa, modelo, marca ou cliente..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="h-7 w-64 bg-t-surface border border-t-border rounded-md text-[11px] text-t-text placeholder:text-t-muted pl-7 pr-3 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-colors"
            />
          </div>

          <FSelect
            value={filters.brand}
            onChange={(v) => setFilters((f) => ({ ...f, brand: v }))}
            placeholder="Marca"
            options={brands.map((b) => ({ value: b, label: b }))}
          />
          <FSelect
            value={filters.fuel}
            onChange={(v) => setFilters((f) => ({ ...f, fuel: v as FuelType | '' }))}
            placeholder="Combustível"
            options={(Object.keys(FUEL_LABELS) as FuelType[]).map((f) => ({ value: f, label: FUEL_LABELS[f] }))}
          />
          <FSelect
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v as VehicleStatus | '' }))}
            placeholder="Status"
            options={[
              { value: 'ATIVO',         label: 'Ativo' },
              { value: 'EM_MANUTENCAO', label: 'Em Manutenção' },
              { value: 'SEM_OS',        label: 'Sem OS' },
            ]}
          />

          {hasFilters && (
            <button
              onClick={() => setFilters({ search: '', brand: '', fuel: '', status: '' })}
              className="flex items-center gap-1 text-[11px] text-t-muted hover:text-danger transition-colors"
            >
              <X size={11} /> Limpar
            </button>
          )}

          <span className="ml-auto text-[11px] text-t-muted">
            {filtered.length} veículo{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── List ────────────────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 bg-t-bg transition-all duration-200"
        style={{ paddingRight: selectedVehicle ? 340 : 20 }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={16} />}
            title="Nenhum veículo encontrado"
            description="Tente ajustar os filtros ou cadastre um novo veículo."
          />
        ) : (
          <div
            className="rounded-lg border border-t-border bg-t-card overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-t-border bg-t-surface">
                  {['Placa', 'Veículo', 'Cliente', 'KM Atual', 'Último Atend.', 'Combustível', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-t-muted uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-t-border">
                {filtered.map((v) => {
                  const fuel = FUEL_COLORS[v.fuel]
                  const stat = VEHICLE_STATUS[v.status]
                  const isSelected = previewId === v.id
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setPreviewId(isSelected ? null : v.id)}
                      className={cn(
                        'transition-colors cursor-pointer',
                        isSelected ? 'bg-orange-50/50 dark:bg-accent/[0.04]' : 'hover:bg-t-card-hover',
                      )}
                    >
                      {/* Placa */}
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-[11px] font-bold tracking-[0.10em] bg-gray-900 dark:bg-white/[0.12] text-white dark:text-t-text rounded-[4px] px-2.5 py-[5px]">
                          {v.plate}
                        </span>
                      </td>

                      {/* Veículo */}
                      <td className="px-4 py-2.5">
                        <p className="text-[12px] font-semibold text-t-text leading-tight">
                          {v.brand} {v.model}
                        </p>
                        <p className="text-[10px] text-t-muted">
                          {v.year}{v.color ? ` · ${v.color}` : ''}
                        </p>
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-2.5">
                        <p className="text-[12px] text-t-secondary truncate max-w-[160px]">{v.customerName}</p>
                      </td>

                      {/* KM */}
                      <td className="px-4 py-2.5">
                        {v.currentKm ? (
                          <span className="text-[12px] font-medium text-t-text font-mono">
                            {fmt(v.currentKm)} km
                          </span>
                        ) : <span className="text-t-muted">—</span>}
                      </td>

                      {/* Último atendimento */}
                      <td className="px-4 py-2.5">
                        {v.lastServiceDate ? (
                          <span className="text-[11px] text-t-secondary">{formatDate(v.lastServiceDate)}</span>
                        ) : (
                          <span className="text-[11px] text-t-muted italic">Nunca</span>
                        )}
                      </td>

                      {/* Combustível */}
                      <td className="px-4 py-2.5">
                        <span
                          className="text-[9px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
                          style={{ backgroundColor: fuel.bg, color: fuel.text }}
                        >
                          {FUEL_LABELS[v.fuel]}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
                          style={{ backgroundColor: stat.bg, color: stat.text }}
                        >
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {stat.label}
                        </span>
                      </td>

                      {/* Preview trigger */}
                      <td className="px-3 py-2.5">
                        <ChevronRight
                          size={14}
                          className={cn(
                            'transition-colors',
                            isSelected ? 'text-accent' : 'text-t-muted',
                          )}
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

      {/* ── Preview drawer ──────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed right-0 top-[44px] bottom-0 w-[320px] z-[15]',
          'bg-t-card border-l border-t-border overflow-y-auto',
          'transition-transform duration-200',
          selectedVehicle ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.07)' }}
      >
        {selectedVehicle && (
          <VehiclePreview
            vehicle={selectedVehicle}
            onClose={() => setPreviewId(null)}
            statusHex={STATUS_HEX}
          />
        )}
      </aside>
    </div>
  )
}

// ── VehiclePreview ────────────────────────────────────────────────────────────

function VehiclePreview({
  vehicle, onClose, statusHex,
}: {
  vehicle: Vehicle
  onClose: () => void
  statusHex: Record<string, string>
}) {
  const stat = VEHICLE_STATUS[vehicle.status]
  const fuel = FUEL_COLORS[vehicle.fuel]

  const vehicleOrders = useMemo(() =>
    mockServiceOrders
      .filter((o) => o.vehicleId === vehicle.id || o.plate === vehicle.plate)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
      .slice(0, 4),
    [vehicle],
  )

  const kmRemaining = vehicle.nextRevisionKm && vehicle.currentKm
    ? vehicle.nextRevisionKm - vehicle.currentKm
    : null
  const kmProgress = vehicle.nextRevisionKm && vehicle.currentKm
    ? Math.min(Math.round((vehicle.currentKm / vehicle.nextRevisionKm) * 100), 100)
    : null
  const barColor = kmProgress === null ? '#9CA3AF'
    : kmProgress >= 95 ? '#EF4444'
    : kmProgress >= 85 ? '#B45309'
    : '#16A34A'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-t-border bg-t-surface flex-shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[13px] font-bold tracking-[0.10em] bg-gray-900 dark:bg-white/[0.12] text-white dark:text-t-text rounded-[4px] px-2.5 py-[4px]">
              {vehicle.plate}
            </span>
            <span
              className="text-[9px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
              style={{ backgroundColor: stat.bg, color: stat.text }}
            >
              {stat.label}
            </span>
          </div>
          <p className="text-[13px] font-semibold text-t-text">{vehicle.brand} {vehicle.model}</p>
          <p className="text-[11px] text-t-muted">{vehicle.year}{vehicle.color ? ` · ${vehicle.color}` : ''}</p>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded flex items-center justify-center text-t-muted hover:text-t-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex-shrink-0"
        >
          <X size={13} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">

        {/* Fuel + engine */}
        <div className="px-4 py-3 border-b border-t-border flex items-center gap-2 flex-wrap">
          <span
            className="text-[9px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
            style={{ backgroundColor: fuel.bg, color: fuel.text }}
          >
            {FUEL_LABELS[vehicle.fuel]}
          </span>
          {vehicle.engine && (
            <span className="text-[10px] text-t-muted">{vehicle.engine}</span>
          )}
        </div>

        {/* Cliente */}
        <PreviewSection icon={<User size={11} />} label="Cliente">
          <p className="text-[12px] font-medium text-t-text">{vehicle.customerName}</p>
        </PreviewSection>

        {/* KM + Manutenção */}
        <PreviewSection icon={<Gauge size={11} />} label="Quilometragem">
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-bold text-t-text tracking-tight font-mono">
              {vehicle.currentKm ? fmt(vehicle.currentKm) : '—'}
            </span>
            {vehicle.currentKm && <span className="text-[11px] text-t-muted">km</span>}
          </div>
        </PreviewSection>

        <PreviewSection icon={<Wrench size={11} />} label="Última manutenção">
          <p className="text-[12px] font-medium text-t-text">
            {vehicle.lastServiceDate ? formatDate(vehicle.lastServiceDate) : (
              <span className="text-t-muted italic">Nenhuma registrada</span>
            )}
          </p>
        </PreviewSection>

        {/* OS abertas */}
        {vehicle.openServiceOrders > 0 && (
          <PreviewSection icon={<ClipboardList size={11} />} label="OS em aberto">
            <span
              className="inline-flex items-center justify-center text-[11px] font-bold rounded-full min-w-[22px] h-[22px] px-1.5"
              style={{ backgroundColor: 'rgba(180,83,9,0.12)', color: '#B45309' }}
            >
              {vehicle.openServiceOrders}
            </span>
          </PreviewSection>
        )}

        {/* Próxima revisão */}
        {vehicle.nextRevisionKm && vehicle.currentKm && (
          <PreviewSection icon={<Calendar size={11} />} label="Próxima revisão">
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-mono text-t-text font-medium">
                  {fmt(vehicle.currentKm)} / {fmt(vehicle.nextRevisionKm)} km
                </span>
                {kmRemaining !== null && (
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: barColor }}
                  >
                    {kmRemaining > 0 ? `Faltam ${fmt(kmRemaining)} km` : `Vencida ${fmt(Math.abs(kmRemaining))} km`}
                  </span>
                )}
              </div>
              <div className="h-[6px] rounded-full bg-t-surface border border-t-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${kmProgress}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          </PreviewSection>
        )}

        {/* Histórico recente */}
        {vehicleOrders.length > 0 && (
          <div className="border-t border-t-border">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-t-surface border-b border-t-border">
              <ClipboardList size={11} className="text-t-muted" />
              <p className="text-[11px] font-semibold text-t-text">Histórico de OS</p>
              <span className="ml-auto text-[10px] text-t-muted">{vehicleOrders.length}</span>
            </div>
            <div className="divide-y divide-t-border">
              {vehicleOrders.map((o) => {
                const tc = TYPE_COLORS[o.type]
                const sc = statusHex[o.status]
                return (
                  <div key={o.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-t-card-hover transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-mono text-t-muted">#{o.number.slice(-6)}</span>
                        <span
                          className="text-[9px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none"
                          style={{ backgroundColor: tc.bg, color: tc.text }}
                        >
                          {TYPE_LABELS[o.type]}
                        </span>
                      </div>
                      <p className="text-[10px] text-t-muted">{formatDate(o.entryDate)}</p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none flex-shrink-0"
                      style={{ backgroundColor: `${sc}15`, color: sc }}
                    >
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Utility sub-components ────────────────────────────────────────────────────

function PreviewSection({ icon, label, children }: {
  icon: React.ReactNode; label: string; children: React.ReactNode
}) {
  return (
    <div className="px-4 py-3 border-b border-t-border">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-t-muted">{icon}</span>
        <p className="text-[10px] font-semibold text-t-muted uppercase tracking-[0.06em]">{label}</p>
      </div>
      {children}
    </div>
  )
}

function FSelect({ value, onChange, placeholder, options }: {
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
