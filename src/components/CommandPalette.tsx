import { useEffect, useRef, useState } from 'react'
import { filterCommands, type Command } from '../commands'

type CommandPaletteProps = {
  commands: Command[]
  onClose: () => void
}

export function CommandPalette({ commands, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = filterCommands(commands, query)
  const selected = Math.min(index, Math.max(results.length - 1, 0))

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setIndex(0)
  }, [query])

  function run(command: Command | undefined) {
    if (!command) return
    onClose()
    command.run()
  }

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Type a command"
          aria-label="Filter commands"
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)))
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              setIndex((current) => Math.max(current - 1, 0))
            } else if (event.key === 'Enter') {
              event.preventDefault()
              run(results[selected])
            } else if (event.key === 'Escape') {
              event.preventDefault()
              onClose()
            }
          }}
        />
        <ul className="palette-list" role="listbox" aria-label="Commands">
          {results.map((command, itemIndex) => (
            <li key={command.id}>
              <button
                type="button"
                role="option"
                aria-selected={itemIndex === selected}
                className={itemIndex === selected ? 'palette-item active' : 'palette-item'}
                onMouseEnter={() => setIndex(itemIndex)}
                onClick={() => run(command)}
              >
                <span>{command.label}</span>
                {command.shortcut ? <kbd>{command.shortcut}</kbd> : null}
              </button>
            </li>
          ))}
          {results.length === 0 ? <li className="palette-empty">No matching commands</li> : null}
        </ul>
      </div>
    </div>
  )
}
