import type {
  Budget,
  BudgetFilters,
  BudgetResponse,
  BudgetStatusRequest,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "@/types/budgets"
import { apiClient } from "./api"

// Budget API functions
export const budgetApi = {
  // GET /api/v1/budgets
  getAll: async (filters?: BudgetFilters): Promise<BudgetResponse> => {
    const params = new URLSearchParams()
    if (filters?.include_deleted) {
      params.append("include_deleted", "true")
    }
    if (filters?.month_year) {
      params.append("month_year", filters.month_year)
    }

    const queryString = params.toString()
    const endpoint = `/api/v1/budgets${queryString ? `?${queryString}` : ""}`

    return await apiClient.get<BudgetResponse>(endpoint)
  },

  // POST /api/v1/budgets
  create: async (data: CreateBudgetRequest): Promise<Budget> => {
    return await apiClient.post<Budget>("/api/v1/budgets", data)
  },

  // GET /api/v1/budgets/active
  getActive: async (): Promise<BudgetResponse> => {
    return await apiClient.get<BudgetResponse>("/api/v1/budgets/active")
  },

  // GET /api/v1/budgets/by-month
  getByMonth: async (monthYear?: string): Promise<BudgetResponse> => {
    const params = new URLSearchParams()
    if (monthYear) {
      params.append("month_year", monthYear)
    }

    const queryString = params.toString()
    const endpoint = `/api/v1/budgets/by-month${queryString ? `?${queryString}` : ""}`

    return await apiClient.get<BudgetResponse>(endpoint)
  },

  // GET /api/v1/budgets/deleted
  getDeleted: async (): Promise<BudgetResponse> => {
    return await apiClient.get<BudgetResponse>("/api/v1/budgets/deleted")
  },

  // GET /api/v1/budgets/{id}
  getById: async (id: string): Promise<Budget> => {
    return await apiClient.get<Budget>(`/api/v1/budgets/${id}`)
  },

  // PATCH /api/v1/budgets/{id}
  update: async (id: string, data: UpdateBudgetRequest): Promise<Budget> => {
    return await apiClient.patch<Budget>(`/api/v1/budgets/${id}`, data)
  },

  // DELETE /api/v1/budgets/{id}
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete<void>(`/api/v1/budgets/${id}`)
  },

  // POST /api/v1/budgets/{id}/restore
  restore: async (id: string): Promise<Budget> => {
    return await apiClient.post<Budget>(`/api/v1/budgets/${id}/restore`)
  },

  // PATCH /api/v1/budgets/{id}/status
  updateStatus: async (id: string, data: BudgetStatusRequest): Promise<Budget> => {
    return await apiClient.patch<Budget>(`/api/v1/budgets/${id}/status`, data)
  },
}

