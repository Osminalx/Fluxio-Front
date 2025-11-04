import { z } from "zod"
import type { BankAccount } from "./bank-account"
import { type Status, statusSchema } from "./status"

// Create/Update schemas
export const createIncomeSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount must have at most 2 decimal places"),
  bank_account_id: z.string().uuid("Invalid bank account ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
})

export const updateIncomeSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount must have at most 2 decimal places")
    .optional(),
  bank_account_id: z.string().uuid("Invalid bank account ID").optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
})

export const incomeStatusSchema = z.object({
  status: statusSchema,
})

// Types
export type CreateIncomeRequest = z.infer<typeof createIncomeSchema>
export type UpdateIncomeRequest = z.infer<typeof updateIncomeSchema>
export type IncomeStatusRequest = z.infer<typeof incomeStatusSchema>

export interface Income {
  id: string
  user_id: string
  amount: number
  bank_account_id: string
  bank_account_name: string // Computed field from API
  bank_account?: BankAccount // Optional - only included with relations
  date: string
  status: Status
  status_changed_at: string | null
  created_at: string
  updated_at: string
}

export interface IncomeFilters {
  bank_account_id?: string
  start_date?: string
  end_date?: string
  status?: Status
  include_deleted?: boolean
}

export interface IncomeFormData {
  amount: string
  bank_account_id: string
  date: string
}









