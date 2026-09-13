'use client'

import { env } from '@/config/env'

import { EnvBar } from '../env-bar'
import { Navbar } from '../navbar'
import { styles } from './app-shell.styles'
import type { AppShellParams } from './app-shell.types'

/**
 * `EnvBar` + `Navbar` only — no persistent `Footer`. The table screen needs
 * every pixel of vertical space it can get, and a fixed footer bar (the
 * boilerplate default) would eat into it on every route.
 */
export const AppShell = ({ children }: AppShellParams) => {
  const nodeEnv = env.APP_ENV

  return (
    <>
      <div className={styles.header()}>
        <EnvBar env={nodeEnv} />
        <Navbar />
      </div>
      {children}
    </>
  )
}
