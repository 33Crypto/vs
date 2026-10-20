import { themeCommandLabel, type ThemeName } from '../theme'
import { MoonIcon, SunIcon } from './icons'

type ThemeToggleProps = {
  theme: ThemeName
  onToggle: () => void
  className: string
  testId: string
}

export function ThemeToggle({ theme, onToggle, className, testId }: ThemeToggleProps) {
  const next: ThemeName = theme === 'dark' ? 'light' : 'dark'
  const label = themeCommandLabel(next)
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      aria-label={label}
      title={label}
      data-testid={testId}
      onClick={onToggle}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
