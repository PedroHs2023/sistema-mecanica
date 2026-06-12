import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  iconRight?: ReactNode
}

export function Input({ label, error, icon, iconRight, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[12px] font-medium text-dark-text-secondary">{label}</label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-2.5 text-dark-text-muted pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          className={cn(
            'w-full h-8 bg-white/6 border border-white/10 rounded-md',
            'text-[13px] text-dark-text placeholder:text-dark-text-muted',
            'focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50',
            'transition-colors duration-150',
            icon ? 'pl-8' : 'pl-3',
            iconRight ? 'pr-8' : 'pr-3',
            error && 'border-danger/50 focus:ring-danger/50',
            className,
          )}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-2.5 text-dark-text-muted pointer-events-none flex items-center">
            {iconRight}
          </span>
        )}
      </div>
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </div>
  )
}

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

export function SearchInput({ className, onClear, ...props }: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <svg
        className="absolute left-2.5 w-3.5 h-3.5 text-dark-text-muted pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        className={cn(
          'h-8 bg-white/6 border border-white/10 rounded-md',
          'text-[13px] text-dark-text placeholder:text-dark-text-muted',
          'focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50',
          'pl-8 pr-3 transition-colors duration-150',
          className,
        )}
        {...props}
      />
    </div>
  )
}
