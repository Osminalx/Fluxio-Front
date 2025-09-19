// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v1",
  TIMEOUT: 30000, // 30 seconds
} as const

// App Configuration
export const APP_CONFIG = {
  NAME: "FluxIO",
  DESCRIPTION: "Personal Finance Tracker",
  VERSION: "0.1.0",
} as const

// Feature Flags
export const FEATURES = {
  ENABLE_DEVTOOLS: process.env.NODE_ENV === "development",
  ENABLE_ANALYTICS: process.env.NODE_ENV === "production",
} as const

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_PREFERENCES: "user_preferences",
  THEME: "theme",
} as const
