'use client'

import type { UseGlobalLoadingResult } from './loading.types'
import { useGlobalLoadingContext } from './providers'

export const useGlobalLoading = (): UseGlobalLoadingResult => {
  const { show, hide, isLoading } = useGlobalLoadingContext()
  return { show, hide, isLoading }
}
