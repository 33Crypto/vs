import { useEffect, useRef } from 'react'

type NameDialogProps = {
  title: string
  initial: string
  confirmLabel: string
  error: string | null
  onCancel: () => void
  onConfirm: (name: string) => void
}

export function NameDialog({ title, initial, confirmLabel, error, onCancel, onConfirm }: NameDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  return (
    <div className="palette-backdrop" onMouseDown={onCancel}>
      <form
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          onConfirm(inputRef.current?.value ?? '')
        }}
      >
        <h2>{title}</h2>
        <input
          ref={inputRef}
          className="palette-input"
          aria-label="Name"
          defaultValue={initial}
          autoComplete="off"
          spellCheck={false}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              onCancel()
            }
          }}
        />
        {error ? <p className="dialog-error">{error}</p> : null}
        <div className="dialog-actions">
          <button type="button" className="text-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

type ConfirmDialogProps = {
  title: string
  body: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ title, body, confirmLabel, onCancel, onConfirm }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
  }, [])

  return (
    <div className="palette-backdrop" onMouseDown={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onCancel()
        }}
      >
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="dialog-actions">
          <button type="button" className="text-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="primary-button danger" ref={confirmRef} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
