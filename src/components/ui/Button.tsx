import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gray-900 text-white hover:bg-black dark:bg-t-text dark:text-gray-900 font-semibold',
  secondary:
    'bg-t-card border border-t-border text-t-secondary hover:border-t-border-strong hover:text-t-text',
  ghost:
    'text-t-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-t-text',
  danger:
    'bg-danger/[0.08] border border-danger/30 text-danger hover:bg-danger/[0.15]',
  success:
    'bg-success/[0.08] border border-success/30 text-success hover:bg-success/[0.15]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs rounded-md gap-1.5',
  md: 'h-8 px-3 text-[13px] rounded-md gap-2',
  lg: 'h-9 px-4 text-sm rounded-lg gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
  variant?: ButtonVariant
  children: ReactNode
  tooltip?: string
}

export function IconButton({
  size = 'md',
  variant = 'ghost',
  children,
  className,
  ...props
}: IconButtonProps) {
  const sizeMap = { sm: 'w-7 h-7', md: 'w-8 h-8', lg: 'w-9 h-9' }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
