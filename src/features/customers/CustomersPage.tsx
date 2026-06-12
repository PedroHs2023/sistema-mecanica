import { useState, useMemo } from 'react'
import { Plus, Search, Phone, Mail, MessageCircle, Car, X } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { mockCustomers } from '../../mocks/customers'
import { formatDate, cn } from '../../lib/utils'
import type { CustomerType, CustomerStatus } from '../../types'

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_STYLE: Record<CustomerType, { bg: string; text: string; label: string }> = {
  PF: { bg: 'rgba(37,99,235,0.10)',   text: '#2563EB', label: 'Pessoa Física' },
  PJ: { bg: 'rgba(124,58,237,0.10)',  text: '#7C3AED', label: 'Pessoa Jurídica' },
}
const STATUS_STYLE: Record<CustomerStatus, { bg: string; text: string; label: string }> = {
  ATIVO:   { bg: 'rgba(22,163,74,0.10)', text: '#16A34A', label: 'Ativo' },
  INATIVO: { bg: 'rgba(82,82,91,0.10)',  text: '#52525B', label: 'Inativo' },
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface Filters {
  search: string
  type: CustomerType | ''
  status: CustomerStatus | ''
}

export function CustomersPage() {
  const [filters, setFilters] = useState<Filters>({ search: '', type: '', status: '' })

  const filtered = useMemo(() => mockCustomers.filter((c) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.document.includes(q) &&
        !c.phone.includes(q) &&
        !(c.whatsapp ?? '').includes(q)
      ) return false
    }
    if (filters.type   && c.type   !== filters.type)   return false
    if (filters.status && c.status !== filters.status) return false
    return true
  }), [filters])

  // ── Summary stats ──────────────────────────────────────────────────────────
  const total   = mockCustomers.length
  const ativos  = mockCustomers.filter((c) => c.status === 'ATIVO').length
  const pf      = mockCustomers.filter((c) => c.type === 'PF').length
  const pj      = mockCustomers.filter((c) => c.type === 'PJ').length
  const comOS   = mockCustomers.filter((c) => c.openOrdersCount > 0).length

  const activeFilters = [filters.type, filters.status].filter(Boolean).length

  return (
    <div className="p-5 max-w-[1280px]">
      <PageHeader
        title="Clientes"
        subtitle="Gerencie os clientes da oficina e acompanhe seus veículos e históricos de atendimento."
        actions={
          <button className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-[11px] font-semibold transition-colors shadow-sm">
            <Plus size={12} strokeWidth={2.5} />
            Novo Cliente
          </button>
        }
      />

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total', value: total,  color: '#2563EB' },
          { label: 'Ativos', value: ativos, color: '#16A34A' },
          { label: 'Pessoa Física', value: pf, color: '#7C3AED' },
          { label: 'Empresas', value: pj, color: '#F97316' },
          { label: 'Com OS Aberta', value: comOS, color: '#B45309' },
        ].map((s) => (
          <div
            key={s.label}
            className="relative rounded-lg border border-t-border bg-t-card overflow-hidden p-3.5"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: s.color }} />
            <p className="text-[10px] font-semibold text-t-muted uppercase tracking-[0.06em] mb-1.5 mt-0.5">
              {s.label}
            </p>
            <p className="text-[22px] font-bold text-t-text leading-none tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="relative flex items-center">
          <Search size={12} className="absolute left-2.5 text-t-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Nome, CPF/CNPJ ou telefone..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="h-7 w-60 bg-t-surface border border-t-border rounded-md text-[11px] text-t-text placeholder:text-t-muted pl-7 pr-3 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40 transition-colors"
          />
        </div>

        <FilterSelect
          value={filters.type}
          onChange={(v) => setFilters((f) => ({ ...f, type: v as CustomerType | '' }))}
          placeholder="Tipo"
          options={[
            { value: 'PF', label: 'Pessoa Física' },
            { value: 'PJ', label: 'Pessoa Jurídica' },
          ]}
        />
        <FilterSelect
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v as CustomerStatus | '' }))}
          placeholder="Status"
          options={[
            { value: 'ATIVO',   label: 'Ativos' },
            { value: 'INATIVO', label: 'Inativos' },
          ]}
        />

        {activeFilters > 0 && (
          <button
            onClick={() => setFilters({ search: '', type: '', status: '' })}
            className="flex items-center gap-1 text-[11px] text-t-muted hover:text-danger transition-colors"
          >
            <X size={11} /> Limpar
          </button>
        )}

        <span className="ml-auto text-[11px] text-t-muted">
          {filtered.length} cliente{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={16} />}
          title="Nenhum cliente encontrado"
          description="Tente ajustar os filtros ou cadastre um novo cliente."
        />
      ) : (
        <div
          className="rounded-lg border border-t-border bg-t-card overflow-hidden"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-t-border bg-t-surface">
                {['Cliente', 'Documento', 'Contato', 'Veículos', 'Última OS', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-t-muted uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-t-border">
              {filtered.map((c) => {
                const ts = TYPE_STYLE[c.type]
                const ss = STATUS_STYLE[c.status]
                return (
                  <tr key={c.id} className="hover:bg-t-card-hover transition-colors cursor-pointer">
                    {/* Cliente */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <CustomerAvatar name={c.name} type={c.type} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-[12px] font-semibold text-t-text leading-tight truncate max-w-[180px]">
                              {c.name}
                            </p>
                            <span
                              className="text-[9px] font-semibold uppercase rounded-[3px] px-1.5 py-[2px] leading-none flex-shrink-0"
                              style={{ backgroundColor: ts.bg, color: ts.text }}
                            >
                              {c.type}
                            </span>
                          </div>
                          {c.city && (
                            <p className="text-[10px] text-t-muted leading-tight">
                              {c.city}, {c.state}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Documento */}
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[11px] text-t-secondary">{c.document}</span>
                    </td>

                    {/* Contato */}
                    <td className="px-4 py-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-t-secondary">
                          <Phone size={10} className="text-t-muted flex-shrink-0" />
                          {c.phone}
                          {c.whatsapp && (
                            <MessageCircle size={10} className="text-[#16A34A] ml-0.5" />
                          )}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-1 text-[11px] text-t-muted">
                            <Mail size={10} className="flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{c.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Veículos */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <Car size={12} className="text-t-muted" />
                        <span className={cn(
                          'font-semibold',
                          c.vehiclesCount > 0 ? 'text-t-text' : 'text-t-muted',
                        )}>
                          {c.vehiclesCount}
                        </span>
                      </div>
                    </td>

                    {/* Última OS */}
                    <td className="px-4 py-2.5">
                      {c.lastServiceDate ? (
                        <div>
                          <p className="text-[11px] font-medium text-t-text">
                            {formatDate(c.lastServiceDate)}
                          </p>
                          {c.openOrdersCount > 0 && (
                            <p className="text-[10px] text-[#B45309]">
                              {c.openOrdersCount} em aberto
                            </p>
                          )}
                        </div>
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterSelect({ value, onChange, placeholder, options }: {
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

const AVATAR_PALETTE: [string, string][] = [
  ['rgba(37,99,235,0.14)',  '#2563EB'],
  ['rgba(124,58,237,0.14)', '#7C3AED'],
  ['rgba(22,163,74,0.14)',  '#16A34A'],
  ['rgba(234,88,12,0.14)',  '#C2410C'],
  ['rgba(219,39,119,0.14)', '#BE185D'],
  ['rgba(8,145,178,0.14)',  '#0E7490'],
  ['rgba(180,83,9,0.14)',   '#B45309'],
]

function CustomerAvatar({ name, type }: { name: string; type: CustomerType }) {
  const initials = type === 'PJ'
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
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
