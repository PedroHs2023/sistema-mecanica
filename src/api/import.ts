import { apiFetch, apiUpload } from './client'
import type { ImportItemStatus } from '../types'

// ─── Preview types ────────────────────────────────────────────────────────────

export interface NfePreviewItem {
  supplierCode: string
  description: string
  ncm: string | null
  cfop: string | null
  unit: string
  quantity: number
  unitCost: number
  totalCost: number
  suggestedSalePrice: number
  marginPercent: number
  status: ImportItemStatus
  possibleMatchPartId: number | null
  possibleMatchDescription: string | null
}

export interface NfePreviewResponse {
  invoiceNumber: string
  series: string
  accessKey: string | null
  supplierName: string
  supplierDocument: string
  issueDate: string
  totalValue: number
  items: NfePreviewItem[]
}

export interface SheetPreviewItem {
  description: string | null
  internalCode: string | null
  manufacturerCode: string | null
  currentStock: number | null
  averageCost: number | null
  salePrice: number | null
  supplierName: string | null
  ncm: string | null
  status: ImportItemStatus
  reason: string | null
}

export interface SheetPreviewResponse {
  fileName: string
  totalRows: number
  readyCount: number
  duplicateCount: number
  incompleteCount: number
  items: SheetPreviewItem[]
}

// ─── Confirm types ────────────────────────────────────────────────────────────

export interface NfeConfirmItem {
  supplierCode: string
  description: string
  ncm: string | null
  cfop: string | null
  unit: string
  quantity: number
  unitCost: number
  suggestedSalePrice: number
  action: 'create' | 'update' | 'link' | 'ignore'
  existingPartId: number | null
}

export interface NfeConfirmRequest {
  fileName: string
  supplierDocument: string
  supplierName: string
  invoiceNumber: string
  issueDate: string
  totalValue: number
  items: NfeConfirmItem[]
}

export interface ImportResult {
  itemsFound: number
  created: number
  updated: number
  ignored: number
  status: string
  message: string
}

export interface ImportHistoryEntry {
  id: number
  type: string
  fileName: string
  itemsFound: number
  created: number
  updated: number
  ignored: number
  status: string
  importedAt: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

export function previewXmlImport(file: File): Promise<NfePreviewResponse> {
  const fd = new FormData()
  fd.append('file', file)
  return apiUpload<NfePreviewResponse>('/api/import/xml/preview', fd)
}

export function confirmXmlImport(req: NfeConfirmRequest): Promise<ImportResult> {
  return apiFetch<ImportResult>('/api/import/xml/confirm', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

export function previewSpreadsheetImport(file: File): Promise<SheetPreviewResponse> {
  const fd = new FormData()
  fd.append('file', file)
  return apiUpload<SheetPreviewResponse>('/api/import/spreadsheet/preview', fd)
}

export function confirmSpreadsheetImport(file: File): Promise<ImportResult> {
  const fd = new FormData()
  fd.append('file', file)
  return apiUpload<ImportResult>('/api/import/spreadsheet/confirm', fd)
}

export function listImportHistory(): Promise<ImportHistoryEntry[]> {
  return apiFetch<ImportHistoryEntry[]>('/api/import/history')
}
