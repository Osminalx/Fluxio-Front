import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { isAuthenticated as checkIsAuthenticated, clearTokens } from "@/lib/auth"
import type { User } from "@/types/auth"

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (user: User) => void
  logout: () => void
  updateAuthStatus: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) =>
          set((state) => {
            state.user = user
            state.isAuthenticated = !!user && checkIsAuthenticated()
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
          }),

        login: (user) =>
          set((state) => {
            state.user = user
            state.isAuthenticated = true
            state.error = null
            state.isLoading = false
          }),

        logout: () =>
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.error = null
            state.isLoading = false
            // Clear tokens from localStorage
            clearTokens()
          }),

        updateAuthStatus: () =>
          set((state) => {
            const tokenExists = checkIsAuthenticated()
            if (!tokenExists && state.isAuthenticated) {
              // Token expired or removed, logout user
              state.user = null
              state.isAuthenticated = false
            } else if (tokenExists && !state.isAuthenticated && state.user) {
              // Token exists and user data is available
              state.isAuthenticated = true
            }
          }),

        clearError: () =>
          set((state) => {
            state.error = null
          }),
      })),
      {
        name: "auth-store",
        // Only persist user data, not loading/error states
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "auth-store",
    }
  )
)

// Selectors for better performance
export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectError = (state: AuthState) => state.error

// Convenience hooks
export const useUser = () => useAuthStore(selectUser)
export const useIsAuthenticated = () => useAuthStore(selectIsAuthenticated)
export const useAuthLoading = () => useAuthStore(selectIsLoading)
export const useAuthError = () => useAuthStore(selectError)
