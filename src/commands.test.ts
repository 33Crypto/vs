import { describe, expect, it, vi } from 'vitest'
import { buildCommands, filterCommands } from './commands'
import { DARK_THEME_COMMAND, LIGHT_THEME_COMMAND, type ThemeName } from './theme'
import { createSeedWorkspace } from './workspace'

function context() {
  const setTheme = vi.fn<(theme: ThemeName) => void>()
  const openFile = vi.fn<(id: string) => void>()
  const commands = buildCommands({
    workspace: createSeedWorkspace(),
    setTheme,
    toggleSidebar: vi.fn(),
    toggleWordWrap: vi.fn(),
    requestNewFile: vi.fn(),
    requestNewFolder: vi.fn(),
    requestRename: vi.fn(),
    requestDelete: vi.fn(),
    downloadActive: vi.fn(),
    requestReset: vi.fn(),
    openFile,
  })
  return { commands, setTheme, openFile }
}

describe('commands', () => {
  it('includes the theme commands with the required labels', () => {
    const { commands, setTheme } = context()
    const labels = commands.map((command) => command.label)
    expect(labels).toContain(LIGHT_THEME_COMMAND)
    expect(labels).toContain(DARK_THEME_COMMAND)
    expect(labels).toContain('Use light theme')
    expect(labels).toContain('Use dark theme')

    commands.find((command) => command.label === 'Use light theme')?.run()
    commands.find((command) => command.label === 'Use dark theme')?.run()
    expect(setTheme).toHaveBeenNthCalledWith(1, 'light')
    expect(setTheme).toHaveBeenNthCalledWith(2, 'dark')
  })

  it('filters by label and lists workspace files', () => {
    const { commands, openFile } = context()
    expect(filterCommands(commands, 'theme').map((command) => command.label)).toEqual([
      'Use light theme',
      'Use dark theme',
    ])
    const openHello = filterCommands(commands, 'hello.ts').find((command) =>
      command.label.startsWith('Open '),
    )
    openHello?.run()
    expect(openFile).toHaveBeenCalledWith('file-hello')
  })
})
