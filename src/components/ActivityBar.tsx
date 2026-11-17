import type { ThemeName } from '../theme'
import { CommandIcon, FilesIcon, OrbitMark } from './icons'
import { ThemeToggle } from './ThemeToggle'

type ActivityBarProps = {
  theme: ThemeName
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onOpenCommands: () => void
  onToggleTheme: () => void
}

export function ActivityBar({
  theme,
  sidebarOpen,
  onToggleSidebar,
  onOpenCommands,
  onToggleTheme,
}: ActivityBarProps) {
  return (
    <nav className="activity-bar" aria-label="Activity">
      <div className="activity-mark" title="vs">
        <OrbitMark />
      </div>
      <button
        type="button"
        className={sidebarOpen ? 'activity-button active' : 'activity-button'}
        aria-label="Explorer"
        aria-pressed={sidebarOpen}
        title="Explorer"
        onClick={onToggleSidebar}
      >
        <FilesIcon />
      </button>
      <button
        type="button"
        className="activity-button"
        aria-label="Command menu"
        title="Command menu"
        onClick={onOpenCommands}
      >
        <CommandIcon />
      </button>
      <div className="activity-spacer" />
      <ThemeToggle
        theme={theme}
        onToggle={onToggleTheme}
        className="theme-toggle-activity"
        testId="theme-toggle-activity"
      />
    </nav>
  )
}
