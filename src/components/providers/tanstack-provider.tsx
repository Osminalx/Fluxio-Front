"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { type ReactNode, useState } from "react"
import { clearTokens } from "@/lib/auth"

interface TanstackProviderProps {
  children: ReactNode
}

export function TanstackProvider({ children }: TanstackProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && "status" in error) {
                const status = (error as { status: number }).status
                if (status >= 400 && status < 500) {
                  return false
                }
              }
              return failureCount < 3
            },
            // Global error handler for 401 errors
            onError: (error) => {
              // If error message indicates authentication failure, clear tokens
              if (
                error instanceof Error &&
                (error.message.includes("Authentication failed") ||
                  error.message.includes("401") ||
                  error.message.includes("Unauthorized"))
              ) {
                // Clear tokens to allow user to login again
                clearTokens()
              }
            },
          },
          mutations: {
            retry: false,
            // Global error handler for mutations with 401 errors
            onError: (error) => {
              // If error message indicates authentication failure, clear tokens
              if (
                error instanceof Error &&
                (error.message.includes("Authentication failed") ||
                  error.message.includes("401") ||
                  error.message.includes("Unauthorized"))
              ) {
                // Clear tokens to allow user to login again
                // Note: Don't clear on logout mutations to avoid loops
                if (!error.message.includes("logout")) {
                  clearTokens()
                }
              }
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
