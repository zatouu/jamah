type IconProps = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function SearchIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

/** Flèche « suivant » — inversée automatiquement en RTL. */
export function ArrowIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg {...base} className={`${className} rtl:-scale-x-100`}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function MenuIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}
