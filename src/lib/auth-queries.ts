import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import React from "react"
import { useAuthStore } from "@/stores/auth-store"
import type { LoginRequest, RegisterRequest } from "@/types/auth"
import { getCurrentUser, login, logout, logoutAll, refreshToken, register } from "./auth"

// Query keys for TanStack Query
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
} as const

// Hook for getting current user
export function useCurrentUser() {
  const { setUser, setLoading, setError } = useAuthStore()

  const query = useQuery({
    queryKey: authKeys.user(),
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Handle state updates based on query status
  React.useEffect(() => {
    if (query.isSuccess && query.data) {
      setUser(query.data)
      setLoading(false)
    } else if (query.isError) {
      setError(query.error instanceof Error ? query.error.message : "Failed to get user")
      setLoading(false)
    } else if (query.isLoading) {
      setLoading(true)
    }
  }, [
    query.isSuccess,
    query.data,
    query.isError,
    query.error,
    query.isLoading,
    setUser,
    setLoading,
    setError,
  ])

  return query
}

// Hook for login mutation
export function useLogin() {
  const queryClient = useQueryClient()
  const { login: loginStore, setError, setLoading } = useAuthStore()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: (data) => {
      // Update Zustand store
      loginStore(data.user)
      // Cache the user data in TanStack Query
      queryClient.setQueryData(authKeys.user(), data.user)
      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      setError(errorMessage)
      setLoading(false)
    },
  })
}

// Hook for register mutation
export function useRegister() {
  const queryClient = useQueryClient()
  const { login: loginStore, setError, setLoading } = useAuthStore()

  return useMutation({
    mutationFn: (userData: RegisterRequest) => register(userData),
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: (data) => {
      // Update Zustand store (register acts like login)
      loginStore(data.user)
      // Cache the user data in TanStack Query
      queryClient.setQueryData(authKeys.user(), data.user)
      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      setError(errorMessage)
      setLoading(false)
    },
  })
}

// Hook for logout mutation
export function useLogout() {
  const queryClient = useQueryClient()
  const { logout: logoutStore } = useAuthStore()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Update Zustand store
      logoutStore()
      // Clear all cached data
      queryClient.clear()
    },
    onError: () => {
      // Even if logout fails, clear local state
      logoutStore()
      queryClient.clear()
    },
  })
}

// Hook for logout all devices mutation
export function useLogoutAll() {
  const queryClient = useQueryClient()
  const { logout: logoutStore } = useAuthStore()

  return useMutation({
    mutationFn: logoutAll,
    onSuccess: () => {
      // Update Zustand store
      logoutStore()
      // Clear all cached data
      queryClient.clear()
    },
    onError: () => {
      // Even if logout fails, clear local state
      logoutStore()
      queryClient.clear()
    },
  })
}

// Hook for token refresh mutation
export function useRefreshToken() {
  const queryClient = useQueryClient()
  const { setUser, logout: logoutStore } = useAuthStore()

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      // Update Zustand store
      setUser(data.user)
      // Update cached user data
      queryClient.setQueryData(authKeys.user(), data.user)
    },
    onError: () => {
      // If refresh fails, logout user
      logoutStore()
      queryClient.removeQueries({ queryKey: authKeys.all })
    },
  })
}
