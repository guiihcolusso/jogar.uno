'use client'

import { Spinner } from '@heroui/react'

import { styles } from './loading-overlay.styles'
import { useGlobalLoadingContext } from './providers'

/**
 * Overlay bloqueante exibido quando há `count > 0` chamadas de `show()`
 * pendentes. Caller manual via `useGlobalLoading().show()` / `.hide()`.
 *
 * Renderiza `null` quando inativo — não custa árvore de DOM em ocioso.
 */
export const GlobalLoadingOverlay = () => {
  const { isLoading } = useGlobalLoadingContext()
  if (!isLoading) return null
  return (
    <div role="status" aria-live="polite" data-testid="global-loading-overlay" className={styles.overlay()}>
      <Spinner size="lg" color="current" />
    </div>
  )
}
