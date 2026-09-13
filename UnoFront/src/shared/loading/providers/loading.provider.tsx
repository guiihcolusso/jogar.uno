'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import type { GlobalLoadingContextValue, GlobalLoadingProviderParams } from '../loading.types'

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null)

export const GlobalLoadingProvider = ({ children }: GlobalLoadingProviderParams) => {
  const [count, setCount] = useState(0)
  const show = useCallback(() => setCount((c) => c + 1), [])
  const hide = useCallback(() => setCount((c) => Math.max(0, c - 1)), [])
  const value = useMemo<GlobalLoadingContextValue>(
    () => ({ count, show, hide, isLoading: count > 0 }),
    [count, show, hide],
  )
  return <GlobalLoadingContext.Provider value={value}>{children}</GlobalLoadingContext.Provider>
}

export const useGlobalLoadingContext = () => {
  const ctx = useContext(GlobalLoadingContext)
  if (!ctx) throw new Error('useGlobalLoadingContext must be used within GlobalLoadingProvider')
  return ctx
}
