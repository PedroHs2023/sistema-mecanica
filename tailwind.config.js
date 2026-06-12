/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Semantic theme tokens (CSS variable-backed) ──────────────
        // These update automatically when .dark is toggled on <html>.
        // Use bg-t-bg, text-t-text, border-t-border, etc.
        t: {
          bg:         'var(--bg)',
          sidebar:    'var(--sidebar)',
          topbar:     'var(--topbar)',
          card:       'var(--card)',
          surface:    'var(--surface)',
          'card-hover': 'var(--card-hover)',
          border:     'var(--border)',
          'border-strong': 'var(--border-strong)',
          text:       'var(--text)',
          secondary:  'var(--text-secondary)',
          muted:      'var(--text-muted)',
          accent:     'var(--accent)',
        },
        // ── Static brand palette ─────────────────────────────────────
        accent:  { DEFAULT: '#F97316', hover: '#EA580C' },
        success: '#16A34A',
        danger:  '#EF4444',
        warning: '#B45309',
        info:    '#2563EB',
        violet:  '#7C3AED',
      },
      boxShadow: {
        'card':     '0 1px 2px 0 rgba(0,0,0,0.06), 0 1px 3px 0 rgba(0,0,0,0.04)',
        'card-md':  '0 2px 8px 0 rgba(0,0,0,0.08), 0 1px 3px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10)',
      },
      animation: {
        'fade-in':  'fadeIn 0.12s ease-out',
        'slide-up': 'slideUp 0.15s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
