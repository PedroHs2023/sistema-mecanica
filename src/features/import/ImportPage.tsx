import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Upload, Zap, X, Check, CheckCircle2,
  AlertTriangle, Plus, Download, FileCode, FileSpreadsheet,
  Loader2, AlertCircle,
} from 'lucide-react'
import { cn, formatCurrency, formatDate, formatDateTime } from '../../lib/utils'
import { PageHeader } from '../../components/layout/PageHeader'
import { mockImportedInvoice } from '../../mocks/imported-invoice'
import { mockImportedSpreadsheet } from '../../mocks/imported-spreadsheet'
import { mockImportHistory } from '../../mocks/import-history'
import type { ImportItemStatus } from '../../types'
import {
  previewXmlImport, confirmXmlImport, previewSpreadsheetImport,
  confirmSpreadsheetImport, listImportHistory,
  type NfePreviewResponse, type NfeConfirmRequest, type NfeConfirmItem,
  type SheetPreviewResponse, type ImportResult, type ImportHistoryEntry,
} from '../../api/import'
import { createPart } from '../../api/parts'
import { listSuppliers, type SupplierItem } from '../../api/suppliers'

// ─── Shared helpers ───────────────────────────────────────────────────────────

const ITEM_STATUS_STYLE: Record<ImportItemStatus, { label: string; color: string }> = {
  NOVA_PECA:            { label: 'Nova peça',          color: '#22c55e' },
  JA_CADASTRADA:        { label: 'Já cadastrada',      color: '#3b82f6' },
  POSSIVEL_DUPLICIDADE: { label: 'Possível duplicata', color: '#f59e0b' },
  DADOS_INCOMPLETOS:    { label: 'Dados incompletos',  color: '#ef4444' },
  IGNORADO:             { label: 'Ignorado',           color: '#6b7280' },
  PRONTO_PARA_IMPORTAR: { label: 'Pronto',             color: '#22c55e' },
  DUPLICADO:            { label: 'Duplicado',          color: '#f59e0b' },
}

const CATEGORIES = ['Filtros', 'Freios', 'Motor', 'Óleos', 'Fluidos', 'Ignição', 'Suspensão', 'Elétrica', 'Outros']

function getCategoryHint(desc: string): string | null {
  const d = desc.toLowerCase()
  if (d.includes('filtro')) return 'Filtros'
  if (d.includes('óleo') || d.includes('oleo') || d.includes('lubrificante')) return 'Óleos'
  if (d.includes('pastilha') || d.includes('freio') || d.includes('disco') || d.includes('fluido de freio')) return 'Freios'
  if (d.includes('vela') || d.includes('bobina') || d.includes('cabo de vela')) return 'Ignição'
  if (d.includes('bateria')) return 'Elétrica'
  if (d.includes('amortecedor') || d.includes('mola') || d.includes('coxim')) return 'Suspensão'
  if (d.includes('correia') || d.includes('junta') || d.includes('embreagem')) return 'Motor'
  return null
}

// ─── FileUploadDropzone ───────────────────────────────────────────────────────

function FileUploadDropzone({
  accept, label, hint, selectedFile, onFileSelect,
}: {
  accept: string
  label: string
  hint?: string
  selectedFile?: File | null
  onFileSelect: (file: File) => void
}) {
  const [dragging, setDragging] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault(); setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) onFileSelect(f)
      }}
      onClick={() => ref.current?.click()}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none',
        dragging
          ? 'border-blue-500 bg-blue-500/5'
          : selectedFile
          ? 'border-green-500 bg-green-500/5'
          : 'border-t-border hover:border-blue-400 hover:bg-t-surface',
      )}
    >
      <input
        ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelect(f) }}
      />
      {selectedFile ? (
        <>
          <CheckCircle2 size={28} className="mx-auto mb-3 text-green-500" />
          <p className="text-sm font-semibold text-t-text">{selectedFile.name}</p>
          <p className="text-xs text-t-muted mt-1">Clique para trocar o arquivo</p>
        </>
      ) : (
        <>
          <Upload size={28} className="mx-auto mb-3 text-t-muted" />
          <p className="text-sm font-semibold text-t-text">{label}</p>
          {hint && <p className="text-xs text-t-muted mt-1.5 leading-relaxed">{hint}</p>}
        </>
      )}
    </div>
  )
}

// ─── StepIndicator ───────────────────────────────────────────────────────────

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                done    ? 'bg-green-500 text-white'
                : active ? 'bg-blue-500 text-white'
                : 'bg-t-surface border border-t-border text-t-muted',
              )}>
                {done ? <Check size={10} strokeWidth={3} /> : n}
              </div>
              <span className={cn(
                'text-xs whitespace-nowrap',
                active ? 'font-semibold text-t-text' : 'text-t-muted',
              )}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('w-8 h-px mx-2', done ? 'bg-green-500' : 'bg-t-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            'bg-white dark:bg-[#141417] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl w-full flex flex-col max-h-[90vh] pointer-events-auto',
            wide ? 'max-w-5xl' : 'max-w-2xl',
          )}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  )
}

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between px-6 py-4 border-b border-t-border flex-shrink-0">
      <div>
        <h2 className="text-base font-semibold text-t-text">{title}</h2>
        {subtitle && <p className="text-xs text-t-muted mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="p-1.5 rounded hover:bg-t-surface text-t-muted transition-colors">
        <X size={16} />
      </button>
    </div>
  )
}

// ─── XML Import Modal ─────────────────────────────────────────────────────────

const XML_PROC_STEPS = [
  'Lendo XML da NF-e',
  'Identificando fornecedor',
  'Encontrando produtos',
  'Verificando duplicidades',
  'Calculando preço sugerido',
  'Preparando prévia',
]

type XmlAction = 'create' | 'update' | 'link' | 'ignore'

function defaultXmlAction(status: ImportItemStatus): XmlAction {
  if (status === 'JA_CADASTRADA') return 'update'
  if (status === 'IGNORADO' || status === 'DADOS_INCOMPLETOS') return 'ignore'
  return 'create'
}

// Map mock data to API response shape for demo mode
function buildDemoInvoice(): NfePreviewResponse {
  return {
    invoiceNumber: mockImportedInvoice.invoiceNumber,
    series: mockImportedInvoice.series,
    accessKey: mockImportedInvoice.accessKey,
    supplierName: mockImportedInvoice.supplierName,
    supplierDocument: mockImportedInvoice.supplierDocument,
    issueDate: mockImportedInvoice.issueDate,
    totalValue: mockImportedInvoice.totalValue,
    items: mockImportedInvoice.items.map(it => ({
      supplierCode: it.supplierCode,
      description: it.description,
      ncm: it.ncm,
      cfop: it.cfop,
      unit: it.unit,
      quantity: it.quantity,
      unitCost: it.unitCost,
      totalCost: it.totalCost,
      suggestedSalePrice: it.suggestedSalePrice,
      marginPercent: it.marginPercent,
      status: it.status,
      possibleMatchPartId: null,
      possibleMatchDescription: it.possibleMatchDescription ?? null,
    })),
  }
}

function XmlImportModal({ onClose }: { onClose: () => void }) {
  const [step, setStep]         = useState<1 | 2 | 3>(1)
  const [file, setFile]         = useState<File | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [procIdx, setProcIdx]   = useState(0)
  const [invoice, setInvoice]   = useState<NfePreviewResponse | null>(null)
  const [actions, setActions]   = useState<Record<string, XmlAction>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<ImportResult | null>(null)

  // Step 2: animation + API call in parallel
  useEffect(() => {
    if (step !== 2) return
    let cancelled = false
    setProcIdx(0)
    setApiError(null)

    let animDoneLocal = false
    let apiDoneLocal  = false
    let previewData:  NfePreviewResponse | null = null
    let previewErr:   string | null = null

    const advance = () => {
      if (!animDoneLocal || !apiDoneLocal || cancelled) return
      if (previewErr) {
        setApiError(previewErr)
        setStep(1)
      } else if (previewData) {
        setInvoice(previewData)
        const init: Record<string, XmlAction> = {}
        previewData.items.forEach((item, i) => { init[String(i)] = defaultXmlAction(item.status) })
        setActions(init)
        setStep(3)
      }
    }

    // Animation
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      if (cancelled) return
      i++; setProcIdx(i)
      if (i < XML_PROC_STEPS.length) {
        timer = setTimeout(tick, 420)
      } else {
        timer = setTimeout(() => { animDoneLocal = true; advance() }, 600)
      }
    }
    timer = setTimeout(tick, 500)

    // API or demo
    if (isDemoMode) {
      previewData = buildDemoInvoice()
      apiDoneLocal = true
    } else if (file) {
      previewXmlImport(file)
        .then(data => { if (!cancelled) { previewData = data; apiDoneLocal = true; advance() } })
        .catch(err  => { if (!cancelled) { previewErr = (err as Error).message; apiDoneLocal = true; advance() } })
    }

    return () => { cancelled = true; clearTimeout(timer) }
  }, [step, file, isDemoMode])

  const setAction = (idx: number, a: XmlAction) =>
    setActions(prev => ({ ...prev, [String(idx)]: a }))

  const inv = invoice
  const items = inv?.items ?? []

  const created = items.filter((_, i) => actions[String(i)] === 'create').length
  const updated = items.filter((_, i) => actions[String(i)] === 'update' || actions[String(i)] === 'link').length
  const ignored = items.filter((_, i) => actions[String(i)] === 'ignore').length
  const pending = items.filter((item, i) =>
    item.status === 'POSSIVEL_DUPLICIDADE' && actions[String(i)] === 'create'
  ).length

  const handleConfirm = async () => {
    if (!inv) return
    setLoading(true)
    try {
      if (isDemoMode) {
        // Demo mode: just show result from local counts
        setResult({ itemsFound: items.length, created, updated, ignored, status: 'PROCESSADA', message: 'Modo demonstração' })
        setLoading(false)
        return
      }
      const confirmItems: NfeConfirmItem[] = inv.items.map((item, i) => ({
        supplierCode: item.supplierCode,
        description: item.description,
        ncm: item.ncm,
        cfop: item.cfop,
        unit: item.unit,
        quantity: item.quantity,
        unitCost: item.unitCost,
        suggestedSalePrice: item.suggestedSalePrice,
        action: actions[String(i)] ?? 'ignore',
        existingPartId: item.possibleMatchPartId ?? null,
      }))
      const req: NfeConfirmRequest = {
        fileName: file?.name ?? 'demo.xml',
        supplierDocument: inv.supplierDocument,
        supplierName: inv.supplierName,
        invoiceNumber: inv.invoiceNumber,
        issueDate: inv.issueDate,
        totalValue: inv.totalValue,
        items: confirmItems,
      }
      const res = await confirmXmlImport(req)
      setResult(res)
    } catch (err) {
      setApiError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <Modal onClose={onClose}>
        <ModalHeader title="Importação concluída" onClose={onClose} />
        <div className="px-6 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-green-500" />
          </div>
          <h3 className="text-base font-semibold text-t-text mb-1">Importação realizada com sucesso</h3>
          <p className="text-sm text-t-muted mb-6">
            NF-e {inv?.invoiceNumber} de {inv?.supplierName} processada.
          </p>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Peças criadas',       value: result.created,              color: '#22c55e' },
              { label: 'Peças atualizadas',   value: result.updated,              color: '#3b82f6' },
              { label: 'Entradas de estoque', value: result.created + result.updated, color: '#6366f1' },
              { label: 'Itens ignorados',     value: result.ignored,              color: '#6b7280' },
            ].map(c => (
              <div key={c.label} className="relative rounded-lg border border-t-border bg-t-surface p-3 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: c.color }} />
                <p className="text-xl font-bold text-t-text">{c.value}</p>
                <p className="text-[10px] text-t-muted mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-sm font-semibold transition-colors">
            Fechar
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose} wide={step === 3}>
      <ModalHeader
        title="Importar XML da NF-e"
        subtitle={step === 1 ? 'Selecione o arquivo XML da nota fiscal' : step === 2 ? 'Processando arquivo...' : 'Revise os itens antes de importar'}
        onClose={onClose}
      />

      <div className="px-6 py-3 border-b border-t-border bg-t-surface flex-shrink-0">
        <StepIndicator steps={['Upload', 'Processando', 'Prévia']} current={step} />
      </div>

      {/* Step 1 — Upload */}
      {step === 1 && (
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          {apiError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-4">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-500">{apiError}</p>
            </div>
          )}
          <FileUploadDropzone
            accept=".xml"
            label="Arraste o XML da NF-e ou clique para selecionar"
            hint="O XML da nota de compra permite identificar fornecedor, produtos, quantidades, custos, NCM e CFOP automaticamente."
            selectedFile={file}
            onFileSelect={f => { setFile(f); setIsDemoMode(false) }}
          />
          {!file && (
            <div className="mt-4 p-3 rounded-lg bg-t-surface border border-t-border">
              <p className="text-xs text-t-muted leading-relaxed">
                <strong className="text-t-secondary">Formato aceito:</strong> .xml (NF-e SEFAZ)
                <br />
                <strong className="text-t-secondary">Tamanho máximo:</strong> 10 MB por arquivo
              </p>
            </div>
          )}
          <div className="flex justify-end mt-5">
            {!file && (
              <button
                onClick={() => { setIsDemoMode(true); setApiError(null); setStep(2) }}
                className="mr-2 text-xs text-t-muted hover:text-t-text transition-colors underline underline-offset-2"
              >
                Usar dados de demonstração
              </button>
            )}
            <button
              onClick={() => { if (file) { setApiError(null); setStep(2) } }}
              disabled={!file}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileCode size={14} />
              Processar XML
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Processing */}
      {step === 2 && (
        <div className="px-6 py-8 flex-1">
          <div className="max-w-sm mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Loader2 size={32} className="text-blue-500 animate-spin" />
            </div>
            <div className="space-y-3">
              {XML_PROC_STEPS.map((label, i) => {
                const done   = i < procIdx
                const active = i === procIdx - 1 && procIdx < XML_PROC_STEPS.length
                return (
                  <div key={label} className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg border transition-all',
                    done   ? 'border-green-500/30 bg-green-500/5'
                    : active ? 'border-blue-500/40 bg-blue-500/5'
                    : 'border-t-border bg-t-surface opacity-40',
                  )}>
                    <div className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
                      done ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-t-border',
                    )}>
                      {done   ? <Check size={9} className="text-white" strokeWidth={3} />
                      : active ? <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      : null}
                    </div>
                    <span className={cn(
                      'text-sm',
                      done ? 'text-t-text' : active ? 'text-t-text font-medium' : 'text-t-muted',
                    )}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Preview */}
      {step === 3 && inv && (
        <>
          <div className="flex-1 overflow-y-auto">
            {isDemoMode && (
              <div className="mx-6 mt-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-500">Modo demonstração — dados fictícios, nada será gravado no banco.</p>
              </div>
            )}

            <div className="px-6 py-4 border-b border-t-border bg-t-surface grid grid-cols-4 gap-3">
              {[
                { label: 'Fornecedor',   value: inv.supplierName },
                { label: 'NF-e / Série', value: `${inv.invoiceNumber} / ${inv.series ?? '—'}` },
                { label: 'Emissão',      value: inv.issueDate ? formatDate(inv.issueDate) : '—' },
                { label: 'Valor total',  value: formatCurrency(inv.totalValue) },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[10px] text-t-muted uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-semibold text-t-text mt-0.5 truncate">{f.value}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 flex items-center gap-3">
              {[
                { label: 'Produtos',    value: items.length,                                                          color: '#6366f1' },
                { label: 'Novas',       value: items.filter(it => it.status === 'NOVA_PECA').length,                  color: '#22c55e' },
                { label: 'Cadastradas', value: items.filter(it => it.status === 'JA_CADASTRADA').length,              color: '#3b82f6' },
                { label: 'Duplicatas',  value: items.filter(it => it.status === 'POSSIVEL_DUPLICIDADE').length,       color: '#f59e0b' },
                { label: 'Incompletos', value: items.filter(it => it.status === 'DADOS_INCOMPLETOS').length,          color: '#ef4444' },
              ].map(c => (
                <div key={c.label} className="relative rounded-lg border border-t-border bg-t-card px-3 py-2 overflow-hidden min-w-[90px]">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: c.color }} />
                  <p className="text-lg font-bold text-t-text leading-none">{c.value}</p>
                  <p className="text-[10px] text-t-muted mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="px-6 pb-4">
              <div className="rounded-lg border border-t-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[1100px]">
                    <thead>
                      <tr className="border-b border-t-border bg-t-surface">
                        {['Status','Cód. Forn.','Descrição','NCM','CFOP','Un.','Qtd','Custo un.','Total','Preço sug.','Margem','Ação'].map(h => (
                          <th key={h} className="px-2.5 py-2 text-left text-[10px] font-semibold text-t-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-t-border">
                      {items.map((item, i) => {
                        const s = ITEM_STATUS_STYLE[item.status] ?? ITEM_STATUS_STYLE.IGNORADO
                        const action = actions[String(i)]
                        const isDup = item.status === 'POSSIVEL_DUPLICIDADE'
                        return (
                          <tr key={i} className={cn('hover:bg-t-card-hover transition-colors', action === 'ignore' && 'opacity-40')}>
                            <td className="px-2.5 py-2 whitespace-nowrap">
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                                {s.label}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 font-mono text-[10px] text-t-muted whitespace-nowrap">{item.supplierCode}</td>
                            <td className="px-2.5 py-2 max-w-[200px]">
                              <p className="font-medium text-t-text leading-tight truncate">{item.description}</p>
                              {isDup && item.possibleMatchDescription && (
                                <p className="text-[10px] text-amber-500 flex items-center gap-1 mt-0.5">
                                  <AlertTriangle size={9} />
                                  Possível match: {item.possibleMatchDescription}
                                </p>
                              )}
                            </td>
                            <td className="px-2.5 py-2 font-mono text-[10px] text-t-muted whitespace-nowrap">{item.ncm ?? '—'}</td>
                            <td className="px-2.5 py-2 font-mono text-[10px] text-t-muted">{item.cfop ?? '—'}</td>
                            <td className="px-2.5 py-2 text-t-secondary">{item.unit}</td>
                            <td className="px-2.5 py-2 text-t-text font-medium">{item.quantity}</td>
                            <td className="px-2.5 py-2 font-mono text-t-secondary">{formatCurrency(item.unitCost)}</td>
                            <td className="px-2.5 py-2 font-mono font-medium text-t-text">{formatCurrency(item.totalCost)}</td>
                            <td className="px-2.5 py-2 font-mono text-green-600">{formatCurrency(item.suggestedSalePrice)}</td>
                            <td className="px-2.5 py-2 font-mono text-t-secondary">{item.marginPercent}%</td>
                            <td className="px-2.5 py-2">
                              <div className="flex items-center gap-1 flex-wrap">
                                {item.status === 'NOVA_PECA' && (
                                  <>
                                    <ActionBtn active={action === 'create'} color="green" onClick={() => setAction(i, 'create')}>Criar</ActionBtn>
                                    <ActionBtn active={action === 'ignore'} color="gray"  onClick={() => setAction(i, 'ignore')}>Ignorar</ActionBtn>
                                  </>
                                )}
                                {item.status === 'JA_CADASTRADA' && (
                                  <>
                                    <ActionBtn active={action === 'update'} color="blue"  onClick={() => setAction(i, 'update')}>Atualizar</ActionBtn>
                                    <ActionBtn active={action === 'ignore'} color="gray"  onClick={() => setAction(i, 'ignore')}>Ignorar</ActionBtn>
                                  </>
                                )}
                                {item.status === 'POSSIVEL_DUPLICIDADE' && (
                                  <>
                                    <ActionBtn active={action === 'link'}   color="blue"  onClick={() => setAction(i, 'link')}>Vincular</ActionBtn>
                                    <ActionBtn active={action === 'create'} color="green" onClick={() => setAction(i, 'create')}>Criar</ActionBtn>
                                    <ActionBtn active={action === 'ignore'} color="gray"  onClick={() => setAction(i, 'ignore')}>Ignorar</ActionBtn>
                                  </>
                                )}
                                {item.status === 'DADOS_INCOMPLETOS' && (
                                  <>
                                    <ActionBtn active={action === 'create'} color="amber" onClick={() => setAction(i, 'create')}>Criar mesmo assim</ActionBtn>
                                    <ActionBtn active={action === 'ignore'} color="gray"  onClick={() => setAction(i, 'ignore')}>Ignorar</ActionBtn>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-t border-t-border bg-t-surface flex-shrink-0">
            <p className="text-xs text-t-muted">
              <strong className="text-t-text">{created}</strong> peças a criar ·{' '}
              <strong className="text-t-text">{updated}</strong> a atualizar ·{' '}
              <strong className="text-t-text">{ignored}</strong> ignoradas
              {pending > 0 && (
                <span className="ml-2 text-amber-500">· {pending} duplicata{pending > 1 ? 's' : ''} sem decisão</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-1.5 text-sm text-t-muted hover:text-t-text border border-t-border rounded-lg transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-1.5 rounded-lg bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Confirmar importação
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}

function ActionBtn({
  children, active, color, onClick,
}: {
  children: React.ReactNode; active: boolean
  color: 'green' | 'blue' | 'gray' | 'amber'; onClick: () => void
}) {
  const colors = {
    green: 'bg-green-500 text-white', blue: 'bg-blue-500 text-white',
    amber: 'bg-amber-500 text-white', gray: 'bg-t-surface border border-t-border text-t-muted',
  }
  return (
    <button onClick={onClick} className={cn(
      'text-[9px] font-semibold px-1.5 py-0.5 rounded transition-colors',
      active ? colors[color] : 'bg-t-surface border border-t-border text-t-muted hover:text-t-text',
    )}>
      {children}
    </button>
  )
}

// ─── Spreadsheet Import Modal ─────────────────────────────────────────────────

type SheetAction = 'import' | 'ignore'

function SpreadsheetImportModal({ onClose }: { onClose: () => void }) {
  const [step, setStep]         = useState<1 | 2>(1)
  const [file, setFile]         = useState<File | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [preview, setPreview]   = useState<SheetPreviewResponse | null>(null)
  const [actions, setActions]   = useState<Record<string, SheetAction>>({})
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingConfirm, setLoadingConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [result, setResult]     = useState<ImportResult | null>(null)

  const setAction = (idx: number, a: SheetAction) =>
    setActions(prev => ({ ...prev, [String(idx)]: a }))

  const toImport = (preview?.items ?? []).filter((_, i) => actions[String(i)] === 'import').length
  const toIgnore = (preview?.items ?? []).filter((_, i) => actions[String(i)] === 'ignore').length

  const handlePreview = async () => {
    setApiError(null)
    setLoadingPreview(true)
    try {
      let data: SheetPreviewResponse
      if (isDemoMode) {
        data = {
          fileName: 'pecas-demonstracao.xlsx',
          totalRows: mockImportedSpreadsheet.length,
          readyCount: mockImportedSpreadsheet.filter(i => i.status === 'PRONTO_PARA_IMPORTAR').length,
          duplicateCount: mockImportedSpreadsheet.filter(i => i.status === 'DUPLICADO').length,
          incompleteCount: mockImportedSpreadsheet.filter(i => i.status === 'DADOS_INCOMPLETOS').length,
          items: mockImportedSpreadsheet.map(it => ({
            description: it.description, internalCode: it.internalCode ?? null,
            manufacturerCode: it.manufacturerCode ?? null,
            currentStock: it.currentStock ?? null, averageCost: it.averageCost ?? null,
            salePrice: it.salePrice ?? null, supplierName: it.supplierName ?? null,
            ncm: it.ncm ?? null, status: it.status, reason: it.reason ?? null,
          })),
        }
      } else {
        data = await previewSpreadsheetImport(file!)
      }
      setPreview(data)
      const init: Record<string, SheetAction> = {}
      data.items.forEach((it, i) => {
        init[String(i)] = it.status === 'DADOS_INCOMPLETOS' || it.status === 'DUPLICADO' ? 'ignore' : 'import'
      })
      setActions(init)
      setStep(2)
    } catch (err) {
      setApiError((err as Error).message)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleConfirm = async () => {
    setLoadingConfirm(true)
    try {
      if (isDemoMode) {
        setResult({ itemsFound: toImport + toIgnore, created: toImport, updated: 0, ignored: toIgnore, status: 'PROCESSADA', message: 'Modo demonstração' })
        return
      }
      const res = await confirmSpreadsheetImport(file!)
      setResult(res)
    } catch (err) {
      setApiError((err as Error).message)
    } finally {
      setLoadingConfirm(false)
    }
  }

  if (result) {
    return (
      <Modal onClose={onClose}>
        <ModalHeader title="Importação concluída" onClose={onClose} />
        <div className="px-6 py-8 text-center">
          <CheckCircle2 size={36} className="mx-auto mb-4 text-green-500" />
          <h3 className="text-base font-semibold text-t-text mb-1">Planilha importada com sucesso</h3>
          <p className="text-sm text-t-muted mb-6">
            {result.created} peças criadas · {result.ignored} ignoradas
          </p>
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-sm font-semibold">
            Fechar
          </button>
        </div>
      </Modal>
    )
  }

  const items = preview?.items ?? []

  return (
    <Modal onClose={onClose} wide={step === 2}>
      <ModalHeader
        title="Importar Planilha"
        subtitle={step === 1 ? 'Envie uma planilha .xlsx ou .csv com suas peças' : 'Revise os itens antes de importar'}
        onClose={onClose}
      />
      <div className="px-6 py-3 border-b border-t-border bg-t-surface flex-shrink-0">
        <StepIndicator steps={['Upload', 'Prévia']} current={step} />
      </div>

      {step === 1 && (
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          {apiError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-4">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-500">{apiError}</p>
            </div>
          )}
          <FileUploadDropzone
            accept=".xlsx,.csv"
            label="Arraste a planilha ou clique para selecionar"
            hint="Formatos aceitos: .xlsx e .csv"
            selectedFile={file}
            onFileSelect={f => { setFile(f); setIsDemoMode(false) }}
          />
          <div className="mt-4 p-3 rounded-lg bg-t-surface border border-t-border">
            <p className="text-xs font-semibold text-t-secondary mb-1.5">Colunas aceitas:</p>
            <div className="flex flex-wrap gap-1.5">
              {['Descrição','Código','Cód. fabricante','Estoque','Custo','Preço de venda','Fornecedor','NCM'].map(col => (
                <span key={col} className="text-[10px] bg-t-card border border-t-border rounded px-1.5 py-0.5 text-t-secondary">{col}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-5">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-t-border rounded-lg text-t-secondary hover:text-t-text transition-colors">
              <Download size={13} />
              Baixar modelo de planilha
            </button>
            <div className="flex items-center gap-2">
              {!file && (
                <button
                  onClick={() => { setIsDemoMode(true); handlePreview() }}
                  className="text-xs text-t-muted hover:text-t-text transition-colors underline underline-offset-2"
                >
                  Usar dados de demonstração
                </button>
              )}
              <button
                onClick={handlePreview}
                disabled={!file || loadingPreview}
                className="flex items-center gap-2 px-5 py-1.5 rounded-lg bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loadingPreview ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                Pré-visualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && preview && (
        <>
          <div className="flex-1 overflow-y-auto">
            {isDemoMode && (
              <div className="mx-6 mt-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-500">Modo demonstração — nada será gravado.</p>
              </div>
            )}
            <div className="px-6 py-3 flex items-center gap-3 border-b border-t-border bg-t-surface">
              {[
                { label: 'Total',       value: items.length,                                                color: '#6366f1' },
                { label: 'Pronto',      value: items.filter(i => i.status==='PRONTO_PARA_IMPORTAR').length, color: '#22c55e' },
                { label: 'Duplicados',  value: items.filter(i => i.status==='DUPLICADO').length,            color: '#f59e0b' },
                { label: 'Incompletos', value: items.filter(i => i.status==='DADOS_INCOMPLETOS').length,    color: '#ef4444' },
              ].map(c => (
                <div key={c.label} className="relative rounded-lg border border-t-border bg-t-card px-3 py-1.5 overflow-hidden min-w-[75px]">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: c.color }} />
                  <p className="text-base font-bold text-t-text">{c.value}</p>
                  <p className="text-[10px] text-t-muted">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-4 pt-3">
              <div className="rounded-lg border border-t-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[900px]">
                    <thead>
                      <tr className="border-b border-t-border bg-t-surface">
                        {['Status','Descrição','Código','Cód. Fab.','Estoque','Custo','Preço venda','Fornecedor','Ação'].map(h => (
                          <th key={h} className="px-2.5 py-2 text-left text-[10px] font-semibold text-t-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-t-border">
                      {items.map((item, i) => {
                        const s = ITEM_STATUS_STYLE[item.status] ?? ITEM_STATUS_STYLE.IGNORADO
                        const action = actions[String(i)]
                        return (
                          <tr key={i} className={cn('hover:bg-t-card-hover', action === 'ignore' && 'opacity-40')}>
                            <td className="px-2.5 py-2">
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                                style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                                {s.label}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 max-w-[180px]">
                              <p className="font-medium text-t-text truncate">{item.description ?? '—'}</p>
                              {item.reason && <p className="text-[9px] text-t-muted">{item.reason}</p>}
                            </td>
                            <td className="px-2.5 py-2 font-mono text-t-muted">{item.internalCode ?? '—'}</td>
                            <td className="px-2.5 py-2 font-mono text-t-muted text-[10px]">{item.manufacturerCode ?? '—'}</td>
                            <td className="px-2.5 py-2 text-t-secondary">{item.currentStock ?? '—'}</td>
                            <td className="px-2.5 py-2 font-mono text-t-secondary">{item.averageCost ? formatCurrency(item.averageCost) : '—'}</td>
                            <td className="px-2.5 py-2 font-mono text-t-text">{item.salePrice ? formatCurrency(item.salePrice) : '—'}</td>
                            <td className="px-2.5 py-2 text-t-secondary">{item.supplierName ?? '—'}</td>
                            <td className="px-2.5 py-2">
                              <div className="flex items-center gap-1">
                                <ActionBtn active={action === 'import'} color="green" onClick={() => setAction(i, 'import')}>Importar</ActionBtn>
                                <ActionBtn active={action === 'ignore'} color="gray"  onClick={() => setAction(i, 'ignore')}>Ignorar</ActionBtn>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-t border-t-border bg-t-surface flex-shrink-0">
            <p className="text-xs text-t-muted">
              <strong className="text-t-text">{toImport}</strong> a importar ·{' '}
              <strong className="text-t-text">{toIgnore}</strong> ignoradas
            </p>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-1.5 text-sm text-t-muted hover:text-t-text border border-t-border rounded-lg">
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loadingConfirm}
                className="flex items-center gap-2 px-5 py-1.5 rounded-lg bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {loadingConfirm ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Confirmar importação
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}

// ─── Quick Part Modal ─────────────────────────────────────────────────────────

function QuickPartModal({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState('')
  const [salePrice, setSalePrice]     = useState('')
  const [internalCode, setCode]       = useState('')
  const [mfrCode, setMfrCode]         = useState('')
  const [stock, setStock]             = useState('')
  const [minStock, setMinStock]       = useState('')
  const [category, setCategory]       = useState('')
  const [supplierId, setSupplierId]   = useState('')
  const [suppliers, setSuppliers]     = useState<SupplierItem[]>([])
  const [loading, setLoading]         = useState(false)
  const [saved, setSaved]             = useState(false)
  const [apiError, setApiError]       = useState<string | null>(null)

  useEffect(() => {
    listSuppliers().then(setSuppliers).catch(() => {/* ignore — supplier dropdown is optional */})
  }, [])

  const hint = getCategoryHint(description)
  const canSave = description.trim().length > 0 && salePrice.trim().length > 0

  const handleSave = async () => {
    setLoading(true); setApiError(null)
    try {
      const price = parseFloat(salePrice.replace(',', '.'))
      const code = internalCode.trim() ||
        description.slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '') +
        '-' + Math.floor(100 + Math.random() * 900)

      await createPart({
        internalCode: code,
        description: description.trim(),
        manufacturerCode: mfrCode.trim() || null,
        minimumStock: parseInt(minStock) || 0,
        averageCost: price * 0.65,
        salePrice: price,
        unit: 'UN',
        category: category || null,
        supplierId: supplierId ? parseInt(supplierId) : null,
      })
      setSaved(true)
    } catch (err) {
      setApiError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (saved) {
    return (
      <Modal onClose={onClose}>
        <ModalHeader title="Peça criada" onClose={onClose} />
        <div className="px-6 py-8 text-center">
          <CheckCircle2 size={36} className="mx-auto mb-4 text-green-500" />
          <h3 className="text-base font-semibold text-t-text mb-1">Peça cadastrada com sucesso</h3>
          <p className="text-sm text-t-muted mb-2">
            <strong className="text-t-text">{description}</strong> foi adicionada ao catálogo.
          </p>
          <p className="text-xs text-t-muted mb-6">Você pode completar os dados fiscais e de fornecedor depois.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-t-border text-sm text-t-secondary hover:text-t-text">
              Fechar
            </button>
            <button
              onClick={() => { setSaved(false); setDescription(''); setSalePrice(''); setCode(''); setMfrCode(''); setStock(''); setMinStock(''); setCategory(''); setSupplierId('') }}
              className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-sm font-semibold"
            >
              Cadastrar outra
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Nova Peça Rápida" subtitle="Cadastre os dados essenciais e complete depois." onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {apiError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-500">{apiError}</p>
          </div>
        )}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-t-muted uppercase tracking-widest">Obrigatório</p>
          <div>
            <label className="text-xs font-medium text-t-secondary block mb-1">Descrição *</label>
            <input
              type="text" placeholder="Ex: Filtro de Óleo Tecfil PSL55"
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-t-surface border border-t-border rounded-lg text-t-text placeholder:text-t-muted focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {hint && description.length > 2 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Zap size={10} className="text-blue-500" />
                <span className="text-[10px] text-blue-500">
                  Categoria sugerida: <strong>{hint}</strong>
                  {!category && (
                    <button onClick={() => setCategory(hint)} className="ml-1 underline">aplicar</button>
                  )}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-t-secondary block mb-1">Preço de venda *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-t-muted">R$</span>
              <input
                type="text" placeholder="0,00"
                value={salePrice} onChange={e => setSalePrice(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-t-surface border border-t-border rounded-lg text-t-text placeholder:text-t-muted focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-t-muted uppercase tracking-widest">Opcional</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-t-secondary block mb-1">Código interno</label>
              <input type="text" placeholder="Ex: FIL-001" value={internalCode} onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-t-surface border border-t-border rounded-lg text-t-text placeholder:text-t-muted focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-t-secondary block mb-1">Código fabricante</label>
              <input type="text" placeholder="Ex: PSL55" value={mfrCode} onChange={e => setMfrCode(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-t-surface border border-t-border rounded-lg text-t-text placeholder:text-t-muted focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-t-secondary block mb-1">Estoque atual</label>
              <input type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-t-surface border border-t-border rounded-lg text-t-text placeholder:text-t-muted focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-t-secondary block mb-1">Estoque mínimo</label>
              <input type="number" placeholder="0" value={minStock} onChange={e => setMinStock(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-t-surface border border-t-border rounded-lg text-t-text placeholder:text-t-muted focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-t-secondary block mb-1">Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-t-surface border border-t-border rounded-lg text-t-text focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none">
                <option value="">Selecionar</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-t-secondary block mb-1">Fornecedor</label>
              <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-t-surface border border-t-border rounded-lg text-t-text focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none">
                <option value="">Selecionar</option>
                {suppliers.filter(s => s.status === 'ATIVO').map(s => (
                  <option key={s.id} value={String(s.id)}>{s.tradeName ?? s.corporateName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <p className="text-xs text-t-muted bg-t-surface rounded-lg p-3 border border-t-border">
          Você pode completar códigos, dados fiscais e fornecedor depois na tela de Peças.
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-t-border bg-t-surface flex-shrink-0">
        <button onClick={onClose} className="px-4 py-1.5 text-sm text-t-muted hover:text-t-text border border-t-border rounded-lg">
          Cancelar
        </button>
        <button
          disabled={!canSave || loading}
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-1.5 rounded-lg bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Salvar peça
        </button>
      </div>
    </Modal>
  )
}

// ─── Import history badge ─────────────────────────────────────────────────────

const HIST_STATUS_STYLE = {
  PROCESSADA:      { label: 'Processada',     color: '#22c55e' },
  COM_PENDENCIAS:  { label: 'Com pendências', color: '#f59e0b' },
  CANCELADA:       { label: 'Cancelada',      color: '#6b7280' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ImportPage() {
  const [searchParams] = useSearchParams()
  const open = searchParams.get('open')

  const [showXml, setShowXml]     = useState(open === 'xml')
  const [showSheet, setShowSheet] = useState(open === 'spreadsheet')
  const [showQuick, setShowQuick] = useState(open === 'quick')

  const [history, setHistory]     = useState<ImportHistoryEntry[]>([])
  const [histLoading, setHistLoading] = useState(true)

  useEffect(() => {
    setHistLoading(true)
    listImportHistory()
      .then(setHistory)
      .catch(() => {
        // Fall back to mock data if API is not available
        setHistory(mockImportHistory.map((h, i) => ({
          id: i + 1,
          type: h.type,
          fileName: h.fileName,
          itemsFound: h.itemsFound,
          created: h.created,
          updated: h.updated,
          ignored: h.ignored,
          status: h.status,
          importedAt: h.importedAt,
        })))
      })
      .finally(() => setHistLoading(false))
  }, [showXml, showSheet])

  const METHOD_CARDS = [
    {
      key: 'xml', title: 'XML da NF-e', icon: FileCode, color: '#6366f1',
      description: 'Envie o XML da nota de compra do fornecedor para cadastrar peças automaticamente, atualizar estoque e identificar itens já existentes.',
      btnLabel: 'Importar XML', onClick: () => setShowXml(true),
    },
    {
      key: 'sheet', title: 'Planilha', icon: FileSpreadsheet, color: '#22c55e',
      description: 'Use uma planilha com suas peças para cadastrar vários itens de uma vez. Formatos aceitos: .xlsx e .csv.',
      btnLabel: 'Importar Planilha', onClick: () => setShowSheet(true),
    },
    {
      key: 'quick', title: 'Cadastro rápido', icon: Zap, color: '#f59e0b',
      description: 'Cadastre uma peça manualmente em poucos segundos e complete os dados depois.',
      btnLabel: 'Nova Peça Rápida', onClick: () => setShowQuick(true),
    },
  ]

  return (
    <div className="p-5 max-w-[1280px]">
      <PageHeader
        title="Importar peças"
        subtitle="Cadastre peças automaticamente por XML da nota de compra ou planilha."
        actions={
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowXml(true)} className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-t-border bg-t-card text-[11px] font-medium text-t-secondary hover:text-t-text transition-colors">
              <FileCode size={12} /> Importar XML
            </button>
            <button onClick={() => setShowSheet(true)} className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-t-border bg-t-card text-[11px] font-medium text-t-secondary hover:text-t-text transition-colors">
              <FileSpreadsheet size={12} /> Importar Planilha
            </button>
            <button onClick={() => setShowQuick(true)} className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-gray-900 hover:bg-black dark:bg-t-text dark:text-gray-900 text-white text-[11px] font-semibold transition-colors">
              <Plus size={12} strokeWidth={2.5} /> Nova Peça Rápida
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {METHOD_CARDS.map(card => {
          const Icon = card.icon
          return (
            <div key={card.key} className="relative rounded-xl border border-t-border bg-t-card overflow-hidden p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: card.color }} />
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-t-text">{card.title}</h3>
                  <p className="text-xs text-t-muted mt-1 leading-relaxed">{card.description}</p>
                </div>
              </div>
              <button onClick={card.onClick} className="mt-auto flex items-center gap-1.5 h-8 px-4 rounded-lg border border-t-border bg-t-surface text-xs font-semibold text-t-secondary hover:text-t-text hover:bg-t-card-hover transition-colors self-start">
                <Icon size={12} style={{ color: card.color }} />
                {card.btnLabel}
              </button>
            </div>
          )
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-t-text">Últimas importações</h2>
          <span className="text-xs text-t-muted">{history.length} registros</span>
        </div>
        <div className="rounded-xl border border-t-border overflow-hidden bg-t-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-t-border bg-t-surface">
                {['Tipo','Arquivo','Data','Encontrados','Criados','Atualizados','Ignorados','Status'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-t-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-t-border">
              {histLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center">
                    <Loader2 size={18} className="animate-spin text-t-muted mx-auto" />
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-t-muted">
                    Nenhuma importação registrada ainda.
                  </td>
                </tr>
              ) : history.map((h, i) => {
                const hs = HIST_STATUS_STYLE[h.status as keyof typeof HIST_STATUS_STYLE] ?? HIST_STATUS_STYLE.PROCESSADA
                return (
                  <tr key={h.id} className={i % 2 === 0 ? 'bg-t-card hover:bg-t-card-hover' : 'bg-t-surface hover:bg-t-card-hover'}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {h.type === 'XML_NFE'
                          ? <FileCode size={13} className="text-indigo-500" />
                          : <FileSpreadsheet size={13} className="text-green-600" />}
                        <span className="text-[10px] font-semibold text-t-secondary">
                          {h.type === 'XML_NFE' ? 'XML NF-e' : 'Planilha'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-t-text font-medium max-w-[220px]">
                      <span className="truncate block">{h.fileName}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-t-secondary whitespace-nowrap">{formatDateTime(h.importedAt)}</td>
                    <td className="px-3 py-2.5 text-sm text-t-text font-medium">{h.itemsFound}</td>
                    <td className="px-3 py-2.5 text-sm text-green-600 font-medium">{h.created}</td>
                    <td className="px-3 py-2.5 text-sm text-blue-500 font-medium">{h.updated}</td>
                    <td className="px-3 py-2.5 text-sm text-t-muted">{h.ignored}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${hs.color}15`, color: hs.color }}>
                        {hs.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showXml   && <XmlImportModal         onClose={() => setShowXml(false)} />}
      {showSheet && <SpreadsheetImportModal  onClose={() => setShowSheet(false)} />}
      {showQuick && <QuickPartModal          onClose={() => setShowQuick(false)} />}
    </div>
  )
}
