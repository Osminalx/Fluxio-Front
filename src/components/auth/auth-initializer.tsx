"use client"

import { useAuthInit } from "@/hooks/use-auth-init"

// Component to initialize authentication state
// This should be included early in your app tree
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthInit()
  return <>{children}</>
}
