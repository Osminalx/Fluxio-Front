import { z } from "zod"
import type { BankAccount } from "./bank-account"
import type { Category } from "./category"
import { type Status, statusSchema } from "./status"

// Recurrence type enum
export const recurrenceTypeSchema = z.enum(["monthly", "yearly"])
export type RecurrenceType = z.infer<typeof recurrenceTypeSchema>

// Zod Schemas for validation
export const createFixedExpenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount must have at most 2 decimal places"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  bank_account_id: z.string().uuid("Invalid bank account ID"),
  category_id: z.string().uuid("Invalid category ID").optional(),
  is_recurring: z.boolean().default(true),
  recurrence_type: recurrenceTypeSchema.default("monthly"),
})

export const updateFixedExpenseSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount must have at most 2 decimal places")
    .optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  bank_account_id: z.string().uuid("Invalid bank account ID").optional(),
  category_id: z.string().uuid("Invalid category ID").optional().nullable(),
  is_recurring: z.boolean().optional(),
  recurrence_type: recurrenceTypeSchema.optional(),
})

export const fixedExpenseStatusSchema = z.object({
  status: statusSchema,
})

// TypeScript types inferred from schemas
export type CreateFixedExpenseRequest = z.infer<typeof createFixedExpenseSchema>
export type UpdateFixedExpenseRequest = z.infer<typeof updateFixedExpenseSchema>
export type FixedExpenseStatusRequest = z.infer<typeof fixedExpenseStatusSchema>

// API Response type
export interface FixedExpense {
  id: string
  user_id: string
  name: string
  amount: number
  due_date: string
  bank_account_id: string
  bank_account?: BankAccount // Optional - only included with relations
  category_id: string | null
  category?: Category // Optional - only included with relations
  is_recurring: boolean
  recurrence_type: RecurrenceType
  status: Status
  status_changed_at: string | null
  created_at: string
  updated_at: string
  last_processed_at: string | null
  next_due_date: string
}

// Filter and query types
export interface FixedExpenseFilters {
  include_deleted?: boolean
  status?: Status
}

// Calendar query parameters
export interface FixedExpenseCalendarQuery {
  year: number
  month: number
}

// State management types
export interface FixedExpenseState {
  fixedExpenses: FixedExpense[]
  selectedFixedExpense: FixedExpense | null
  isLoading: boolean
  error: string | null
}

// Utility types
export interface FixedExpenseFormData {
  name: string
  amount: string
  due_date: string
  bank_account_id: string
  category_id?: string
  is_recurring: boolean
  recurrence_type: RecurrenceType
}
