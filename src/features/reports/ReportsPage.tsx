import { cn, formatCurrency } from '../../lib/utils'
import { PageHeader } from '../../components/layout/PageHeader'
import { mockFinance } from '../../mocks/finance'
import { mockPurchases } from '../../mocks/purchases'
import { mockParts } from '../../mocks/parts'
import { mockSchedule } from '../../mocks/schedule'

// ─── Horizontal bar chart ─────────────────────────────────────────────────────

function HBar({
  label,
  value,
  max,
  color,
  format = (v: number) => String(v),
}: {
  label: string
  value: number
  max: number
  color: string
  format?: (v: number) => string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-t-secondary w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-t-surface rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium text-t-text w-20 text-right shrink-0">{format(value)}</span>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-t-border bg-t-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-t-border bg-t-surface">
        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: accent }} />
        <h3 className="text-sm font-semibold text-t-text">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-3">{children}</div>
    </div>
  )
}

// ─── Data computations ────────────────────────────────────────────────────────

function computeRevenueByCustomer() {
  const received = mockFinance.filter(f => f.type === 'RECEBER' && f.status === 'PAGA')
  const map = new Map<string, number>()
  for (const f of received) {
    map.set(f.entity, (map.get(f.entity) ?? 0) + (f.paidValue ?? f.value))
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
}

function computeExpenseByCategory() {
  const paid = mockFinance.filter(f => f.type === 'PAGAR' && f.status === 'PAGA')
  const map = new Map<string, number>()
  for (const f of paid) {
    const cat = f.category ?? 'Outros'
    map.set(cat, (map.get(cat) ?? 0) + (f.paidValue ?? f.value))
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

function computePurchasesBySupplier() {
  const received = mockPurchases.filter(p => p.status === 'RECEBIDA')
  const map = new Map<string, number>()
  for (const p of received) {
    map.set(p.supplierName, (map.get(p.supplierName) ?? 0) + p.totalValue)
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

function computeAppointmentsByType() {
  const map = new Map<string, number>()
  const labels: Record<string, string> = {
    REVISAO:          'Revisão',
    REPARO:           'Reparo',
    ORCAMENTO:        'Orçamento',
    RETORNO_GARANTIA: 'Retorno Garantia',
  }
  for (const a of mockSchedule) {
    const key = labels[a.type] ?? a.type
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

// ─── KPI cards ────────────────────────────────────────────────────────────────

function KpiRow({ items }: { items: { label: string; value: string; color: string }[] }) {
  return (
    <div className={cn('grid gap-3', `grid-cols-${items.length}`)}>
      {items.map(item => (
        <div key={item.label} className="relative rounded-lg border border-t-border bg-t-surface overflow-hidden p-3">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: item.color }} />
          <p className="text-xs text-t-muted mb-1">{item.label}</p>
          <p className="text-lg font-bold text-t-text">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const revenueByCustomer   = computeRevenueByCustomer()
  const expenseByCategory   = computeExpenseByCategory()
  const purchasesBySupplier = computePurchasesBySupplier()
  const aptsByType          = computeAppointmentsByType()

  const maxRevenue  = revenueByCustomer[0]?.value   ?? 0
  const maxExpense  = expenseByCategory[0]?.value   ?? 0
  const maxPurchase = purchasesBySupplier[0]?.value  ?? 0
  const maxApt      = aptsByType[0]?.value           ?? 0

  const totalRevenue  = revenueByCustomer.reduce((s, r) => s + r.value, 0)
  const totalExpense  = expenseByCategory.reduce((s, r) => s + r.value, 0)
  const totalPurchase = purchasesBySupplier.reduce((s, r) => s + r.value, 0)
  const totalApts     = aptsByType.reduce((s, r) => s + r.value, 0)

  const lowStock    = mockParts.filter(p => p.status === 'BAIXO').length
  const outOfStock  = mockParts.filter(p => p.status === 'SEM_ESTOQUE').length
  const stockValue  = mockParts.reduce((s, p) => s + p.currentStock * p.averageCost, 0)

  const COLORS = {
    revenue:   '#22c55e',
    expense:   '#ef4444',
    purchase:  '#6366f1',
    schedule:  '#f59e0b',
  }

  return (
    <div className="p-5 max-w-[1280px]">
      <PageHeader title="Relatórios" subtitle="Análises e resumo do período" />

      {/* global KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Receita recebida',  value: formatCurrency(totalRevenue),  color: '#22c55e' },
          { label: 'Despesas pagas',    value: formatCurrency(totalExpense),   color: '#ef4444' },
          { label: 'Compras recebidas', value: formatCurrency(totalPurchase),  color: '#6366f1' },
          { label: 'Agendamentos',      value: String(totalApts),              color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} className="relative rounded-lg border border-t-border bg-t-card overflow-hidden p-3">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: item.color }} />
            <p className="text-xs text-t-muted mb-1">{item.label}</p>
            <p className="text-xl font-bold text-t-text">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Receita por cliente */}
        <Section title="Receita por Cliente" accent={COLORS.revenue}>
          <KpiRow items={[
            { label: 'Total recebido', value: formatCurrency(totalRevenue), color: COLORS.revenue },
            { label: 'Clientes únicos', value: String(revenueByCustomer.length), color: COLORS.revenue },
          ]} />
          <div className="space-y-2.5 pt-1">
            {revenueByCustomer.map(r => (
              <HBar key={r.label} label={r.label} value={r.value} max={maxRevenue} color={COLORS.revenue} format={formatCurrency} />
            ))}
          </div>
        </Section>

        {/* Despesas por categoria */}
        <Section title="Despesas por Categoria" accent={COLORS.expense}>
          <KpiRow items={[
            { label: 'Total pago', value: formatCurrency(totalExpense), color: COLORS.expense },
            { label: 'Categorias', value: String(expenseByCategory.length), color: COLORS.expense },
          ]} />
          <div className="space-y-2.5 pt-1">
            {expenseByCategory.map(r => (
              <HBar key={r.label} label={r.label} value={r.value} max={maxExpense} color={COLORS.expense} format={formatCurrency} />
            ))}
          </div>
        </Section>

        {/* Compras por fornecedor */}
        <Section title="Compras por Fornecedor" accent={COLORS.purchase}>
          <KpiRow items={[
            { label: 'Total comprado',   value: formatCurrency(totalPurchase), color: COLORS.purchase },
            { label: 'Fornecedores',     value: String(purchasesBySupplier.length), color: COLORS.purchase },
          ]} />
          <div className="space-y-2.5 pt-1">
            {purchasesBySupplier.map(r => (
              <HBar key={r.label} label={r.label} value={r.value} max={maxPurchase} color={COLORS.purchase} format={formatCurrency} />
            ))}
          </div>
        </Section>

        {/* Agendamentos + estoque */}
        <div className="space-y-5">
          <Section title="Agendamentos por Tipo" accent={COLORS.schedule}>
            <KpiRow items={[
              { label: 'Total agendamentos', value: String(totalApts), color: COLORS.schedule },
            ]} />
            <div className="space-y-2.5 pt-1">
              {aptsByType.map(r => (
                <HBar key={r.label} label={r.label} value={r.value} max={maxApt} color={COLORS.schedule} />
              ))}
            </div>
          </Section>

          <Section title="Estoque" accent="#a855f7">
            <KpiRow items={[
              { label: 'Valor em estoque', value: formatCurrency(stockValue), color: '#a855f7' },
              { label: 'Abaixo do mínimo', value: String(lowStock), color: '#f59e0b' },
              { label: 'Sem estoque',      value: String(outOfStock), color: '#ef4444' },
            ]} />
          </Section>
        </div>
      </div>
    </div>
  )
}
