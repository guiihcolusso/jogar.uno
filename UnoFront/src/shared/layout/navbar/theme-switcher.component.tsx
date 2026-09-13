'use client'

import { useTheme } from 'next-themes'

import { Button } from '@heroui/react'
import { Moon, Sun } from 'lucide-react'

export const ThemeSwitcher = () => {
  const { resolvedTheme, setTheme } = useTheme()

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button onPress={handleToggleTheme} isIconOnly variant="ghost">
      {resolvedTheme === 'light' ? <Moon /> : <Sun />}
    </Button>
  )
}
