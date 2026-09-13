'use client'

import { type ReactNode,useState } from 'react'

import { dehydrate,HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { queryClientConfig } from '../query-client'

export interface ReactQueryProviderParams {
  children: ReactNode
}

export const ReactQueryProvider = ({ children }: ReactQueryProviderParams) => {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </HydrationBoundary>
    </QueryClientProvider>
  )
}
