import { afterEach, describe, expect, it } from 'vitest'
import {
  DARK_THEME_COMMAND,
  LIGHT_THEME_COMMAND,
  THEME_STORAGE_KEY,
  applyTheme,
  monacoThemeId,
  readStoredTheme,
  resolveInitialTheme,
  storeTheme,
  systemTheme,
  themeCommandLabel,
} from './theme'

describe('theme', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('stores and reads light and dark', () => {
    expect(storeTheme('light')).toBe(true)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(readStoredTheme()).toBe('light')
    storeTheme('dark')
    expect(readStoredTheme()).toBe('dark')
  })

  it('ignores unknown stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia')
    expect(readStoredTheme()).toBeNull()
  })

  it('prefers the stored choice over the system theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    expect(systemTheme()).toBe('dark')
    expect(resolveInitialTheme()).toBe('light')
  })

  it('uses the system theme when nothing is stored', () => {
    expect(resolveInitialTheme()).toBe('dark')
  })

  it('maps editor themes and command labels', () => {
    expect(monacoThemeId('dark')).toBe('vs-orbit-dark')
    expect(monacoThemeId('light')).toBe('vs-orbit-light')
    expect(themeCommandLabel('light')).toBe(LIGHT_THEME_COMMAND)
    expect(themeCommandLabel('dark')).toBe(DARK_THEME_COMMAND)
    expect(LIGHT_THEME_COMMAND).toBe('Use light theme')
    expect(DARK_THEME_COMMAND).toBe('Use dark theme')
  })

  it('applies the theme to the document', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
    applyTheme('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(meta.getAttribute('content')).toBe('#e8eaef')
    meta.remove()
  })
})
