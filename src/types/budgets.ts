import { z } from "zod"
import { type Status, statusSchema } from "./status"

export const createBudgetSchema = z.object({
  month_year: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  needs_budget: z.number(),
  savings_budget: z.number(),
  wants_budget: z.number(),
})

export const updateBudgetSchema = z.object({
  change_reason: z.string().min(1, "Change reason is required").optional(),
  needs_budget: z.number().min(0, "Needs budget must be non-negative").optional(),
  savings_budget: z.number().min(0, "Balance must be non-negative").optional(),
  wants_budget: z.number().min(0, "Wants budget must be non-negative").optional(),
})

export const budgetStatusSchema = z.object({
  status: statusSchema,
})

// TypeScript types inferred from schemas
export type CreateBudgetRequest = z.infer<typeof createBudgetSchema>
export type UpdateBudgetRequest = z.infer<typeof updateBudgetSchema>
export type BudgetStatusRequest = z.infer<typeof budgetStatusSchema>

// API Response types
export interface Budget {
  created_at: string
  id: string
  month_year: string
  needs_budget: number
  savings_budget: number
  status: Status
  status_changed_at: string
  total_budget: number
  updated_at: string
  wants_budget: number
}

export interface BudgetResponse {
  budgets: Budget[]
  count: number
}

export interface BudgetState {
  budgets: Budget[]
  selectedBudget: Budget | null
  isLoading: boolean
  error: string | null
}

// Filter and query types
export interface BudgetFilters {
  include_deleted?: boolean
  month_year?: string
}
