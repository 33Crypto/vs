import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { THEME_STORAGE_KEY } from './theme'

vi.mock('./components/EditorSurface', () => ({
  EditorSurface: ({ theme, path }: { theme: string; path: string | null }) => (
    <div data-testid="editor-surface" data-theme={theme} data-path={path ?? ''} />
  ),
}))

describe('App', () => {
  it('switches the shell and the editor surface, and remembers the choice', () => {
    render(<App />)

    const editor = screen.getByTestId('editor-surface')
    expect(editor.getAttribute('data-theme')).toBe('dark')
    expect(editor.getAttribute('data-path')).toBe('src/hello.ts')
    expect(screen.getAllByText('hello.ts').length).toBeGreaterThan(0)
    expect(document.documentElement.dataset.theme).toBe('dark')

    const activityToggle = screen.getByTestId('theme-toggle-activity')
    const topToggle = screen.getByTestId('theme-toggle-top')
    expect(activityToggle.getAttribute('aria-label')).toBe('Use light theme')
    expect(topToggle.getAttribute('aria-label')).toBe('Use light theme')

    fireEvent.click(activityToggle)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(screen.getByTestId('editor-surface').getAttribute('data-theme')).toBe('light')

    fireEvent.click(screen.getByRole('button', { name: 'Command menu' }))
    const palette = screen.getByRole('dialog', { name: 'Command menu' })
    expect(within(palette).getByRole('option', { name: 'Use light theme' })).toBeTruthy()
    fireEvent.click(within(palette).getByRole('option', { name: 'Use dark theme' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(screen.getByTestId('editor-surface').getAttribute('data-theme')).toBe('dark')
    expect(screen.queryByRole('dialog', { name: 'Command menu' })).toBeNull()
  })

  it('uses the top-right toggle the same way', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('theme-toggle-top'))
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(screen.getByTestId('editor-surface').getAttribute('data-theme')).toBe('light')
  })
})
