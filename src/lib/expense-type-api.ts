import type {
  ExpenseType,
  ExpenseTypeName,
  ExpenseTypesResponse,
  ExpenseTypesWithCategoriesResponse,
} from "@/types/expense-type"
import { apiClient } from "./api"

// Expense Type API endpoints
export const expenseTypeApi = {
  // Get all expense types
  getAll: async (): Promise<ExpenseTypesResponse> => {
    const response = await apiClient.get<ExpenseTypesResponse>("/expense-types")
    return response
  },

  // Get expense type by name (using the enum values)
  getByName: async (name: ExpenseTypeName): Promise<ExpenseType> => {
    const response = await apiClient.get<ExpenseType>(`/expense-types/name/${name}`)
    return response
  },

  // Get expense types with their categories
  getWithCategories: async (): Promise<ExpenseTypesWithCategoriesResponse> => {
    const response = await apiClient.get<ExpenseTypesWithCategoriesResponse>(
      "/expense-types/with-categories"
    )
    return response
  },

  // Get single expense type by ID
  getById: async (id: string): Promise<ExpenseType> => {
    const response = await apiClient.get<ExpenseType>(`/expense-types/${id}`)
    return response
  },
}
