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

// API Response types
export interface BankAccount {
  id: string
  account_name: string
  balance: number
  status: Status
  created_at: string
  updated_at: string
  status_changed_at: string
}

export interface BankAccountsResponse {
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
  include_deleted?: boolean
  status?: Status
}
