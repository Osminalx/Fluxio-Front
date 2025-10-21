import { z } from "zod"

// Fixed Expense Type Enum Values (backend enum)
export const EXPENSE_TYPE_VALUES = [
  "needs", // 50% - Essential expenses (housing, food, utilities, minimum debt payments)
  "wants", // 30% - Discretionary spending (entertainment, dining out, hobbies)
  "savings", // 20% - Savings and debt repayment beyond minimums
] as const

// Display Names for UI
export const EXPENSE_TYPE_NAMES = [
  "Needs", // Display name for "needs"
  "Wants", // Display name for "wants"
  "Savings", // Display name for "savings"
] as const

// Fixed Expense Types Configuration
export const EXPENSE_TYPES = [
  { value: "needs", name: "Needs", description: "Essential expenses", percentage: 50 },
  { value: "wants", name: "Wants", description: "Non-essential expenses", percentage: 30 },
  { value: "savings", name: "Savings", description: "Savings & investments", percentage: 20 },
] as const

// Zod schemas for validation
export const expenseTypeValueSchema = z.enum(EXPENSE_TYPE_VALUES)
export const expenseTypeNameSchema = z.enum(EXPENSE_TYPE_NAMES)

// TypeScript types
export type ExpenseTypeValue = z.infer<typeof expenseTypeValueSchema>
export type ExpenseTypeName = z.infer<typeof expenseTypeNameSchema>

// Helper functions to convert between value and name
export const ExpenseTypeConverter = {
  // Convert enum value to display name
  valueToName: (value: ExpenseTypeValue): ExpenseTypeName => {
    switch (value) {
      case "needs":
        return "Needs"
      case "wants":
        return "Wants"
      case "savings":
        return "Savings"
      default:
        throw new Error(`Unknown expense type value: ${value}`)
    }
  },

  // Convert display name to enum value
  nameToValue: (name: ExpenseTypeName): ExpenseTypeValue => {
    switch (name) {
      case "Needs":
        return "needs"
      case "Wants":
        return "wants"
      case "Savings":
        return "savings"
      default:
        throw new Error(`Unknown expense type name: ${name}`)
    }
  },

  // Get expense type config by value
  getByValue: (value: ExpenseTypeValue) => {
    return EXPENSE_TYPES.find((type) => type.value === value)
  },

  // Get expense type config by name
  getByName: (name: ExpenseTypeName) => {
    return EXPENSE_TYPES.find((type) => type.name === name)
  },
}

// Utility functions for the 50/30/20 financial philosophy
export const ExpenseTypeUtils = {
  // Get the recommended percentage for each expense type (by name)
  getRecommendedPercentage: (expenseTypeName: ExpenseTypeName): number => {
    const config = ExpenseTypeConverter.getByName(expenseTypeName)
    return config?.percentage || 0
  },

  // Get the recommended percentage for each expense type (by value)
  getRecommendedPercentageByValue: (expenseTypeValue: ExpenseTypeValue): number => {
    const config = ExpenseTypeConverter.getByValue(expenseTypeValue)
    return config?.percentage || 0
  },

  // Get display color for each expense type (by name)
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

  // Get display color for each expense type (by value)
  getDisplayColorByValue: (expenseTypeValue: ExpenseTypeValue): string => {
    const name = ExpenseTypeConverter.valueToName(expenseTypeValue)
    return ExpenseTypeUtils.getDisplayColor(name)
  },

  // Get description for each expense type (by name)
  getDescription: (expenseTypeName: ExpenseTypeName): string => {
    const config = ExpenseTypeConverter.getByName(expenseTypeName)
    return config?.description || "Unknown expense type"
  },

  // Get description for each expense type (by value)
  getDescriptionByValue: (expenseTypeValue: ExpenseTypeValue): string => {
    const config = ExpenseTypeConverter.getByValue(expenseTypeValue)
    return config?.description || "Unknown expense type"
  },

  // Check if expense type is essential (by name)
  isEssential: (expenseTypeName: ExpenseTypeName): boolean => {
    return expenseTypeName === "Needs"
  },

  // Check if expense type is essential (by value)
  isEssentialByValue: (expenseTypeValue: ExpenseTypeValue): boolean => {
    return expenseTypeValue === "needs"
  },

  // Get all expense type names
  getAllNames: (): ExpenseTypeName[] => {
    return [...EXPENSE_TYPE_NAMES]
  },

  // Get all expense type values
  getAllValues: (): ExpenseTypeValue[] => {
    return [...EXPENSE_TYPE_VALUES]
  },

  // Get all expense type configs
  getAllTypes: () => {
    return [...EXPENSE_TYPES]
  },
}
