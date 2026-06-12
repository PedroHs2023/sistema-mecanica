const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  }).catch(() => {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8080.')
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? `Erro ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
  }).catch(() => {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8080.')
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? `Erro ${res.status}`)
  }

  return res.json() as Promise<T>
}
