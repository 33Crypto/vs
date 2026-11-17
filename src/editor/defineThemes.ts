import * as monaco from 'monaco-editor'

let defined = false

export function ensureEditorThemes(): void {
  if (defined) return
  defined = true

  monaco.editor.defineTheme('vs-orbit-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1e222b',
      'editor.foreground': '#e8eaef',
      'editorLineNumber.foreground': '#6d7588',
      'editorLineNumber.activeForeground': '#c5cad6',
      'editor.lineHighlightBackground': '#262b36',
      'editor.selectionBackground': '#3d4f7288',
      'editorCursor.foreground': '#e0a045',
      'editorGutter.background': '#1e222b',
      'editorWidget.background': '#181b22',
      'editorWidget.border': '#2c313c',
      'minimap.background': '#1e222b',
    },
  })

  monaco.editor.defineTheme('vs-orbit-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#1c1f27',
      'editorLineNumber.foreground': '#8b93a3',
      'editorLineNumber.activeForeground': '#3c4454',
      'editor.lineHighlightBackground': '#f3f4f7',
      'editor.selectionBackground': '#c9d7f0',
      'editorCursor.foreground': '#8a4e00',
      'editorGutter.background': '#ffffff',
      'editorWidget.background': '#f3f4f7',
      'editorWidget.border': '#d8dbe3',
      'minimap.background': '#ffffff',
    },
  })
}
