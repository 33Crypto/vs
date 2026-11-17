import type { WorkspaceNode } from '../workspace'
import { ChevronIcon } from './icons'

type SidebarProps = {
  nodes: WorkspaceNode[]
  activeId: string | null
  selectedId: string | null
  expandedIds: string[]
  onOpenFile: (id: string) => void
  onToggleFolder: (id: string) => void
  onNewFile: () => void
  onNewFolder: () => void
  onRename: () => void
  onDelete: () => void
}

export function Sidebar({
  nodes,
  activeId,
  selectedId,
  expandedIds,
  onOpenFile,
  onToggleFolder,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Explorer">
      <div className="sidebar-heading">Files</div>
      <div className="sidebar-actions">
        <button type="button" onClick={onNewFile}>
          New file
        </button>
        <button type="button" onClick={onNewFolder}>
          New folder
        </button>
        <button type="button" onClick={onRename} disabled={!selectedId}>
          Rename
        </button>
        <button type="button" onClick={onDelete} disabled={!selectedId}>
          Delete
        </button>
      </div>
      <div className="tree-scroll">
        <Tree
          nodes={nodes}
          depth={0}
          activeId={activeId}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onOpenFile={onOpenFile}
          onToggleFolder={onToggleFolder}
        />
      </div>
      <p className="sidebar-note">Stored in this browser</p>
    </aside>
  )
}

function Tree({
  nodes,
  depth,
  activeId,
  selectedId,
  expandedIds,
  onOpenFile,
  onToggleFolder,
}: {
  nodes: WorkspaceNode[]
  depth: number
  activeId: string | null
  selectedId: string | null
  expandedIds: string[]
  onOpenFile: (id: string) => void
  onToggleFolder: (id: string) => void
}) {
  if (nodes.length === 0) {
    return <p className="tree-empty">Empty folder</p>
  }
  return (
    <ul className="tree" role="tree">
      {nodes.map((node) => {
        const selected = node.id === selectedId
        const paddingLeft = 8 + depth * 14
        if (node.type === 'folder') {
          const open = expandedIds.includes(node.id)
          return (
            <li key={node.id} role="none">
              <button
                type="button"
                role="treeitem"
                aria-expanded={open}
                className={selected ? 'tree-item selected' : 'tree-item'}
                style={{ paddingLeft }}
                onClick={() => onToggleFolder(node.id)}
              >
                <ChevronIcon open={open} />
                <span>{node.name}</span>
              </button>
              {open ? (
                <Tree
                  nodes={node.children}
                  depth={depth + 1}
                  activeId={activeId}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onOpenFile={onOpenFile}
                  onToggleFolder={onToggleFolder}
                />
              ) : null}
            </li>
          )
        }
        const active = node.id === activeId
        return (
          <li key={node.id} role="none">
            <button
              type="button"
              role="treeitem"
              aria-current={active ? 'true' : undefined}
              className={active || selected ? 'tree-item selected' : 'tree-item'}
              style={{ paddingLeft }}
              onClick={() => onOpenFile(node.id)}
            >
              <span className="tree-file-mark" aria-hidden="true" />
              <span>{node.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
