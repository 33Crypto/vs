type IconProps = { className?: string }

export function OrbitMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="8.4" r="1.7" fill="currentColor" />
    </svg>
  )
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg className={className ?? 'icon'} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3v2.1M12 18.9V21M3 12h2.1M18.9 12H21M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className ?? 'icon'} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15.2 3.6a7.4 7.4 0 1 0 5.2 11.6A6.6 6.6 0 0 1 15.2 3.6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FilesIcon({ className }: IconProps) {
  return (
    <svg className={className ?? 'icon'} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6.5A1.5 1.5 0 0 1 5.5 5h4l1.6 1.8H18.5A1.5 1.5 0 0 1 20 8.3v9.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CommandIcon({ className }: IconProps) {
  return (
    <svg className={className ?? 'icon'} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 8h8v8H8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9.2 4.8h.6A1.6 1.6 0 0 1 11.4 6.4V8H9.2A1.6 1.6 0 0 1 7.6 6.4v-.6c0-.9.7-1.6 1.6-1.6zM14.6 4.8h.6c.9 0 1.6.7 1.6 1.6v.6A1.6 1.6 0 0 1 15.2 8h-2.2V6.4a1.6 1.6 0 0 1 1.6-1.6zM9.2 16h2.2v1.6a1.6 1.6 0 0 1-1.6 1.6h-.6A1.6 1.6 0 0 1 7.6 18v-.6c0-.9.7-1.6 1.6-1.6zM14.6 16h.6c.9 0 1.6.7 1.6 1.6v.6a1.6 1.6 0 0 1-1.6 1.6h-.6a1.6 1.6 0 0 1-1.6-1.6V16z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className ?? 'icon icon-sm'} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronIcon({ className, open }: IconProps & { open: boolean }) {
  return (
    <svg className={className ?? 'icon icon-sm'} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={open ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg className={className ?? 'icon'} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
