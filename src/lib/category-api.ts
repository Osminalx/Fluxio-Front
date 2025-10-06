import type {
  CategoriesResponse,
  Category,
  CategoryStatsResponse,
  CategoryStatusRequest,
  CreateCategoryRequest,
  DefaultCategoriesRequest,
  GroupedCategoriesResponse,
  UpdateCategoryRequest,
} from "@/types/category"
import { apiClient } from "./api"

// Category API endpoints
export const categoryApi = {
  // Get all categories
  getAll: async (): Promise<CategoriesResponse> => {
    const response = await apiClient.get<CategoriesResponse>("/user-categories")
    return response
  },

  // Create new category
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>("/user-categories", data)
    return response
  },

  // Create default categories for expense types
  createDefaults: async (data: DefaultCategoriesRequest): Promise<CategoriesResponse> => {
    const response = await apiClient.post<CategoriesResponse>("/user-categories/defaults", data)
    return response
  },

  // Get categories by expense type name
  getByExpenseTypeName: async (expenseTypeName: string): Promise<CategoriesResponse> => {
    const response = await apiClient.get<CategoriesResponse>(
      `/user-categories/expense-type-name/${expenseTypeName}`
    )
    return response
  },

  // Get categories by expense type ID
  getByExpenseTypeId: async (expenseTypeId: string): Promise<CategoriesResponse> => {
    const response = await apiClient.get<CategoriesResponse>(
      `/user-categories/expense-type/${expenseTypeId}`
    )
    return response
  },

  // Get grouped categories (by expense type)
  getGrouped: async (): Promise<GroupedCategoriesResponse> => {
    const response = await apiClient.get<GroupedCategoriesResponse>("/user-categories/grouped")
    return response
  },

  // Get category statistics
  getStats: async (): Promise<CategoryStatsResponse> => {
    const response = await apiClient.get<CategoryStatsResponse>("/user-categories/stats")
    return response
  },

  // Get single category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/user-categories/${id}`)
    return response
  },

  // Update category
  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<Category>(`/user-categories/${id}`, data)
    return response
  },

  // Delete category (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/user-categories/${id}`)
  },

  // Restore deleted category
  restore: async (id: string): Promise<Category> => {
    const response = await apiClient.post<Category>(`/user-categories/${id}/restore`)
    return response
  },

  // Update category status
  updateStatus: async (id: string, data: CategoryStatusRequest): Promise<Category> => {
    const response = await apiClient.patch<Category>(`/user-categories/${id}/status`, data)
    return response
  },
}
