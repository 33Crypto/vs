const EXTENSION_LANGUAGE: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  json: 'json',
  md: 'markdown',
  css: 'css',
  scss: 'scss',
  html: 'html',
  htm: 'html',
  py: 'python',
  go: 'go',
  rs: 'rust',
  yml: 'yaml',
  yaml: 'yaml',
  sh: 'shell',
  bash: 'shell',
  xml: 'xml',
  svg: 'xml',
  sql: 'sql',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  toml: 'ini',
  txt: 'plaintext',
}

const LANGUAGE_LABELS: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  json: 'JSON',
  markdown: 'Markdown',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  yaml: 'YAML',
  shell: 'Shell',
  xml: 'XML',
  sql: 'SQL',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  ruby: 'Ruby',
  php: 'PHP',
  ini: 'INI',
  plaintext: 'Plain Text',
}

export function languageForPath(path: string | null): string {
  if (!path) return 'plaintext'
  const base = path.split('/').pop() ?? path
  const dot = base.lastIndexOf('.')
  if (dot <= 0) return 'plaintext'
  const ext = base.slice(dot + 1).toLowerCase()
  return EXTENSION_LANGUAGE[ext] ?? 'plaintext'
}

export function languageLabel(languageId: string): string {
  return LANGUAGE_LABELS[languageId] ?? languageId
}
