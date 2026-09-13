'use client'

import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

const getSnapshot = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < MOBILE_BREAKPOINT
}

const getServerSnapshot = () => false

/**
 * Detecta viewport mobile (< 768px) com `useSyncExternalStore`,
 * compatível com hidratação do Next (sem `setState` síncrono em effect).
 */
export const useMobile = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
