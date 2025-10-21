import { z } from "zod"
import { type ExpenseTypeValue, expenseTypeValueSchema } from "./expense-type"
import { type Status, statusSchema } from "./status"

// Zod Schemas for validation
export const createCategorySchema = z.object({
  expense_type: expenseTypeValueSchema,
  name: z.string().min(1, "Category name is required"),
})

export const updateCategorySchema = z.object({
  expense_type: expenseTypeValueSchema.optional(),
  name: z.string().min(1, "Category name is required").optional(),
})

export const categoryStatusSchema = z.object({
  status: statusSchema,
})

// TypeScript types inferred from schemas
export type CreateCategoryRequest = z.infer<typeof createCategorySchema>
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>
export type CategoryStatusRequest = z.infer<typeof categoryStatusSchema>

// API Response types (per API docs)
export interface Category {
  id: string
  user_id: string
  name: string
  expense_type: ExpenseTypeValue // enum value ("needs", "wants", "savings")
  status: Status
  status_changed_at: string | null
  created_at: string
  updated_at: string
}

// Grouped categories response (for /grouped endpoint)
// API returns with lowercase keys: needs, wants, savings
export interface GroupedCategoriesResponse {
  needs: Category[]
  wants: Category[]
  savings: Category[]
}

// Category statistics response (for /stats endpoint)
export interface CategoryStatsResponse {
  total_categories: number
  by_expense_type: {
    needs: number
    wants: number
    savings: number
  }
  most_used: Category
}

// Filter and query types
export interface CategoryFilters {
  expense_type?: ExpenseTypeValue
  expense_type_name?: string
  status?: Status
  include_deleted?: boolean
}

// State management types
export interface CategoryState {
  categories: Category[]
  groupedCategories: GroupedCategoriesResponse
  categoryStats: CategoryStatsResponse | null
  selectedCategory: Category | null
  isLoading: boolean
  error: string | null
}

// Utility types for category operations
export interface CategoryWithExpenseCount extends Category {
  expense_count: number
}
