import { cn } from '../../lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

const AVATAR_COLORS: [string, string][] = [
  ['rgba(37,99,235,0.15)',  '#2563EB'],
  ['rgba(124,58,237,0.15)', '#7C3AED'],
  ['rgba(22,163,74,0.15)',  '#16A34A'],
  ['rgba(234,88,12,0.15)',  '#EA580C'],
  ['rgba(219,39,119,0.15)', '#DB2777'],
  ['rgba(8,145,178,0.15)',  '#0891B2'],
]

function getAvatarStyle(initials: string): { backgroundColor: string; color: string } {
  const [bg, text] = AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length]
  return { backgroundColor: bg, color: text }
}

interface AvatarProps {
  initials: string
  avatarUrl?: string
  size?: AvatarSize
  className?: string
}

export function Avatar({ initials, avatarUrl, size = 'sm', className }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={initials}
        className={cn('rounded-full object-cover flex-shrink-0', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0 uppercase',
        sizeClasses[size],
        className,
      )}
      style={getAvatarStyle(initials)}
    >
      {initials.slice(0, 2)}
    </div>
  )
}
