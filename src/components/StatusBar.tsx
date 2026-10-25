type StatusBarProps = {
  path: string | null
  language: string
  line: number
  column: number
  themeLabel: string
  message: string
}

export function StatusBar({ path, language, line, column, themeLabel, message }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <span className="status-message">{message}</span>
      <span className="status-path">{path ?? 'No file open'}</span>
      <span className="status-spacer" />
      <span>
        Ln {line}, Col {column}
      </span>
      <span>{language}</span>
      <span className="status-theme">{themeLabel}</span>
      <span className="status-product">Go-Orbit-Programmers-Pro</span>
    </footer>
  )
}
