import { Bell, Plus, Search, Settings, ChevronRight, Sun, Moon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'

const BREADCRUMB_MAP: Record<string, string> = {
  '': 'Dashboard', 'dashboard': 'Dashboard',
  'ordens-servico': 'Ordens de Serviço', 'clientes': 'Clientes',
  'veiculos': 'Veículos', 'agenda': 'Agenda', 'estoque': 'Estoque',
  'pecas': 'Peças', 'fornecedores': 'Fornecedores', 'compras': 'Compras',
  'financeiro': 'Financeiro', 'usuarios': 'Usuários', 'configuracoes': 'Configurações',
}

function useBreadcrumbs() {
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)
  if (parts.length === 0) return [{ label: 'Dashboard', path: '/dashboard' }]
  return parts.map((part, i) => {
    const path = '/' + parts.slice(0, i + 1).join('/')
    const isId = /^(os\d|[0-9a-f]{8})/.test(part)
    return { label: isId ? `OS #${part}` : (BREADCRUMB_MAP[part] ?? part), path }
  })
}

interface TopbarProps {
  sidebarWidth?: number
  theme?: 'light' | 'dark'
  onThemeToggle?: () => void
}

export function Topbar({ sidebarWidth = 220, theme = 'light', onThemeToggle }: TopbarProps) {
  const breadcrumbs = useBreadcrumbs()
  const isDark = theme === 'dark'

  return (
    <header
      className="fixed top-0 right-0 z-10 flex items-center justify-between h-[44px] px-4 bg-t-topbar border-b border-t-border"
      style={{ left: sidebarWidth }}
    >
      {/* ── Left ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[11px] leading-none">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={10} className="text-t-muted flex-shrink-0" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-t-text">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="text-t-muted hover:text-t-secondary transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Search */}
        <div className="relative hidden md:flex items-center ml-1">
          <Search size={12} className="absolute left-2.5 text-t-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar placa, cliente ou OS..."
            className={cn(
              'h-[28px] w-52 lg:w-64 rounded-md border border-t-border bg-t-surface',
              'text-[11px] text-t-text placeholder:text-t-muted',
              'focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40',
              'pl-7 pr-8 transition-all duration-200',
            )}
          />
          <kbd className="absolute right-2 text-[9px] text-t-muted bg-t-surface border border-t-border rounded px-1 py-0.5 leading-none hidden lg:block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Right ─────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <TopbarBtn aria-label="Notificações">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-accent" />
        </TopbarBtn>

        {/* Theme toggle */}
        <TopbarBtn onClick={onThemeToggle} aria-label="Alternar tema">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </TopbarBtn>

        <TopbarBtn aria-label="Configurações">
          <Settings size={14} />
        </TopbarBtn>

        <div className="w-px h-3.5 bg-t-border mx-1.5" />

        {/* Avatar */}
        <button className="flex items-center gap-1.5 h-7 pl-1 pr-2 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors">
          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-[9px] font-bold text-accent leading-none">A</span>
          </div>
          <span className="text-[11px] font-medium text-t-secondary hidden lg:block">Admin</span>
        </button>

        <div className="w-px h-3.5 bg-t-border mx-1.5" />

        {/* Nova OS */}
        <Link to="/ordens-servico">
          <button className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-gray-900 hover:bg-black dark:bg-t-text dark:hover:bg-white dark:text-gray-900 text-white text-[11px] font-semibold transition-colors shadow-sm">
            <Plus size={12} strokeWidth={2.5} />
            Nova OS
          </button>
        </Link>
      </div>
    </header>
  )
}

function TopbarBtn({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="relative w-7 h-7 rounded-md flex items-center justify-center text-t-muted hover:text-t-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
      {...props}
    >
      {children}
    </button>
  )
}
