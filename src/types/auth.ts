import { z } from "zod"

// Zod Schemas for validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

// TypeScript types inferred from schemas
export type LoginRequest = z.infer<typeof loginSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>

// API Response types
export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, string[]>
}

// Auth state types
export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
