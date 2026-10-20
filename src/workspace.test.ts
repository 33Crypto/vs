import { describe, expect, it } from 'vitest'
import {
  createNode,
  createSeedWorkspace,
  deleteNode,
  fileIdsUnder,
  listFiles,
  loadSession,
  loadWorkspace,
  nameError,
  parentForCreate,
  renameNode,
  saveSession,
  saveWorkspace,
  updateFileContent,
} from './workspace'

describe('workspace', () => {
  it('seeds a welcome file and a TypeScript sample', () => {
    const workspace = createSeedWorkspace()
    const files = listFiles(workspace.children)
    expect(files.map((file) => file.path)).toEqual(['welcome.md', 'src/hello.ts'])
    expect(files[0]?.path).toBe('welcome.md')
    expect(workspace.children[0]?.type === 'file' && workspace.children[0].content).toContain(
      'lock33.dev',
    )
  })

  it('round-trips through local storage', () => {
    const original = createSeedWorkspace()
    expect(saveWorkspace(original)).toBe(true)
    const loaded = loadWorkspace()
    expect(listFiles(loaded.children).map((file) => file.path)).toEqual([
      'welcome.md',
      'src/hello.ts',
    ])
  })

  it('falls back when storage is corrupt', () => {
    localStorage.setItem('vs.workspace.v1', '{')
    expect(listFiles(loadWorkspace().children)).toHaveLength(2)
  })

  it('creates, renames, updates, and deletes', () => {
    let workspace = createSeedWorkspace()
    const created = createNode(workspace, 'folder-src', 'file', 'notes.txt')
    expect(created.ok).toBe(true)
    if (!created.ok) return
    workspace = created.workspace
    expect(listFiles(workspace.children).map((file) => file.path)).toContain('src/notes.txt')

    const renamed = renameNode(workspace, created.id, 'notes.md')
    expect(renamed.ok).toBe(true)
    if (!renamed.ok) return
    workspace = renamed.workspace
    expect(listFiles(workspace.children).map((file) => file.path)).toContain('src/notes.md')

    workspace = updateFileContent(workspace, created.id, 'hello')
    const file = listFiles(workspace.children).find((entry) => entry.id === created.id)
    expect(file?.path).toBe('src/notes.md')
    const node = workspace.children
      .find((entry) => entry.type === 'folder' && entry.id === 'folder-src')
    const content =
      node?.type === 'folder'
        ? node.children.find((entry) => entry.id === created.id)
        : undefined
    expect(content?.type === 'file' && content.content).toBe('hello')

    const folder = workspace.children.find((entry) => entry.id === 'folder-src')
    expect(folder).toBeTruthy()
    if (!folder) return
    expect(fileIdsUnder(folder)).toContain(created.id)
    workspace = deleteNode(workspace, 'folder-src')
    expect(listFiles(workspace.children).map((entry) => entry.path)).toEqual(['welcome.md'])
  })

  it('rejects duplicate and empty names', () => {
    const workspace = createSeedWorkspace()
    const siblings = workspace.children
    expect(nameError('  ', siblings)).toBe('Enter a name.')
    expect(nameError('a/b', siblings)).toBe('Use a name without slashes.')
    expect(nameError('welcome.md', siblings)).toBe('That name is already used in this folder.')
    expect(createNode(workspace, 'folder-src', 'file', 'hello.ts').ok).toBe(false)
  })

  it('places new files in the selected folder or the parent of a file', () => {
    const workspace = createSeedWorkspace()
    expect(parentForCreate(workspace, 'folder-src')).toBe('folder-src')
    expect(parentForCreate(workspace, 'file-hello')).toBe('folder-src')
    expect(parentForCreate(workspace, 'file-welcome')).toBeNull()
  })

  it('restores a valid session and drops missing ids', () => {
    const workspace = createSeedWorkspace()
    saveSession({
      openIds: ['file-hello', 'missing'],
      activeId: 'file-hello',
      expandedIds: ['folder-src', 'gone'],
    })
    expect(loadSession(workspace)).toEqual({
      openIds: ['file-hello'],
      activeId: 'file-hello',
      expandedIds: ['folder-src'],
    })
  })
})
