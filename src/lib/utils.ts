import type {
  ServiceOrderStatus,
  ServiceOrderPriority,
  ServiceOrderType,
  StockStatus,
  FinancialStatus,
} from '../types'

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date)
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(date)
}

export function formatDateTime(isoStr: string): string {
  const date = new Date(isoStr)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date)
}

// ─── Status Labels ─────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  AGENDADO: 'Agendado',
  EM_ANALISE: 'Em Análise',
  AGUARDANDO_APROVACAO: 'Aguard. Aprovação',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export const STATUS_COLORS: Record<ServiceOrderStatus, string> = {
  AGENDADO: 'status-scheduled',
  EM_ANALISE: 'status-analysis',
  AGUARDANDO_APROVACAO: 'status-awaiting',
  EM_ANDAMENTO: 'status-progress',
  CONCLUIDO: 'status-done',
  ENTREGUE: 'status-delivered',
  CANCELADO: 'status-cancelled',
}

export const PRIORITY_LABELS: Record<ServiceOrderPriority, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

export const PRIORITY_COLORS: Record<ServiceOrderPriority, string> = {
  BAIXA:   '#16A34A',
  MEDIA:   '#B45309',
  ALTA:    '#F97316',
  URGENTE: '#EF4444',
}

export const TYPE_LABELS: Record<ServiceOrderType, string> = {
  DIAGNOSTICO: 'Diagnóstico',
  REVISAO: 'Revisão',
  TROCA_PECA: 'Troca de Peça',
  GARANTIA: 'Garantia',
  RETORNO: 'Retorno',
  ORCAMENTO: 'Orçamento',
}

export const TYPE_COLORS: Record<ServiceOrderType, { bg: string; text: string }> = {
  DIAGNOSTICO: { bg: 'rgba(37,99,235,0.10)',   text: '#2563EB' },
  REVISAO:     { bg: 'rgba(124,58,237,0.10)',   text: '#7C3AED' },
  TROCA_PECA:  { bg: 'rgba(249,115,22,0.12)',   text: '#F97316' },
  GARANTIA:    { bg: 'rgba(22,163,74,0.10)',    text: '#16A34A' },
  RETORNO:     { bg: 'rgba(82,82,91,0.10)',     text: '#52525B' },
  ORCAMENTO:   { bg: 'rgba(180,83,9,0.10)',     text: '#B45309' },
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  NORMAL: 'Normal',
  BAIXO: 'Baixo',
  SEM_ESTOQUE: 'Sem Estoque',
}

export const FINANCIAL_STATUS_LABELS: Record<FinancialStatus, string> = {
  ABERTA: 'Aberta',
  PAGA: 'Paga',
  VENCIDA: 'Vencida',
  CANCELADA: 'Cancelada',
}

export function getStockStatus(current: number, minimum: number): StockStatus {
  if (current === 0) return 'SEM_ESTOQUE'
  if (current <= minimum) return 'BAIXO'
  return 'NORMAL'
}
