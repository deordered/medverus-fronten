'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Medical application specific settings
            staleTime: 1000 * 60 * 5, // 5 minutes - medical data should be relatively fresh
            gcTime: 1000 * 60 * 30, // 30 minutes - keep data in cache for performance
            retry: (failureCount, error: any) => {
              // Don't retry on 401 (unauthorized) errors
              if (error?.status === 401) {
                return false
              }
              // Don't retry on 403 (forbidden) errors
              if (error?.status === 403) {
                return false
              }
              // Retry up to 3 times for other errors
              return failureCount < 3
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Network detection for medical environments
            networkMode: 'online',
            // Refetch on window focus for critical medical data
            refetchOnWindowFocus: true,
            // Refetch on reconnect for medical applications
            refetchOnReconnect: true,
          },
          mutations: {
            // Medical mutation settings
            retry: (failureCount, error: any) => {
              // Don't retry authentication or authorization errors
              if (error?.status === 401 || error?.status === 403) {
                return false
              }
              // Don't retry validation errors (422)
              if (error?.status === 422) {
                return false
              }
              // Retry network errors up to 2 times
              return failureCount < 2
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
            // Network mode for mutations
            networkMode: 'online',
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Development tools - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}