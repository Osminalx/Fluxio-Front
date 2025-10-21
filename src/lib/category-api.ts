import type {
  Category,
  CategoryStatsResponse,
  CategoryStatusRequest,
  CreateCategoryRequest,
  GroupedCategoriesResponse,
  UpdateCategoryRequest,
} from "@/types/category"
import { apiClient } from "./api"

// Helper to normalize category response (handle both array and wrapped formats)
const normalizeCategoriesResponse = (
  response: Category[] | { categories: Category[] }
): Category[] => {
  if (Array.isArray(response)) {
    return response
  }
  return (response as { categories: Category[] }).categories || []
}

// Category API endpoints
export const categoryApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[] | { categories: Category[] }>(
      "/api/v1/user-categories"
    )
    return normalizeCategoriesResponse(response)
  },

  // Create new category
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>("/api/v1/user-categories", data)
    return response
  },

  // Create default categories for expense types
  createDefaults: async (): Promise<Category[]> => {
    const response = await apiClient.post<Category[] | { categories: Category[] }>(
      "/api/v1/user-categories/defaults"
    )
    return normalizeCategoriesResponse(response)
  },

  // Get categories by expense type name
  getByExpenseTypeName: async (expenseTypeName: string): Promise<Category[]> => {
    const response = await apiClient.get<Category[] | { categories: Category[] }>(
      `/api/v1/user-categories/expense-type-name/${expenseTypeName}`
    )
    return normalizeCategoriesResponse(response)
  },

  // Get categories by expense type value
  getByExpenseType: async (expenseType: string): Promise<Category[]> => {
    const response = await apiClient.get<Category[] | { categories: Category[] }>(
      `/api/v1/user-categories/expense-type/${expenseType}`
    )
    return normalizeCategoriesResponse(response)
  },

  // Get grouped categories (by expense type)
  getGrouped: async (): Promise<GroupedCategoriesResponse> => {
    const response = await apiClient.get<
      Record<string, unknown> | { grouped_categories: Record<string, unknown> }
    >("/api/v1/user-categories/grouped")

    let data: Record<string, unknown>

    // Handle wrapped response
    if (response && "grouped_categories" in response) {
      data = response.grouped_categories as Record<string, unknown>
    } else {
      data = response
    }

    // Normalize keys to lowercase (backend sends "Needs", "Wants", "Savings")
    const normalized: GroupedCategoriesResponse = {
      needs: (data.Needs || data.needs || []) as Category[],
      wants: (data.Wants || data.wants || []) as Category[],
      savings: (data.Savings || data.savings || []) as Category[],
    }

    return normalized
  },

  // Get category statistics
  getStats: async (): Promise<CategoryStatsResponse> => {
    const response = await apiClient.get<CategoryStatsResponse>("/api/v1/user-categories/stats")
    return response
  },

  // Get single category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/api/v1/user-categories/${id}`)
    return response
  },

  // Update category
  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<Category>(`/api/v1/user-categories/${id}`, data)
    return response
  },

  // Delete category (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/user-categories/${id}`)
  },

  // Restore deleted category
  restore: async (id: string): Promise<Category> => {
    const response = await apiClient.post<Category>(`/api/v1/user-categories/${id}/restore`)
    return response
  },

  // Update category status
  updateStatus: async (id: string, data: CategoryStatusRequest): Promise<Category> => {
    const response = await apiClient.patch<Category>(`/api/v1/user-categories/${id}/status`, data)
    return response
  },
}
