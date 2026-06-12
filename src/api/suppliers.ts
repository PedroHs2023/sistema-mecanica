import { apiFetch } from './client'

export interface SupplierItem {
  id: number
  corporateName: string
  tradeName: string | null
  document: string
  status: string
}

export function listSuppliers(): Promise<SupplierItem[]> {
  return apiFetch<SupplierItem[]>('/api/suppliers')
}
