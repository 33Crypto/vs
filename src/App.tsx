import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityBar } from './components/ActivityBar'
import { CommandPalette } from './components/CommandPalette'
import { ConfirmDialog, NameDialog } from './components/Dialogs'
import { EditorSurface } from './components/EditorSurface'
import { CloseIcon, MenuIcon, OrbitMark } from './components/icons'
import { Sidebar } from './components/Sidebar'
import { StatusBar } from './components/StatusBar'
import { ThemeToggle } from './components/ThemeToggle'
import { buildCommands } from './commands'
import { downloadText } from './download'
import { languageForPath, languageLabel } from './language'
import { applyTheme, resolveInitialTheme, storeTheme, type ThemeName } from './theme'
import {
  childrenOf,
  createNode,
  createSeedWorkspace,
  defaultSession,
  deleteNode,
  fileIdsUnder,
  findNode,
  loadSession,
  loadWorkspace,
  parentForCreate,
  pathFor,
  readWordWrap,
  renameNode,
  saveSession,
  saveWorkspace,
  uniqueName,
  updateFileContent,
  writeWordWrap,
  type Workspace,
} from './workspace'

type NameRequest = {
  kind: 'file' | 'folder' | 'rename'
  title: string
  initial: string
  parentId: string | null
  targetId: string | null
}

type ConfirmRequest = {
  kind: 'delete' | 'reset'
  title: string
  body: string
  confirmLabel: string
  targetId: string | null
}

type DialogRequest = NameRequest | ConfirmRequest

function isNameRequest(dialog: DialogRequest | null): dialog is NameRequest {
  return dialog !== null && (dialog.kind === 'file' || dialog.kind === 'folder' || dialog.kind === 'rename')
}

function initialWordWrap(): boolean {
  const stored = readWordWrap()
  if (stored !== null) return stored
  return window.matchMedia('(max-width: 760px)').matches
}

function folderTitle(workspace: Workspace, parentId: string | null, action: string): string {
  if (!parentId) return action
  const node = findNode(workspace.children, parentId)
  return node ? `${action} in ${node.name}` : action
}

export function App() {
  const [theme, setTheme] = useState<ThemeName>(() => resolveInitialTheme())
  const [workspace, setWorkspace] = useState<Workspace>(() => loadWorkspace())
  const [session] = useState(() => loadSession(loadWorkspace()))
  const [openIds, setOpenIds] = useState<string[]>(session.openIds)
  const [activeId, setActiveId] = useState<string | null>(session.activeId)
  const [expandedIds, setExpandedIds] = useState<string[]>(session.expandedIds)
  const [selectedId, setSelectedId] = useState<string | null>(session.activeId)
  const [sidebarOpen, setSidebarOpen] = useState(
    () => !window.matchMedia('(max-width: 760px)').matches,
  )
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [wordWrap, setWordWrap] = useState(initialWordWrap)
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [dialog, setDialog] = useState<DialogRequest | null>(null)
  const [nameErrorMessage, setNameErrorMessage] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [storageOk, setStorageOk] = useState(true)

  const chooseTheme = useCallback((next: ThemeName) => {
    storeTheme(next)
    setTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    chooseTheme(theme === 'dark' ? 'light' : 'dark')
  }, [chooseTheme, theme])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    setStorageOk(saveWorkspace(workspace))
  }, [workspace])

  useEffect(() => {
    saveSession({ openIds, activeId, expandedIds })
  }, [openIds, activeId, expandedIds])

  useEffect(() => {
    writeWordWrap(wordWrap)
  }, [wordWrap])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 2500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const openFile = useCallback((id: string) => {
    setOpenIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
    setActiveId(id)
    setSelectedId(id)
    setCursor({ line: 1, column: 1 })
    if (window.matchMedia('(max-width: 760px)').matches) setSidebarOpen(false)
  }, [])

  const closeTab = useCallback(
    (id: string) => {
      const next = openIds.filter((openId) => openId !== id)
      setOpenIds(next)
      setActiveId((current) => {
        if (current !== id) return current
        const index = openIds.indexOf(id)
        return next[index - 1] ?? next[index] ?? null
      })
    },
    [openIds],
  )

  const removeFromTabs = useCallback(
    (idsToRemove: Set<string>) => {
      const next = openIds.filter((id) => !idsToRemove.has(id))
      setOpenIds(next)
      setActiveId((current) => (current && idsToRemove.has(current) ? (next[0] ?? null) : current))
    },
    [openIds],
  )

  const requestNewFile = useCallback(() => {
    const parentId = parentForCreate(workspace, selectedId)
    const siblings = childrenOf(workspace, parentId) ?? []
    setNameErrorMessage(null)
    setDialog({
      kind: 'file',
      title: folderTitle(workspace, parentId, 'New file'),
      initial: uniqueName(siblings, 'untitled.ts'),
      parentId,
      targetId: null,
    })
  }, [selectedId, workspace])

  const requestNewFolder = useCallback(() => {
    const parentId = parentForCreate(workspace, selectedId)
    const siblings = childrenOf(workspace, parentId) ?? []
    setNameErrorMessage(null)
    setDialog({
      kind: 'folder',
      title: folderTitle(workspace, parentId, 'New folder'),
      initial: uniqueName(siblings, 'folder'),
      parentId,
      targetId: null,
    })
  }, [selectedId, workspace])

  const requestRename = useCallback(() => {
    if (!selectedId) {
      setNotice('Select a file or folder to rename.')
      return
    }
    const node = findNode(workspace.children, selectedId)
    if (!node) return
    setNameErrorMessage(null)
    setDialog({
      kind: 'rename',
      title: `Rename ${node.name}`,
      initial: node.name,
      parentId: null,
      targetId: node.id,
    })
  }, [selectedId, workspace])

  const requestDelete = useCallback(() => {
    if (!selectedId) {
      setNotice('Select a file or folder to delete.')
      return
    }
    const node = findNode(workspace.children, selectedId)
    if (!node) return
    const path = pathFor(workspace.children, node.id) ?? node.name
    setDialog({
      kind: 'delete',
      title: `Delete ${node.name}`,
      body: `Delete ${path}? It is removed from this browser.`,
      confirmLabel: 'Delete',
      targetId: node.id,
    })
  }, [selectedId, workspace])

  const requestReset = useCallback(() => {
    setDialog({
      kind: 'reset',
      title: 'Reset sample workspace',
      body: 'Replace the files in this browser with the sample welcome.md and src/hello.ts files.',
      confirmLabel: 'Reset',
      targetId: null,
    })
  }, [])

  const downloadActive = useCallback(() => {
    if (!activeId) {
      setNotice('Open a file to download it.')
      return
    }
    const node = findNode(workspace.children, activeId)
    if (!node || node.type !== 'file') {
      setNotice('Open a file to download it.')
      return
    }
    const path = pathFor(workspace.children, node.id) ?? node.name
    const filename = path.split('/').pop() ?? node.name
    downloadText(filename, node.content)
    setNotice(`Downloaded ${filename}`)
  }, [activeId, workspace])

  const submitName = useCallback(
    (name: string) => {
      if (!isNameRequest(dialog)) return
      const request = dialog
      if (request.kind === 'rename') {
        if (!request.targetId) return
        const result = renameNode(workspace, request.targetId, name)
        if (!result.ok) {
          setNameErrorMessage(result.error)
          return
        }
        setWorkspace(result.workspace)
        setDialog(null)
        return
      }
      const result = createNode(
        workspace,
        request.parentId,
        request.kind === 'folder' ? 'folder' : 'file',
        name,
      )
      if (!result.ok) {
        setNameErrorMessage(result.error)
        return
      }
      setWorkspace(result.workspace)
      if (request.kind === 'file') {
        openFile(result.id)
      } else {
        const parentId = request.parentId
        setExpandedIds((ids) => {
          const withFolder = ids.includes(result.id) ? ids : [...ids, result.id]
          if (!parentId || withFolder.includes(parentId)) return withFolder
          return [...withFolder, parentId]
        })
        setSelectedId(result.id)
      }
      setDialog(null)
    },
    [dialog, openFile, workspace],
  )

  const confirmDialog = useCallback(() => {
    if (!dialog || (dialog.kind !== 'delete' && dialog.kind !== 'reset')) return
    if (dialog.kind === 'reset') {
      const fresh = createSeedWorkspace()
      const nextSession = defaultSession(fresh)
      setWorkspace(fresh)
      setOpenIds(nextSession.openIds)
      setActiveId(nextSession.activeId)
      setExpandedIds(nextSession.expandedIds)
      setSelectedId(nextSession.activeId)
      setDialog(null)
      setNotice('Sample workspace restored')
      return
    }
    if (!dialog.targetId) {
      setDialog(null)
      return
    }
    const node = findNode(workspace.children, dialog.targetId)
    if (!node) {
      setDialog(null)
      return
    }
    const removed = new Set(fileIdsUnder(node))
    setWorkspace(deleteNode(workspace, node.id))
    removeFromTabs(removed)
    if (selectedId && (selectedId === node.id || findNode(node.type === 'folder' ? node.children : [], selectedId))) {
      setSelectedId(null)
    }
    setDialog(null)
  }, [dialog, removeFromTabs, selectedId, workspace])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const meta = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()
      if ((meta && event.shiftKey && key === 'p') || event.key === 'F1') {
        event.preventDefault()
        event.stopPropagation()
        setPaletteOpen((open) => (event.key === 'F1' ? true : !open))
        return
      }
      if (dialog || paletteOpen) return
      if (meta && key === 'b') {
        event.preventDefault()
        setSidebarOpen((open) => !open)
      } else if (meta && key === 's') {
        event.preventDefault()
        const ok = saveWorkspace(workspace)
        setStorageOk(ok)
        setNotice(ok ? 'Saved in this browser' : 'Could not store files in this browser.')
      } else if (meta && key === 'p') {
        event.preventDefault()
        event.stopPropagation()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [dialog, paletteOpen, workspace])

  const commands = useMemo(
    () =>
      buildCommands({
        workspace,
        setTheme: chooseTheme,
        toggleSidebar: () => setSidebarOpen((open) => !open),
        toggleWordWrap: () => setWordWrap((wrap) => !wrap),
        requestNewFile,
        requestNewFolder,
        requestRename,
        requestDelete,
        downloadActive,
        requestReset,
        openFile,
      }),
    [
      chooseTheme,
      downloadActive,
      openFile,
      requestDelete,
      requestNewFile,
      requestNewFolder,
      requestRename,
      requestReset,
      workspace,
    ],
  )

  const activeNode = activeId ? findNode(workspace.children, activeId) : null
  const activeFile = activeNode?.type === 'file' ? activeNode : null
  const activePath = activeId ? pathFor(workspace.children, activeId) : null
  const language = languageLabel(languageForPath(activePath))
  const statusMessage = storageOk ? (notice ?? 'Saved in this browser') : 'Could not store files in this browser.'

  return (
    <div className={sidebarOpen ? 'app sidebar-open' : 'app'}>
      <header className="topbar">
        <button
          type="button"
          className="icon-button menu-button"
          aria-label="Toggle files"
          aria-pressed={sidebarOpen}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <MenuIcon />
        </button>
        <div className="brand">
          <OrbitMark className="brand-orbit" />
          <span className="brand-mark">vs</span>
          <span className="brand-line">Go-Orbit-Programmers-Pro</span>
        </div>
        <ThemeToggle
          theme={theme}
          onToggle={toggleTheme}
          className="theme-toggle-top"
          testId="theme-toggle-top"
        />
      </header>
      <ActivityBar
        theme={theme}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        onOpenCommands={() => setPaletteOpen(true)}
        onToggleTheme={toggleTheme}
      />
      <Sidebar
        nodes={workspace.children}
        activeId={activeId}
        selectedId={selectedId}
        expandedIds={expandedIds}
        onOpenFile={openFile}
        onToggleFolder={(id) => {
          setSelectedId(id)
          setExpandedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]))
        }}
        onNewFile={requestNewFile}
        onNewFolder={requestNewFolder}
        onRename={requestRename}
        onDelete={requestDelete}
      />
      {sidebarOpen ? (
        <button type="button" className="scrim" aria-label="Close files" onClick={() => setSidebarOpen(false)} />
      ) : null}
      <main className="editor-group">
        <div className="tabs" role="tablist" aria-label="Open files">
          {openIds.map((id) => {
            const node = findNode(workspace.children, id)
            if (!node || node.type !== 'file') return null
            const active = id === activeId
            return (
              <div key={id} className={active ? 'tab active' : 'tab'} role="tab" aria-selected={active}>
                <button type="button" className="tab-label" onClick={() => openFile(id)}>
                  {node.name}
                </button>
                <button type="button" className="tab-close" aria-label={`Close ${node.name}`} onClick={() => closeTab(id)}>
                  <CloseIcon />
                </button>
              </div>
            )
          })}
        </div>
        {activeFile ? (
          <EditorSurface
            path={activePath}
            value={activeFile.content}
            theme={theme}
            wordWrap={wordWrap}
            onChange={(content) => {
              if (!activeId) return
              setWorkspace((current) => updateFileContent(current, activeId, content))
            }}
            onCursor={setCursor}
          />
        ) : (
          <div className="empty-editor">
            <p className="empty-mark">vs</p>
            <p>Go-Orbit-Programmers-Pro</p>
            <p>Open a file, or press Ctrl+Shift+P for the command menu.</p>
          </div>
        )}
      </main>
      <StatusBar
        path={activePath}
        language={language}
        line={cursor.line}
        column={cursor.column}
        themeLabel={theme === 'dark' ? 'Dark' : 'Light'}
        message={statusMessage}
      />
      {paletteOpen ? <CommandPalette commands={commands} onClose={() => setPaletteOpen(false)} /> : null}
      {isNameRequest(dialog) ? (
        <NameDialog
          key={`${dialog.kind}-${dialog.targetId ?? dialog.parentId ?? 'root'}-${dialog.initial}`}
          title={dialog.title}
          initial={dialog.initial}
          confirmLabel={dialog.kind === 'rename' ? 'Rename' : 'Create'}
          error={nameErrorMessage}
          onCancel={() => setDialog(null)}
          onConfirm={submitName}
        />
      ) : null}
      {dialog && (dialog.kind === 'delete' || dialog.kind === 'reset') ? (
        <ConfirmDialog
          title={dialog.title}
          body={dialog.body}
          confirmLabel={dialog.confirmLabel}
          onCancel={() => setDialog(null)}
          onConfirm={confirmDialog}
        />
      ) : null}
    </div>
  )
}
