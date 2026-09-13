import type { ReactNode } from 'react'

export type GlobalLoadingContextValue = {
  count: number
  show: () => void
  hide: () => void
  isLoading: boolean
}

export type GlobalLoadingProviderParams = {
  children: ReactNode
}

export type UseGlobalLoadingResult = {
  show: () => void
  hide: () => void
  isLoading: boolean
}
