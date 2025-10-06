import { useEffect } from "react"
import { isAuthenticated } from "@/lib/auth"
import { useCurrentUser } from "@/lib/auth-queries"
import { useAuthStore } from "@/stores/auth-store"

// Hook to initialize auth state on app start
export function useAuthInit() {
  const { updateAuthStatus, setLoading, setError } = useAuthStore()
  const { refetch } = useCurrentUser()

  useEffect(() => {
    // In development, if no backend is available, skip auth validation
    const isDevelopment = process.env.NODE_ENV === "development"
    const hasToken = isAuthenticated()

    if (hasToken && !isDevelopment) {
      // If token exists and not in dev mode, try to fetch user data to validate it
      setLoading(true)

      // Add a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        setError("Authentication validation timed out")
        setLoading(false)
        updateAuthStatus()
      }, 5000) // 5 second timeout

      refetch()
        .then(() => {
          clearTimeout(timeoutId)
        })
        .catch((_error) => {
          clearTimeout(timeoutId)
          // If fetching user fails, clear auth state but don't crash the app
          setError("Failed to validate authentication")
          setLoading(false)
          updateAuthStatus()
        })
    } else {
      // Update auth status based on token presence or skip in dev mode
      if (isDevelopment && hasToken) {
        // In development mode with token, we skip the user fetch
        // and rely on the token presence for auth status
      }
      updateAuthStatus()
    }
  }, [updateAuthStatus, setLoading, setError, refetch])
}
