import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import Button from './ui/button'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const preferredDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
    const stored = localStorage.getItem('theme')
    const dark = stored ? stored === 'dark' : preferredDark
    setIsDark(dark)
    root.classList.toggle('dark', dark)
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <Button variant="outline" size="sm" aria-label="Toggle theme" onClick={toggle} className="gap-2">
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </Button>
  )
}

