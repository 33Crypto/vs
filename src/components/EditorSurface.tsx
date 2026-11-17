import * as monaco from 'monaco-editor'
import 'monaco-editor/min/vs/editor/editor.main.css'
import { useEffect, useRef } from 'react'
import { ensureEditorThemes } from '../editor/defineThemes'
import '../editor/monacoEnvironment'
import { languageForPath } from '../language'
import { monacoThemeId, type ThemeName } from '../theme'

type EditorSurfaceProps = {
  path: string | null
  value: string
  theme: ThemeName
  wordWrap: boolean
  onChange: (value: string) => void
  onCursor: (position: { line: number; column: number }) => void
}

export function EditorSurface({ path, value, theme, wordWrap, onChange, onCursor }: EditorSurfaceProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const applyingRef = useRef(false)
  const onChangeRef = useRef(onChange)
  const onCursorRef = useRef(onCursor)
  const pathRef = useRef(path)
  onChangeRef.current = onChange
  onCursorRef.current = onCursor

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    ensureEditorThemes()
    const editor = monaco.editor.create(host, {
      value,
      language: languageForPath(path),
      theme: monacoThemeId(theme),
      automaticLayout: true,
      fontSize: 14,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      minimap: { enabled: window.matchMedia('(min-width: 900px)').matches },
      scrollBeyondLastLine: false,
      wordWrap: wordWrap ? 'on' : 'off',
      padding: { top: 12, bottom: 12 },
      renderLineHighlight: 'line',
      tabSize: 2,
      smoothScrolling: true,
    })
    editorRef.current = editor
    const content = editor.onDidChangeModelContent(() => {
      if (applyingRef.current) return
      onChangeRef.current(editor.getValue())
    })
    const cursor = editor.onDidChangeCursorPosition((event) => {
      onCursorRef.current({
        line: event.position.lineNumber,
        column: event.position.column,
      })
    })
    const media = window.matchMedia('(min-width: 900px)')
    const onMedia = () => editor.updateOptions({ minimap: { enabled: media.matches } })
    media.addEventListener('change', onMedia)
    return () => {
      media.removeEventListener('change', onMedia)
      content.dispose()
      cursor.dispose()
      editor.dispose()
      editorRef.current = null
    }
    // The editor instance is created once. Later effects push theme, value, and wrap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    const model = editor?.getModel()
    if (!editor || !model) return
    const language = languageForPath(path)
    if (model.getLanguageId() !== language) monaco.editor.setModelLanguage(model, language)
    const pathChanged = pathRef.current !== path
    pathRef.current = path
    if (model.getValue() !== value) {
      applyingRef.current = true
      model.setValue(value)
      if (pathChanged) {
        editor.setPosition({ lineNumber: 1, column: 1 })
        onCursorRef.current({ line: 1, column: 1 })
      }
      applyingRef.current = false
    }
  }, [path, value])

  useEffect(() => {
    ensureEditorThemes()
    monaco.editor.setTheme(monacoThemeId(theme))
  }, [theme])

  useEffect(() => {
    editorRef.current?.updateOptions({ wordWrap: wordWrap ? 'on' : 'off' })
  }, [wordWrap])

  return <div ref={hostRef} className="monaco-host" data-theme={theme} />
}
