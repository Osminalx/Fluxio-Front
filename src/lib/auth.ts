import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/auth"
import { apiClient } from "./api"
import { STORAGE_KEYS } from "./config"

// Token management functions
function storeTokens(token: string, refreshToken: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  }
}

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  }
  return null
}

function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }
  return null
}

function clearTokens(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  }
}

function isAuthenticated(): boolean {
  return !!getToken()
}

// Authentication service functions
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/v1/auth/login", credentials)

  // Store tokens
  storeTokens(response.token, response.refreshToken)

  return response
}

export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/v1/auth/register", userData)

  // Store tokens
  storeTokens(response.token, response.refreshToken)

  return response
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/v1/auth/logout")
  } finally {
    // Always clear local storage, even if API call fails
    clearTokens()
  }
}

export async function logoutAll(): Promise<void> {
  try {
    await apiClient.post("/api/v1/auth/logout-all")
  } finally {
    // Always clear local storage, even if API call fails
    clearTokens()
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  const refreshTokenValue = getRefreshToken()
  if (!refreshTokenValue) {
    throw new Error("No refresh token available")
  }

  // biome-ignore lint/style/useNamingConvention: Backend API requires snake_case
  const refreshPayload = { refresh_token: refreshTokenValue }
  const response = await apiClient.post<AuthResponse>("/api/v1/auth/refresh", refreshPayload)

  // Update stored tokens
  storeTokens(response.token, response.refreshToken)

  return response
}

export async function getCurrentUser(): Promise<User> {
  return await apiClient.get<User>("/api/v1/auth/me")
}

// Export token management functions
export { storeTokens, getToken, getRefreshToken, clearTokens, isAuthenticated }
