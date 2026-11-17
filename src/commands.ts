import { DARK_THEME_COMMAND, LIGHT_THEME_COMMAND, type ThemeName } from './theme'
import { listFiles, type Workspace } from './workspace'

export type Command = {
  id: string
  label: string
  shortcut?: string
  run: () => void
}

export type CommandContext = {
  workspace: Workspace
  setTheme: (theme: ThemeName) => void
  toggleSidebar: () => void
  toggleWordWrap: () => void
  requestNewFile: () => void
  requestNewFolder: () => void
  requestRename: () => void
  requestDelete: () => void
  downloadActive: () => void
  requestReset: () => void
  openFile: (id: string) => void
}

export function buildCommands(context: CommandContext): Command[] {
  const openCommands = listFiles(context.workspace.children).map((file) => ({
    id: `open.${file.id}`,
    label: `Open ${file.path}`,
    run: () => context.openFile(file.id),
  }))

  return [
    {
      id: 'theme.light',
      label: LIGHT_THEME_COMMAND,
      run: () => context.setTheme('light'),
    },
    {
      id: 'theme.dark',
      label: DARK_THEME_COMMAND,
      run: () => context.setTheme('dark'),
    },
    { id: 'file.new', label: 'New File', run: context.requestNewFile },
    { id: 'file.newFolder', label: 'New Folder', run: context.requestNewFolder },
    { id: 'file.rename', label: 'Rename', run: context.requestRename },
    { id: 'file.delete', label: 'Delete', run: context.requestDelete },
    { id: 'file.download', label: 'Download File', run: context.downloadActive },
    { id: 'view.sidebar', label: 'Toggle Sidebar', shortcut: 'Ctrl+B', run: context.toggleSidebar },
    { id: 'view.wordWrap', label: 'Toggle Word Wrap', run: context.toggleWordWrap },
    { id: 'workspace.reset', label: 'Reset Sample Workspace', run: context.requestReset },
    ...openCommands,
  ]
}

export function filterCommands(commands: Command[], query: string): Command[] {
  const needle = query.trim().toLowerCase()
  const matched = needle
    ? commands.filter(
        (command) =>
          command.label.toLowerCase().includes(needle) || command.id.toLowerCase().includes(needle),
      )
    : commands
  return matched.slice(0, 50)
}
