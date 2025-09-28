import { z } from "zod"

// Zod Schemas for validation
export const createBankAccountSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: API uses snake_case
  account_name: z.string().min(1, "Account name is required"),
  balance: z.number().min(0, "Balance must be non-negative"),
})

export const updateBankAccountSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: API uses snake_case
  account_name: z.string().min(1, "Account name is required").optional(),
  balance: z.number().min(0, "Balance must be non-negative").optional(),
})

export const bankAccountStatusSchema = z.object({
  status: z.enum(["active", "deleted", "suspended", "archived", "pending", "locked"]),
})

// TypeScript types inferred from schemas
export type CreateBankAccountRequest = z.infer<typeof createBankAccountSchema>
export type UpdateBankAccountRequest = z.infer<typeof updateBankAccountSchema>
export type BankAccountStatusRequest = z.infer<typeof bankAccountStatusSchema>

// API Response types
export interface BankAccount {
  id: string
  // biome-ignore lint/style/useNamingConvention: API uses snake_case
  account_name: string
  balance: number
  status: "active" | "deleted" | "suspended" | "archived" | "pending" | "locked"
  // biome-ignore lint/style/useNamingConvention: API uses snake_case
  created_at: string
  // biome-ignore lint/style/useNamingConvention: API uses snake_case
  updated_at: string
  // biome-ignore lint/style/useNamingConvention: API uses snake_case
  status_changed_at: string
}

export interface BankAccountsResponse {
  // biome-ignore lint/style/useNamingConvention: API uses snake_case
  bank_accounts: BankAccount[]
  count: number
}

// Bank account state types
export interface BankAccountState {
  accounts: BankAccount[]
  selectedAccount: BankAccount | null
  isLoading: boolean
  error: string | null
}

// Filter and query types
export interface BankAccountFilters {
  // biome-ignore lint/style/useNamingConvention: API uses snake_case
  include_deleted?: boolean
  status?: "active" | "deleted" | "suspended" | "archived" | "pending" | "locked"
}
