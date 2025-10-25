import type {
  BudgetHistory,
  BudgetHistoryDateRangeParams,
  BudgetHistoryPatterns,
  BudgetHistoryResponse,
  BudgetHistoryStats,
} from "@/types/budget-history"
import { apiClient } from "./api"

// Budget History API functions
export const budgetHistoryApi = {
  // GET /api/v1/budget-history
  getAll: async (): Promise<BudgetHistoryResponse> => {
    return await apiClient.get<BudgetHistoryResponse>("/api/v1/budget-history")
  },

  // GET /api/v1/budget-history/:id
  getById: async (id: string): Promise<BudgetHistory> => {
    return await apiClient.get<BudgetHistory>(`/api/v1/budget-history/${id}`)
  },

  // GET /api/v1/budgets/:budgetId/history
  getByBudgetId: async (budgetId: string): Promise<BudgetHistoryResponse> => {
    return await apiClient.get<BudgetHistoryResponse>(`/api/v1/budgets/${budgetId}/history`)
  },

  // GET /api/v1/budget-history/date-range
  getByDateRange: async (params: BudgetHistoryDateRangeParams): Promise<BudgetHistoryResponse> => {
    const searchParams = new URLSearchParams({
      start_date: params.start_date,
      end_date: params.end_date,
    })

    return await apiClient.get<BudgetHistoryResponse>(
      `/api/v1/budget-history/date-range?${searchParams.toString()}`
    )
  },

  // GET /api/v1/budget-history/reasons
  getWithReasons: async (): Promise<BudgetHistoryResponse> => {
    return await apiClient.get<BudgetHistoryResponse>("/api/v1/budget-history/reasons")
  },

  // GET /api/v1/budget-history/stats
  getStats: async (): Promise<BudgetHistoryStats> => {
    return await apiClient.get<BudgetHistoryStats>("/api/v1/budget-history/stats")
  },

  // GET /api/v1/budget-history/patterns
  getPatterns: async (): Promise<BudgetHistoryPatterns> => {
    return await apiClient.get<BudgetHistoryPatterns>("/api/v1/budget-history/patterns")
  },
}
