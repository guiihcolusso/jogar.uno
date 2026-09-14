'use client'

import { useEffect, useState } from 'react'

const VALID_PASSWORDS = ['DuDu2026', 'admin', 'uno', 'mod', '1234', 'cheat']

declare global {
  interface Window {
    unlock?: (password?: string) => void
    mod?: (password?: string) => void
    modMenu?: (password?: string) => void
    cheat?: (password?: string) => void
    senha?: (password?: string) => void
  }
}

export const useModMenuConsole = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  useEffect(() => {
    // Check if previously unlocked in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('uno:mod_unlocked') === 'true') {
      setIsUnlocked(true)
    }

    const handleUnlock = (password?: string) => {
      let candidate = password?.trim()

      if (!candidate) {
        candidate = window.prompt('🔑 Digite a senha do Mod Menu:')?.trim()
      }

      if (!candidate) {
        console.warn(
          '%c⚠️ [UNO MOD] Nenhuma senha informada! Exemplo: unlock("uno123")',
          'color: #f59e0b; font-weight: bold;',
        )
        return 'Digite a senha! Exemplo: unlock("uno123")'
      }

      if (VALID_PASSWORDS.includes(candidate.toLowerCase())) {
        setIsUnlocked(true)
        setIsOpen(true)
        sessionStorage.setItem('uno:mod_unlocked', 'true')

        console.log(
          '%c🔓 [UNO MOD MENU] ACESSO CONCEDIDO!\n%cMod Menu aberto na interface.',
          'color: #10b981; font-size: 16px; font-weight: bold;',
          'color: #a7f3d0; font-size: 13px;',
        )
        return '🔓 Mod Menu desbloqueado com sucesso!'
      } else {
        console.error(
          '%c❌ [UNO MOD MENU] Senha incorreta!\n%c',
          'color: #ef4444; font-size: 14px; font-weight: bold;',
          'color: #fca5a5;',
        )
        return '❌ Senha incorreta! '
      }
    }

    // Expose console triggers on window
    window.unlock = handleUnlock
    window.mod = handleUnlock
    window.modMenu = handleUnlock
    window.cheat = handleUnlock
    window.senha = handleUnlock

    return () => {
      delete window.unlock
      delete window.mod
      delete window.modMenu
      delete window.cheat
      delete window.senha
    }
  }, [])

  return {
    isOpen,
    setIsOpen,
    isUnlocked,
    setIsUnlocked,
    toggle: () => setIsOpen((prev) => !prev),
  }
}
