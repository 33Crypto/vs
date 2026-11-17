import { readStorage, writeStorage } from './storage'

export type ThemeName = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'vs.theme'
export const LIGHT_THEME_COMMAND = 'Use light theme'
export const DARK_THEME_COMMAND = 'Use dark theme'

const THEME_COLOR: Record<ThemeName, string> = {
  dark: '#111318',
  light: '#e8eaef',
}

export function isThemeName(value: string | null): value is ThemeName {
  return value === 'light' || value === 'dark'
}

export function readStoredTheme(): ThemeName | null {
  const value = readStorage(THEME_STORAGE_KEY)
  return isThemeName(value) ? value : null
}

export function storeTheme(theme: ThemeName): boolean {
  return writeStorage(THEME_STORAGE_KEY, theme)
}

export function systemTheme(): ThemeName {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function resolveInitialTheme(): ThemeName {
  return readStoredTheme() ?? systemTheme()
}

export function monacoThemeId(theme: ThemeName): 'vs-orbit-dark' | 'vs-orbit-light' {
  return theme === 'dark' ? 'vs-orbit-dark' : 'vs-orbit-light'
}

export function themeCommandLabel(theme: ThemeName): string {
  return theme === 'light' ? LIGHT_THEME_COMMAND : DARK_THEME_COMMAND
}

export function applyTheme(theme: ThemeName): void {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLOR[theme])
}
