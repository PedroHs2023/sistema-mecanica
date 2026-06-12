import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Clock, User, Car, Phone } from 'lucide-react'
import { cn, formatDate } from '../../lib/utils'
import { PageHeader } from '../../components/layout/PageHeader'
import { mockSchedule } from '../../mocks/schedule'
import type { ScheduleAppointment, AppointmentStatus, AppointmentType } from '../../types'

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_STYLE: Record<AppointmentType, { label: string; color: string }> = {
  REVISAO:         { label: 'Revisão',         color: '#6366f1' },
  REPARO:          { label: 'Reparo',           color: '#f59e0b' },
  ORCAMENTO:       { label: 'Orçamento',        color: '#3b82f6' },
  RETORNO_GARANTIA:{ label: 'Retorno Garantia', color: '#a855f7' },
}

const STATUS_STYLE: Record<AppointmentStatus, { label: string; color: string }> = {
  AGENDADO:      { label: 'Agendado',       color: '#6b7280' },
  CONFIRMADO:    { label: 'Confirmado',     color: '#3b82f6' },
  REALIZADO:     { label: 'Realizado',      color: '#22c55e' },
  NAO_COMPARECEU:{ label: 'Não compareceu', color: '#ef4444' },
  CANCELADO:     { label: 'Cancelado',      color: '#ef4444' },
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekDates(referenceDate: string): string[] {
  const ref = new Date(referenceDate + 'T12:00:00')
  const day = ref.getDay()
  // week starts Monday (1), ends Saturday (6)
  const monday = new Date(ref)
  monday.setDate(ref.getDate() - ((day === 0 ? 7 : day) - 1))
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatWeekLabel(dates: string[]): string {
  const first = new Date(dates[0] + 'T12:00:00')
  const last  = new Date(dates[5] + 'T12:00:00')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} – ${last.getDate()} de ${months[first.getMonth()]} ${first.getFullYear()}`
  }
  return `${first.getDate()} ${months[first.getMonth()]} – ${last.getDate()} ${months[last.getMonth()]} ${last.getFullYear()}`
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function AppointmentDrawer({ apt, onClose }: { apt: ScheduleAppointment; onClose: () => void }) {
  const type   = TYPE_STYLE[apt.type]
  const status = STATUS_STYLE[apt.status]
  return (
    <div className="fixed right-0 top-[44px] bottom-0 w-[320px] z-[15] bg-t-card border-l border-t-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-t-border">
        <div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
            <p className="text-xs font-medium" style={{ color: type.color }}>{type.label}</p>
          </div>
          <p className="text-sm font-semibold text-t-text mt-0.5">{apt.customerName}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-t-surface text-t-muted">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* status badge */}
        <span
          className="inline-flex text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${status.color}15`, color: status.color }}
        >
          {status.label}
        </span>

        {/* time/duration */}
        <div className="rounded-lg border border-t-border bg-t-surface p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Clock size={12} className="text-t-muted" />
            <span className="text-t-muted">Data e hora</span>
            <span className="ml-auto text-t-text font-medium">
              {formatDate(apt.date)} às {apt.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock size={12} className="text-t-muted" />
            <span className="text-t-muted">Duração</span>
            <span className="ml-auto text-t-text">{apt.duration} min</span>
          </div>
        </div>

        {/* customer & vehicle */}
        <div className="rounded-lg border border-t-border bg-t-surface p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <User size={12} className="text-t-muted" />
            <span className="text-t-muted">Cliente</span>
            <span className="ml-auto text-t-text font-medium truncate max-w-[150px]">{apt.customerName}</span>
          </div>
          {apt.customerPhone && (
            <div className="flex items-center gap-2 text-xs">
              <Phone size={12} className="text-t-muted" />
              <span className="text-t-muted">Telefone</span>
              <span className="ml-auto text-t-text">{apt.customerPhone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            <Car size={12} className="text-t-muted" />
            <span className="text-t-muted">Veículo</span>
            <span className="ml-auto text-t-text truncate max-w-[150px]">{apt.vehicle}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Car size={12} className="text-t-muted opacity-0" />
            <span className="text-t-muted">Placa</span>
            <span className="ml-auto font-mono text-xs text-t-text">{apt.plate}</span>
          </div>
        </div>

        {/* mechanic */}
        {apt.mechanicName && (
          <div className="rounded-lg border border-t-border bg-t-surface p-3">
            <p className="text-xs text-t-muted mb-1">Mecânico</p>
            <p className="text-sm font-medium text-t-text">{apt.mechanicName}</p>
          </div>
        )}

        {/* description */}
        {apt.description && (
          <div>
            <p className="text-xs font-semibold text-t-muted uppercase tracking-wide mb-1">Descrição</p>
            <p className="text-xs text-t-secondary leading-relaxed bg-t-surface rounded p-2 border border-t-border">
              {apt.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Appointment Card ─────────────────────────────────────────────────────────

function AptCard({ apt, onClick, selected }: { apt: ScheduleAppointment; onClick: () => void; selected: boolean }) {
  const type   = TYPE_STYLE[apt.type]
  const status = STATUS_STYLE[apt.status]
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded border-l-2 px-2 py-1.5 mb-1 last:mb-0 transition-colors',
        selected ? 'bg-blue-500/10 border-blue-500' : 'bg-t-surface hover:bg-t-card-hover border-transparent',
      )}
      style={{ borderLeftColor: selected ? undefined : type.color }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-medium text-t-text truncate">{apt.customerName}</span>
        <span className="text-[10px] text-t-muted shrink-0">{apt.time}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[10px] text-t-muted truncate">{apt.vehicle}</span>
        <span className="ml-auto text-[10px] px-1.5 py-0 rounded-full shrink-0"
          style={{ backgroundColor: `${status.color}15`, color: status.color }}
        >
          {status.label}
        </span>
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SchedulePage() {
  const TODAY = '2026-06-10'
  const [weekRef, setWeekRef]     = useState(TODAY)
  const [selectedId, setSelected] = useState<string | null>(null)

  const weekDates = getWeekDates(weekRef)
  const weekLabel = formatWeekLabel(weekDates)

  const weekApts = mockSchedule.filter(a => weekDates.includes(a.date))
  const todayApts  = mockSchedule.filter(a => a.date === TODAY)
  const totalWeek  = weekApts.length
  const confirmed  = weekApts.filter(a => a.status === 'CONFIRMADO').length
  const done       = weekApts.filter(a => a.status === 'REALIZADO').length

  const selected = selectedId ? mockSchedule.find(a => a.id === selectedId) ?? null : null

  const cards = [
    { label: 'Esta semana',  value: String(totalWeek), color: '#6366f1' },
    { label: 'Confirmados',  value: String(confirmed), color: '#3b82f6' },
    { label: 'Realizados',   value: String(done),      color: '#22c55e' },
    { label: 'Hoje',         value: String(todayApts.length), color: '#f59e0b' },
  ]

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden flex flex-col">
      <div
        className="flex-1 overflow-y-auto flex flex-col transition-all duration-200"
        style={{ paddingRight: selected ? 340 : 20 }}
      >
        <div className="px-5 pt-5">
          <PageHeader title="Agenda" subtitle="Calendário de agendamentos da oficina" />

          {/* summary cards */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {cards.map(card => (
              <div key={card.label} className="relative rounded-lg border border-t-border bg-t-card overflow-hidden p-3">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: card.color }} />
                <p className="text-xs text-t-muted mb-1">{card.label}</p>
                <p className="text-xl font-bold text-t-text">{card.value}</p>
              </div>
            ))}
          </div>

          {/* week nav */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekRef(addDays(weekRef, -7))}
                className="p-1 rounded border border-t-border bg-t-surface text-t-muted hover:bg-t-card-hover transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-medium text-t-text">{weekLabel}</span>
              <button
                onClick={() => setWeekRef(addDays(weekRef, 7))}
                className="p-1 rounded border border-t-border bg-t-surface text-t-muted hover:bg-t-card-hover transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <button
              onClick={() => setWeekRef(TODAY)}
              className="text-xs text-blue-500 hover:underline"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* week grid */}
        <div className="px-5 pb-5">
          <div className="grid grid-cols-6 gap-3">
            {weekDates.map(date => {
              const d  = new Date(date + 'T12:00:00')
              const wd = d.getDay()
              const dayApts = mockSchedule.filter(a => a.date === date)
                .sort((a, b) => a.time.localeCompare(b.time))
              const isToday = date === TODAY
              return (
                <div key={date} className={cn(
                  'rounded-lg border border-t-border bg-t-card overflow-hidden',
                  isToday && 'ring-1 ring-blue-500/40'
                )}>
                  {/* day header */}
                  <div className={cn(
                    'px-2 py-1.5 border-b border-t-border flex items-center justify-between',
                    isToday ? 'bg-blue-500/10' : 'bg-t-surface'
                  )}>
                    <span className={cn('text-xs font-medium', isToday ? 'text-blue-500' : 'text-t-secondary')}>
                      {WEEK_DAYS[wd]}
                    </span>
                    <span className={cn(
                      'text-xs font-bold',
                      isToday ? 'text-blue-500' : 'text-t-text'
                    )}>
                      {d.getDate()}
                    </span>
                  </div>
                  {/* appointments */}
                  <div className="p-1.5 min-h-[120px]">
                    {dayApts.length === 0 ? (
                      <p className="text-[10px] text-t-muted text-center mt-4">—</p>
                    ) : (
                      dayApts.map(apt => (
                        <AptCard
                          key={apt.id}
                          apt={apt}
                          selected={selectedId === apt.id}
                          onClick={() => setSelected(selectedId === apt.id ? null : apt.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selected && (
        <AppointmentDrawer apt={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
