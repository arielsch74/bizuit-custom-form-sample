'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useBizuitTheme } from './theme-provider'
import { Button } from '../components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useBizuitTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'dark') {
      return <Moon className="h-5 w-5" />
    } else if (theme === 'light') {
      return <Sun className="h-5 w-5" />
    } else {
      // System theme - show both icons
      return (
        <div className="relative h-5 w-5">
          <Sun className="h-5 w-5 absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="h-5 w-5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </div>
      )
    }
  }

  const getLabel = () => {
    if (theme === 'dark') return 'Dark'
    if (theme === 'light') return 'Light'
    return 'System'
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        title={`Current theme: ${getLabel()}. Click to cycle.`}
      >
        {getIcon()}
        <span className="sr-only">Toggle theme</span>
      </Button>
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {getLabel()}
      </span>
    </div>
  )
}
