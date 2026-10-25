import goOsSource from '../go.os?raw'
import { readStorage, writeStorage } from './storage'

export const WORKSPACE_STORAGE_KEY = 'vs.workspace.v2'
export const SESSION_STORAGE_KEY = 'vs.session.v2'
export const WORD_WRAP_STORAGE_KEY = 'vs.wordWrap'

export type FileNode = {
  type: 'file'
  id: string
  name: string
  content: string
}

export type FolderNode = {
  type: 'folder'
  id: string
  name: string
  children: WorkspaceNode[]
}

export type WorkspaceNode = FileNode | FolderNode

export type Workspace = {
  version: 1
  children: WorkspaceNode[]
}

export type Session = {
  openIds: string[]
  activeId: string | null
  expandedIds: string[]
}

export type Mutation =
  | { ok: true; workspace: Workspace; id: string }
  | { ok: false; error: string }

const WELCOME = `# vs

Go-Orbit-Programmers-Pro
LOCK33 Development Organization's vscode action tool for lock33.dev.

Edit files in the browser. Work is saved in this browser's local storage. Download a file when you want a copy of your own.

## Command menu

Press Ctrl+Shift+P or F1.

- Use light theme
- Use dark theme

The sun and moon control sits at the bottom of the left bar on a wide screen, and at the top right on a phone.

Open \`go.os\` for the Go sample, or \`src/hello.ts\` for the TypeScript sample.
`

const HELLO = `/** Sample file shipped with Go-Orbit-Programmers-Pro / vs. */

export const product = {
  name: 'vs',
  line: 'Go-Orbit-Programmers-Pro',
  org: 'LOCK33 Development Organization',
  site: 'lock33.dev',
}

export function orbitLabel(tool: string): string {
  return \`\${tool} · \${product.org}\`
}

const label = orbitLabel(product.name)
console.log(label)
`

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

export function createSeedWorkspace(): Workspace {
  return {
    version: 1,
    children: [
      { type: 'file', id: 'file-welcome', name: 'welcome.md', content: WELCOME },
      { type: 'file', id: 'file-go-os', name: 'go.os', content: goOsSource },
      {
        type: 'folder',
        id: 'folder-src',
        name: 'src',
        children: [{ type: 'file', id: 'file-hello', name: 'hello.ts', content: HELLO }],
      },
    ],
  }
}

function isNode(value: unknown): value is WorkspaceNode {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.name !== 'string') return false
  if (record.type === 'file') return typeof record.content === 'string'
  if (record.type === 'folder') {
    return Array.isArray(record.children) && record.children.every(isNode)
  }
  return false
}

function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return record.version === 1 && Array.isArray(record.children) && record.children.every(isNode)
}

export function loadWorkspace(): Workspace {
  const raw = readStorage(WORKSPACE_STORAGE_KEY)
  if (!raw) return createSeedWorkspace()
  try {
    const parsed: unknown = JSON.parse(raw)
    return isWorkspace(parsed) ? parsed : createSeedWorkspace()
  } catch {
    return createSeedWorkspace()
  }
}

export function saveWorkspace(workspace: Workspace): boolean {
  return writeStorage(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace))
}

export function findNode(nodes: WorkspaceNode[], id: string): WorkspaceNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.type === 'folder') {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function findParentId(
  nodes: WorkspaceNode[],
  id: string,
  parent: string | null = null,
): string | null | undefined {
  for (const node of nodes) {
    if (node.id === id) return parent
    if (node.type === 'folder') {
      const found = findParentId(node.children, id, node.id)
      if (found !== undefined) return found
    }
  }
  return undefined
}

export function pathFor(nodes: WorkspaceNode[], id: string, prefix = ''): string | null {
  for (const node of nodes) {
    const path = prefix ? `${prefix}/${node.name}` : node.name
    if (node.id === id) return path
    if (node.type === 'folder') {
      const found = pathFor(node.children, id, path)
      if (found) return found
    }
  }
  return null
}

export function listFiles(nodes: WorkspaceNode[], prefix = ''): { id: string; path: string }[] {
  const files: { id: string; path: string }[] = []
  for (const node of nodes) {
    const path = prefix ? `${prefix}/${node.name}` : node.name
    if (node.type === 'file') files.push({ id: node.id, path })
    else files.push(...listFiles(node.children, path))
  }
  return files
}

export function listFolderIds(nodes: WorkspaceNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.type === 'folder') {
      ids.push(node.id, ...listFolderIds(node.children))
    }
  }
  return ids
}

export function fileIdsUnder(node: WorkspaceNode): string[] {
  if (node.type === 'file') return [node.id]
  return node.children.flatMap(fileIdsUnder)
}

export function childrenOf(workspace: Workspace, parentId: string | null): WorkspaceNode[] | null {
  if (parentId === null) return workspace.children
  const node = findNode(workspace.children, parentId)
  if (!node || node.type !== 'folder') return null
  return node.children
}

export function parentForCreate(workspace: Workspace, selectedId: string | null): string | null {
  if (!selectedId) return null
  const node = findNode(workspace.children, selectedId)
  if (!node) return null
  if (node.type === 'folder') return node.id
  return findParentId(workspace.children, selectedId) ?? null
}

export function uniqueName(siblings: WorkspaceNode[], base: string): string {
  const names = new Set(siblings.map((node) => node.name))
  if (!names.has(base)) return base
  const dot = base.lastIndexOf('.')
  const stem = dot > 0 ? base.slice(0, dot) : base
  const ext = dot > 0 ? base.slice(dot) : ''
  let index = 2
  while (names.has(`${stem}-${index}${ext}`)) index += 1
  return `${stem}-${index}${ext}`
}

export function nameError(
  name: string,
  siblings: WorkspaceNode[],
  ignoreId?: string,
): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Enter a name.'
  if (trimmed === '.' || trimmed === '..' || /[\\/]/.test(trimmed)) {
    return 'Use a name without slashes.'
  }
  if (siblings.some((sibling) => sibling.name === trimmed && sibling.id !== ignoreId)) {
    return 'That name is already used in this folder.'
  }
  return null
}

function mapChildren(
  nodes: WorkspaceNode[],
  parentId: string | null,
  update: (children: WorkspaceNode[]) => WorkspaceNode[],
): WorkspaceNode[] {
  if (parentId === null) return update(nodes)
  return nodes.map((node) => {
    if (node.type !== 'folder') return node
    if (node.id === parentId) return { ...node, children: update(node.children) }
    return { ...node, children: mapChildren(node.children, parentId, update) }
  })
}

export function updateFileContent(workspace: Workspace, id: string, content: string): Workspace {
  const replace = (nodes: WorkspaceNode[]): WorkspaceNode[] =>
    nodes.map((node) => {
      if (node.id === id && node.type === 'file') return { ...node, content }
      if (node.type === 'folder') return { ...node, children: replace(node.children) }
      return node
    })
  return { ...workspace, children: replace(workspace.children) }
}

export function createNode(
  workspace: Workspace,
  parentId: string | null,
  kind: 'file' | 'folder',
  name: string,
): Mutation {
  const siblings = childrenOf(workspace, parentId)
  if (!siblings) return { ok: false, error: 'Choose a folder first.' }
  const error = nameError(name, siblings)
  if (error) return { ok: false, error }
  const id = createId()
  const node: WorkspaceNode =
    kind === 'file'
      ? { type: 'file', id, name: name.trim(), content: '' }
      : { type: 'folder', id, name: name.trim(), children: [] }
  return {
    ok: true,
    id,
    workspace: {
      ...workspace,
      children: mapChildren(workspace.children, parentId, (children) => [...children, node]),
    },
  }
}

export function renameNode(workspace: Workspace, id: string, name: string): Mutation {
  const parentId = findParentId(workspace.children, id)
  if (parentId === undefined) return { ok: false, error: 'That item is no longer in the workspace.' }
  const siblings = childrenOf(workspace, parentId)
  if (!siblings) return { ok: false, error: 'That item is no longer in the workspace.' }
  const error = nameError(name, siblings, id)
  if (error) return { ok: false, error }
  const trimmed = name.trim()
  const replace = (nodes: WorkspaceNode[]): WorkspaceNode[] =>
    nodes.map((node) => {
      if (node.id === id) return { ...node, name: trimmed }
      if (node.type === 'folder') return { ...node, children: replace(node.children) }
      return node
    })
  return { ok: true, id, workspace: { ...workspace, children: replace(workspace.children) } }
}

export function deleteNode(workspace: Workspace, id: string): Workspace {
  const remove = (nodes: WorkspaceNode[]): WorkspaceNode[] =>
    nodes
      .filter((node) => node.id !== id)
      .map((node) => (node.type === 'folder' ? { ...node, children: remove(node.children) } : node))
  return { ...workspace, children: remove(workspace.children) }
}

export function defaultSession(workspace: Workspace): Session {
  const files = listFiles(workspace.children)
  const hello = files.find((file) => file.path === 'src/hello.ts')
  const goOs = files.find((file) => file.path === 'go.os')
  const welcome = files.find((file) => file.path === 'welcome.md')
  const openIds = [welcome?.id, goOs?.id, hello?.id].filter((id): id is string => Boolean(id))
  return {
    openIds,
    activeId: goOs?.id ?? hello?.id ?? welcome?.id ?? files[0]?.id ?? null,
    expandedIds: listFolderIds(workspace.children),
  }
}

export function loadSession(workspace: Workspace): Session {
  const fallback = defaultSession(workspace)
  const raw = readStorage(SESSION_STORAGE_KEY)
  if (!raw) return fallback
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    const record = parsed as Partial<Session>
    const fileIds = new Set(listFiles(workspace.children).map((file) => file.id))
    const folderIds = new Set(listFolderIds(workspace.children))
    const openIds = Array.isArray(record.openIds)
      ? record.openIds.filter((id): id is string => typeof id === 'string' && fileIds.has(id))
      : fallback.openIds
    const activeId =
      typeof record.activeId === 'string' && fileIds.has(record.activeId)
        ? record.activeId
        : (openIds[0] ?? null)
    const expandedIds = Array.isArray(record.expandedIds)
      ? record.expandedIds.filter((id): id is string => typeof id === 'string' && folderIds.has(id))
      : fallback.expandedIds
    const withActive = activeId && !openIds.includes(activeId) ? [...openIds, activeId] : openIds
    return { openIds: withActive, activeId, expandedIds }
  } catch {
    return fallback
  }
}

export function saveSession(session: Session): boolean {
  return writeStorage(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function readWordWrap(): boolean | null {
  const value = readStorage(WORD_WRAP_STORAGE_KEY)
  if (value === 'on') return true
  if (value === 'off') return false
  return null
}

export function writeWordWrap(enabled: boolean): boolean {
  return writeStorage(WORD_WRAP_STORAGE_KEY, enabled ? 'on' : 'off')
}
