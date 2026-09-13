'use client'

import type { ReactNode } from 'react'

import { NuqsAdapter } from 'nuqs/adapters/next/app'

export interface NuqsProviderParams {
  children: ReactNode
}

export const NuqsProvider = ({ children }: NuqsProviderParams) => {
  return <NuqsAdapter>{children}</NuqsAdapter>
}
