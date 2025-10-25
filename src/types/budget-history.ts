import { z } from "zod"

// Budget History schemas based on API documentation
export const budgetHistorySchema = z.object({
  budget_id: z.string().uuid(),
  change_reason: z.string().nullable(),
  changed_at: z.string().datetime(),
  id: z.string().uuid(),
  new_needs_budget: z.number().nullable(),
  new_savings_budget: z.number().nullable(),
  new_wants_budget: z.number().nullable(),
  old_needs_budget: z.number().nullable(),
  old_savings_budget: z.number().nullable(),
  old_wants_budget: z.number().nullable(),
  user_id: z.string().uuid(),
})

// TypeScript type inferred from schema
export type BudgetHistory = z.infer<typeof budgetHistorySchema>

// API Response types
export interface BudgetHistoryResponse {
  budget_history: BudgetHistory[]
  count: number
}

export interface BudgetHistoryStats {
  total_changes: number
  average_change: number
  most_common_reason: string
}

export interface BudgetHistoryPatterns {
  patterns: Array<{
    month: string
    change_count: number
    average_change: number
    most_common_reason: string
  }>
}

// Filter and query types
export interface BudgetHistoryFilters {
  budget_id?: string
  start_date?: string
  end_date?: string
  with_reasons?: boolean
}

export interface BudgetHistoryDateRangeParams {
  start_date: string
  end_date: string
}
