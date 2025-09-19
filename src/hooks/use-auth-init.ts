import { useEffect } from "react"
import { isAuthenticated } from "@/lib/auth"
import { useCurrentUser } from "@/lib/auth-queries"
import { useAuthStore } from "@/stores/auth-store"

// Hook to initialize auth state on app start
export function useAuthInit() {
  const { updateAuthStatus, setLoading } = useAuthStore()
  const { refetch } = useCurrentUser()

  useEffect(() => {
    // Check if user has valid token
    const hasToken = isAuthenticated()

    if (hasToken) {
      // If token exists, try to fetch user data to validate it
      setLoading(true)
      refetch()
    } else {
      // Update auth status based on token presence
      updateAuthStatus()
    }
  }, [updateAuthStatus, setLoading, refetch])
}
