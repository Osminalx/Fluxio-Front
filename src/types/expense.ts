import { z } from "zod"
import type { BankAccount } from "./bank-account"
import type { Category } from "./category"
import { type Status, statusSchema } from "./status"

// Zod Schemas for validation
export const createExpenseSchema = z.object({
  amount: z.number().min(0, "Amount must be greater than 0"),
  bank_account_id: z.string().uuid("Invalid bank account ID"),
  category_id: z.string().uuid("Invalid category ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  description: z.string().min(1, "Description is required"),
})

export const updateExpenseSchema = z.object({
  amount: z.number().min(0, "Amount must be greater than 0").optional(),
  bank_account_id: z.string().uuid("Invalid bank account ID").optional(),
  category_id: z.string().uuid("Invalid category ID").optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
})

export const expenseStatusSchema = z.object({
  status: statusSchema,
})

// Date range query schema
export const dateRangeQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  bank_account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
})

// Monthly query schema
export const monthlyQuerySchema = z.object({
  year: z.number().int().min(2000).max(3000),
  month: z.number().int().min(1).max(12),
  bank_account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
})

// TypeScript types inferred from schemas
export type CreateExpenseRequest = z.infer<typeof createExpenseSchema>
export type UpdateExpenseRequest = z.infer<typeof updateExpenseSchema>
export type ExpenseStatusRequest = z.infer<typeof expenseStatusSchema>
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>
export type MonthlyQuery = z.infer<typeof monthlyQuerySchema>

// API Response types
export interface Expense {
  id: string
  amount: number
  bank_account_id: string
  bank_account: BankAccount
  category_id: string
  category: Category
  date: string
  description: string
  status: Status
  created_at: string
  updated_at: string
  status_changed_at: string
}

export interface ExpensesResponse {
  expenses: Expense[]
  count: number
}

// Summary response types
export interface ExpenseSummary {
  total_expenses: number
  total_amount: number
  average_amount: number
  by_category: CategorySummary[]
  by_bank_account: BankAccountSummary[]
  by_month: MonthlySummary[]
}

export interface CategorySummary {
  category_id: string
  category_name: string
  expense_type_name: string
  total_expenses: number
  total_amount: number
  percentage: number
}

export interface BankAccountSummary {
  bank_account_id: string
  account_name: string
  total_expenses: number
  total_amount: number
  percentage: number
}

export interface MonthlySummary {
  year: number
  month: number
  total_expenses: number
  total_amount: number
}

// Filter and query types
export interface ExpenseFilters {
  bank_account_id?: string
  category_id?: string
  start_date?: string
  end_date?: string
  status?: Status
  include_deleted?: boolean
}

// State management types
export interface ExpenseState {
  expenses: Expense[]
  selectedExpense: Expense | null
  summary: ExpenseSummary | null
  isLoading: boolean
  error: string | null
}

// Utility types
export interface ExpenseFormData {
  amount: string
  bank_account_id: string
  category_id: string
  date: string
  description: string
}
