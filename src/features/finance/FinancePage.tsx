import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { PageHeader } from '../../components/layout/PageHeader'
import { mockFinance } from '../../mocks/finance'
import type { FinancialAccount, FinancialStatus } from '../../types'

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<FinancialStatus, { label: string; color: string }> = {
  ABERTA:    { label: 'Em aberto', color: '#6366f1' },
  PAGA:      { label: 'Paga',      color: '#22c55e' },
  VENCIDA:   { label: 'Vencida',   color: '#ef4444' },
  CANCELADA: { label: 'Cancelada', color: '#6b7280' },
}

type Tab = 'VISAO_GERAL' | 'RECEBER' | 'PAGAR' | 'VENCIDOS'

// ─── Row ─────────────────────────────────────────────────────────────────────

function AccountRow({ acc }: { acc: FinancialAccount }) {
  const s = STATUS_STYLE[acc.status]
  return (
    <tr className="border-b border-t-border last:border-0 hover:bg-t-card-hover transition-colors">
      <td className="px-3 py-2.5 text-sm text-t-text font-medium">{acc.description}</td>
      <td className="px-3 py-2.5 text-xs text-t-secondary">{acc.entity}</td>
      <td className="px-3 py-2.5 text-xs text-t-secondary">{acc.category ?? '—'}</td>
      <td className="px-3 py-2.5 text-xs text-t-secondary">{formatDate(acc.dueDate)}</td>
      <td className="px-3 py-2.5 text-xs text-t-secondary">
        {acc.paidDate ? formatDate(acc.paidDate) : '—'}
      </td>
      <td className="px-3 py-2.5 text-sm font-medium text-t-text text-right">{formatCurrency(acc.value)}</td>
      <td className="px-3 py-2.5">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${s.color}15`, color: s.color }}
        >
          {s.label}
        </span>
      </td>
    </tr>
  )
}

// ─── Table ─────────────────────────────────────────────────────────────────────

function AccountTable({ accounts }: { accounts: FinancialAccount[] }) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-lg border border-t-border bg-t-card p-8 text-center text-sm text-t-muted">
        Nenhum lançamento encontrado.
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-t-border overflow-hidden bg-t-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-t-border bg-t-surface">
            {['Descrição', 'Entidade', 'Categoria', 'Vencimento', 'Pagamento', 'Valor', 'Status'].map(h => (
              <th key={h} className={cn('px-3 py-2 text-xs font-medium text-t-muted text-left', h === 'Valor' && 'text-right')}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {accounts.map(acc => <AccountRow key={acc.id} acc={acc} />)}
        </tbody>
      </table>
    </div>
  )
}

// ─── Visão Geral ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const receber = mockFinance.filter(f => f.type === 'RECEBER')
  const pagar   = mockFinance.filter(f => f.type === 'PAGAR')

  const totalPagoRec   = receber.filter(f => f.status === 'PAGA').reduce((s, f) => s + (f.paidValue ?? f.value), 0)
  const totalPagoPag   = pagar.filter(f => f.status === 'PAGA').reduce((s, f) => s + (f.paidValue ?? f.value), 0)
  const vencidoRec     = receber.filter(f => f.status === 'VENCIDA').reduce((s, f) => s + f.value, 0)
  const vencidoPag     = pagar.filter(f => f.status === 'VENCIDA').reduce((s, f) => s + f.value, 0)
  const abertoRec      = receber.filter(f => f.status === 'ABERTA').reduce((s, f) => s + f.value, 0)
  const abertoPag      = pagar.filter(f => f.status === 'ABERTA').reduce((s, f) => s + f.value, 0)
  const saldo          = totalPagoRec - totalPagoPag

  const recentPaid = mockFinance
    .filter(f => f.status === 'PAGA' && f.paidDate)
    .sort((a, b) => (b.paidDate ?? '').localeCompare(a.paidDate ?? ''))
    .slice(0, 6)

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'A Receber (aberto)', value: abertoRec, color: '#6366f1', Icon: TrendingUp },
          { label: 'A Pagar (aberto)',   value: abertoPag, color: '#f59e0b', Icon: TrendingDown },
          { label: 'Vencidos (receber)', value: vencidoRec, color: '#ef4444', Icon: AlertCircle },
          { label: 'Vencidos (pagar)',   value: vencidoPag, color: '#ef4444', Icon: AlertCircle },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="relative rounded-lg border border-t-border bg-t-card overflow-hidden p-3">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-t-muted">{label}</p>
              <Icon size={14} style={{ color }} />
            </div>
            <p className="text-lg font-bold text-t-text">{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* saldo */}
      <div className="rounded-lg border border-t-border bg-t-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-t-muted mb-1">Resultado do Período (recebido − pago)</p>
            <p className={cn('text-2xl font-bold', saldo >= 0 ? 'text-green-500' : 'text-red-500')}>
              {saldo >= 0 ? '+' : ''}{formatCurrency(saldo)}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-t-muted">Recebido: <span className="text-green-500 font-medium">{formatCurrency(totalPagoRec)}</span></p>
            <p className="text-xs text-t-muted">Pago: <span className="text-red-400 font-medium">{formatCurrency(totalPagoPag)}</span></p>
          </div>
        </div>
      </div>

      {/* recent movements */}
      <div>
        <p className="text-xs font-semibold text-t-muted uppercase tracking-wide mb-2">Últimos Pagamentos</p>
        <div className="rounded-lg border border-t-border overflow-hidden bg-t-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-t-border bg-t-surface">
                {['Descrição', 'Tipo', 'Entidade', 'Pago em', 'Valor'].map(h => (
                  <th key={h} className={cn('px-3 py-2 text-xs font-medium text-t-muted text-left', h === 'Valor' && 'text-right')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPaid.map(f => (
                <tr key={f.id} className="border-b border-t-border last:border-0 hover:bg-t-card-hover">
                  <td className="px-3 py-2.5 text-sm text-t-text">{f.description}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      f.type === 'RECEBER' ? 'bg-green-500/10 text-green-500' : 'bg-red-400/10 text-red-400'
                    )}>
                      {f.type === 'RECEBER' ? 'Receber' : 'Pagar'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-t-secondary">{f.entity}</td>
                  <td className="px-3 py-2.5 text-xs text-t-secondary">{f.paidDate ? formatDate(f.paidDate) : '—'}</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-t-text text-right">{formatCurrency(f.paidValue ?? f.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FinancePage() {
  const [tab, setTab] = useState<Tab>('VISAO_GERAL')

  const vencidos = useMemo(
    () => mockFinance.filter(f => f.status === 'VENCIDA'),
    []
  )
  const receber = useMemo(
    () => mockFinance.filter(f => f.type === 'RECEBER').sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    []
  )
  const pagar = useMemo(
    () => mockFinance.filter(f => f.type === 'PAGAR').sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    []
  )

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: 'VISAO_GERAL', label: 'Visão Geral' },
    { id: 'RECEBER',     label: 'A Receber', badge: receber.filter(f => f.status !== 'PAGA').length },
    { id: 'PAGAR',       label: 'A Pagar',   badge: pagar.filter(f => f.status !== 'PAGA').length },
    { id: 'VENCIDOS',    label: 'Vencidos',  badge: vencidos.length },
  ]

  return (
    <div className="p-5 max-w-[1280px]">
      <PageHeader title="Financeiro" subtitle="Controle de contas a receber e a pagar" />

      {/* tabs */}
      <div className="flex items-center gap-1 border-b border-t-border mb-5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
              tab === t.id
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-t-muted hover:text-t-text'
            )}
          >
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded-full',
                t.id === 'VENCIDOS'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-t-surface text-t-secondary'
              )}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'VISAO_GERAL' && <OverviewTab />}

      {tab === 'RECEBER' && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-xs text-t-muted">
            <span>Total: <strong className="text-t-text">{receber.length}</strong> lançamentos</span>
            <span>Em aberto: <strong className="text-green-500">{formatCurrency(receber.filter(f=>f.status==='ABERTA').reduce((s,f)=>s+f.value,0))}</strong></span>
          </div>
          <AccountTable accounts={receber} />
        </div>
      )}

      {tab === 'PAGAR' && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-xs text-t-muted">
            <span>Total: <strong className="text-t-text">{pagar.length}</strong> lançamentos</span>
            <span>Em aberto: <strong className="text-red-400">{formatCurrency(pagar.filter(f=>f.status==='ABERTA').reduce((s,f)=>s+f.value,0))}</strong></span>
          </div>
          <AccountTable accounts={pagar} />
        </div>
      )}

      {tab === 'VENCIDOS' && (
        <div className="space-y-3">
          {vencidos.length > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-400">
                {vencidos.length} lançamento{vencidos.length > 1 ? 's' : ''} vencido{vencidos.length > 1 ? 's' : ''} —
                total de <strong>{formatCurrency(vencidos.reduce((s, f) => s + f.value, 0))}</strong>
              </p>
            </div>
          )}
          <AccountTable accounts={vencidos} />
        </div>
      )}
    </div>
  )
}
