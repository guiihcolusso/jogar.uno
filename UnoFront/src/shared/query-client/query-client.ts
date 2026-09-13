import type { QueryClientConfig } from '@tanstack/react-query'

const TEN_MINUTES_MS = 1000 * 60 * 10

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: TEN_MINUTES_MS,
    },
    mutations: {
      retry: 0,
    },
  },
}
