import { z } from "zod"
import { type Status, statusSchema } from "./status"

// Expense Type Names following the 50/30/20 financial philosophy
export const EXPENSE_TYPE_NAMES = [
  "Needs", // 50% - Essential expenses (housing, food, utilities, minimum debt payments)
  "Wants", // 30% - Discretionary spending (entertainment, dining out, hobbies)
  "Savings", // 20% - Savings and debt repayment beyond minimums
] as const

// Zod schema for expense type name validation
export const expenseTypeNameSchema = z.enum(EXPENSE_TYPE_NAMES)

// TypeScript type for expense type name
export type ExpenseTypeName = z.infer<typeof expenseTypeNameSchema>

// Zod Schemas for validation
export const expenseTypeSchema = z.object({
  id: z.string().uuid(),
  name: expenseTypeNameSchema,
  status: statusSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

// API Response types
export interface ExpenseType {
  id: string
  name: ExpenseTypeName
  status: Status
  created_at: string
  updated_at: string
}

// For expense types with categories included
export interface ExpenseTypeWithCategories extends ExpenseType {
  categories: CategoryBase[]
}

export interface ExpenseTypesResponse {
  expense_types: ExpenseType[]
  count: number
}

export interface ExpenseTypesWithCategoriesResponse {
  expense_types: ExpenseTypeWithCategories[]
  count: number
}

// Forward declaration to avoid circular imports
// The full Category interface is defined in category.ts
export interface CategoryBase {
  id: string
  name: string
  status: Status
  expense_type_id: string
  created_at: string
  updated_at: string
  status_changed_at: string
}

// Filter and query types
export interface ExpenseTypeFilters {
  name?: ExpenseTypeName
  status?: Status
  include_categories?: boolean
}

// State management types
export interface ExpenseTypeState {
  expenseTypes: ExpenseType[]
  expenseTypesWithCategories: ExpenseTypeWithCategories[]
  selectedExpenseType: ExpenseType | null
  isLoading: boolean
  error: string | null
}

// Utility functions for the 50/30/20 financial philosophy
export const ExpenseTypeUtils = {
  // Get the recommended percentage for each expense type
  getRecommendedPercentage: (expenseTypeName: ExpenseTypeName): number => {
    switch (expenseTypeName) {
      case "Needs":
        return 50
      case "Wants":
        return 30
      case "Savings":
        return 20
      default:
        return 0
    }
  },

  // Get display color for each expense type
  getDisplayColor: (expenseTypeName: ExpenseTypeName): string => {
    switch (expenseTypeName) {
      case "Needs":
        return "#ef4444" // red-500 - essential/critical
      case "Wants":
        return "#f59e0b" // amber-500 - optional/discretionary
      case "Savings":
        return "#10b981" // emerald-500 - growth/positive
      default:
        return "#6b7280" // gray-500 - neutral
    }
  },

  // Get description for each expense type
  getDescription: (expenseTypeName: ExpenseTypeName): string => {
    switch (expenseTypeName) {
      case "Needs":
        return "Essential expenses like housing, food, utilities, and minimum debt payments"
      case "Wants":
        return "Discretionary spending like entertainment, dining out, and hobbies"
      case "Savings":
        return "Savings and debt repayment beyond minimum requirements"
      default:
        return "Unknown expense type"
    }
  },

  // Check if expense type is essential
  isEssential: (expenseTypeName: ExpenseTypeName): boolean => {
    return expenseTypeName === "Needs"
  },

  // Get all expense type names
  getAllNames: (): ExpenseTypeName[] => {
    return [...EXPENSE_TYPE_NAMES]
  },
}
