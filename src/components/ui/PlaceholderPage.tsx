import type { ReactNode } from 'react'
import { Construction } from 'lucide-react'
import { PageHeader } from '../layout/PageHeader'

interface PlaceholderPageProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  actions?: ReactNode
}

export function PlaceholderPage({ title, subtitle, icon, actions }: PlaceholderPageProps) {
  return (
    <div className="p-5">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      <div className="rounded-lg border border-dashed border-t-border flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-xl bg-t-surface border border-t-border flex items-center justify-center text-t-muted">
          {icon ?? <Construction size={20} strokeWidth={1.5} />}
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-t-secondary mb-1">Em desenvolvimento</p>
          <p className="text-[11px] text-t-muted max-w-xs leading-relaxed">
            Esta funcionalidade estará disponível em breve. Estrutura e design system já estão prontos.
          </p>
        </div>
        <span className="text-[10px] font-medium bg-accent/[0.12] text-accent border border-accent/20 rounded-full px-3 py-1 mt-1">
          Próxima Sprint
        </span>
      </div>
    </div>
  )
}
