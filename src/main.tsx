import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { applyTheme, resolveInitialTheme } from './theme'
import './styles.css'

applyTheme(resolveInitialTheme())

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root is missing')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
