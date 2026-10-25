import { describe, expect, it } from 'vitest'
import { languageForPath, languageLabel } from './language'

describe('language', () => {
  it('detects languages from paths', () => {
    expect(languageForPath('src/hello.ts')).toBe('typescript')
    expect(languageForPath('go.os')).toBe('go')
    expect(languageForPath('welcome.md')).toBe('markdown')
    expect(languageForPath('README')).toBe('plaintext')
    expect(languageForPath(null)).toBe('plaintext')
  })

  it('labels languages for the status bar', () => {
    expect(languageLabel('typescript')).toBe('TypeScript')
    expect(languageLabel('markdown')).toBe('Markdown')
  })
})
