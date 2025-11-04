import { z } from "zod"
import { type Status, statusSchema } from "./status"

// Zod Schemas for validation
export const createBankAccountSchema = z.object({
  account_name: z.string().min(1, "Account name is required"),
  balance: z.number().min(0, "Balance must be non-negative"),
})

export const updateBankAccountSchema = z.object({
  account_name: z.string().min(1, "Account name is required").optional(),
  balance: z.number().min(0, "Balance must be non-negative").optional(),
})

export const bankAccountStatusSchema = z.object({
  status: statusSchema,
})

// TypeScript types inferred from schemas
export type CreateBankAccountRequest = z.infer<typeof createBankAccountSchema>
export type UpdateBankAccountRequest = z.infer<typeof updateBankAccountSchema>
export type BankAccountStatusRequest = z.infer<typeof bankAccountStatusSchema>

// API Response types (per API docs)
export interface BankAccount {
  id: string
  user_id?: string
  account_name: string
  balance: number
  committed_fixed_expenses_month: number
  real_balance: number
  status: Status
  status_changed_at?: string | null
  created_at: string
  updated_at: string
}

// List response from API
export interface BankAccountListResponse {
  bank_accounts: BankAccount[]
  count: number
}

// Normalized list shape used by frontend
export interface BankAccountList {
  items: BankAccount[]
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
  include_deleted?: boolean
  status?: Status
}
