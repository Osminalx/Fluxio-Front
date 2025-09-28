import type { ApiError } from "@/types/auth"
import { API_CONFIG, STORAGE_KEYS } from "./config"

// API Client configuration
class ApiClient {
  private baseURL: string
  private timeout: number

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Set timeout using AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    config.signal = controller.signal

    // Add auth token if available
    const token = this.getToken()
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      let response = await fetch(url, config)
      clearTimeout(timeoutId)

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.getRefreshToken()) {
        try {
          const newToken = await this.handleTokenRefresh()

          // Retry the original request with new token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          }

          // Set new timeout for retry
          const retryController = new AbortController()
          const retryTimeoutId = setTimeout(() => retryController.abort(), this.timeout)
          config.signal = retryController.signal

          response = await fetch(url, config)
          clearTimeout(retryTimeoutId)
        } catch (_refreshError) {
          // If refresh fails, clear tokens and throw original error
          if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          }
          throw new Error("Authentication failed")
        }
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          message: "An unexpected error occurred",
        }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return undefined as T
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        return await response.json()
      }

      // For non-JSON responses, return empty object
      return {} as T
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error occurred")
    }
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    }
    return null
  }

  private getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    }
    return null
  }

  private async handleTokenRefresh(): Promise<string> {
    const refreshTokenValue = this.getRefreshToken()
    if (!refreshTokenValue) {
      throw new Error("No refresh token available")
    }

    const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    })

    if (!response.ok) {
      throw new Error("Token refresh failed")
    }

    const data = await response.json()

    // Store new tokens
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)
    }

    return data.token
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return await this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return await this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return await this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return await this.request<T>(endpoint, { ...options, method: "DELETE" })
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return await this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

export const apiClient = new ApiClient()
