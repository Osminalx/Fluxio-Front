import { z } from "zod"
import type { ExpenseType } from "./expense-type"
import { type Status, statusSchema } from "./status"

// Zod Schemas for validation
export const createCategorySchema = z.object({
  expense_type_id: z.string().uuid("Invalid expense type ID"),
  name: z.string().min(1, "Category name is required"),
})

export const updateCategorySchema = z.object({
  expense_type_id: z.string().uuid("Invalid expense type ID").optional(),
  name: z.string().min(1, "Category name is required").optional(),
})

export const categoryStatusSchema = z.object({
  status: statusSchema,
})

// TypeScript types inferred from schemas
export type CreateCategoryRequest = z.infer<typeof createCategorySchema>
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>
export type CategoryStatusRequest = z.infer<typeof categoryStatusSchema>

// API Response types
export interface Category {
  id: string
  name: string
  status: Status
  expense_type_id: string
  expense_type: ExpenseType
  created_at: string
  updated_at: string
  status_changed_at: string
}

export interface CategoriesResponse {
  categories: Category[]
  count: number
}

// Grouped categories response (for /grouped endpoint)
export interface GroupedCategoriesResponse {
  [expenseTypeName: string]: Category[]
}

// Category statistics response (for /stats endpoint)
export interface CategoryStats {
  category_id: string
  category_name: string
  expense_type_name: string
  total_expenses: number
  total_amount: number
  average_amount: number
  last_expense_date: string | null
}

export interface CategoryStatsResponse {
  stats: CategoryStats[]
  count: number
}

// Filter and query types
export interface CategoryFilters {
  expense_type_id?: string
  expense_type_name?: string
  status?: Status
  include_deleted?: boolean
}

// State management types
export interface CategoryState {
  categories: Category[]
  groupedCategories: GroupedCategoriesResponse
  categoryStats: CategoryStats[]
  selectedCategory: Category | null
  isLoading: boolean
  error: string | null
}

// Utility types for category operations
export interface CategoryWithExpenseCount extends Category {
  expense_count: number
}

export interface DefaultCategoriesRequest {
  expense_type_ids: string[]
}
