import { apiFetch } from './client'

export interface PartCreateRequest {
  internalCode: string
  description: string
  manufacturerCode?: string | null
  minimumStock?: number
  averageCost: number
  salePrice: number
  unit: string
  category?: string | null
  barcode?: string | null
  location?: string | null
  ncm?: string | null
  supplierId?: number | null
}

export interface PartItem {
  id: number
  internalCode: string
  description: string
  currentStock: number
  averageCost: number
  salePrice: number
  status: string
  category: string | null
  supplierName: string | null
}

export function createPart(req: PartCreateRequest): Promise<PartItem> {
  return apiFetch<PartItem>('/api/parts', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

export function listParts(params?: { q?: string; status?: string; category?: string }): Promise<PartItem[]> {
  const qs = new URLSearchParams()
  if (params?.q)        qs.set('q', params.q)
  if (params?.status)   qs.set('status', params.status)
  if (params?.category) qs.set('category', params.category)
  const query = qs.toString() ? `?${qs}` : ''
  return apiFetch<PartItem[]>(`/api/parts${query}`)
}
