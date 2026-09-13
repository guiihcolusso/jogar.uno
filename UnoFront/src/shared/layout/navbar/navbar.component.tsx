'use client'

import Link from 'next/link'

import { Logo } from '@/shared/components/logo'

import { styles } from './navbar.styles'
import { PlayerBadge } from './player-badge.component'
import { ThemeSwitcher } from './theme-switcher.component'

export const Navbar = () => {
  return (
    <header className={styles.container()}>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex flex-1">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <PlayerBadge />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
