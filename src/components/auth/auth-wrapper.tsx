"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuthLoading, useIsAuthenticated } from "@/stores/auth-store"

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register"]

// Routes that authenticated users shouldn't access (will redirect to dashboard)
const AUTH_REDIRECT_ROUTES = ["/login", "/register"]

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) {
      return
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
    const shouldRedirectAuth = AUTH_REDIRECT_ROUTES.includes(pathname)

    if (isAuthenticated && shouldRedirectAuth) {
      // Authenticated user trying to access login/register - redirect to dashboard
      router.push("/")
    } else if (!isAuthenticated && !isPublicRoute) {
      // Unauthenticated user trying to access protected route - redirect to login
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    )
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const shouldRedirectAuth = AUTH_REDIRECT_ROUTES.includes(pathname)

  // Don't render if we need to redirect
  if ((!isAuthenticated && !isPublicRoute) || (isAuthenticated && shouldRedirectAuth)) {
    return null
  }

  return <>{children}</>
}
