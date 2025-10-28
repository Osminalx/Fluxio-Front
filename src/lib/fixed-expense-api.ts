import type {
  CreateFixedExpenseRequest,
  FixedExpense,
  FixedExpenseCalendarQuery,
  FixedExpenseFilters,
  FixedExpenseStatusRequest,
  UpdateFixedExpenseRequest,
} from "@/types/fixed-expense"
import { apiClient } from "./api"

// Helper to normalize fixed expenses response (handle both array and wrapped formats)
const normalizeFixedExpensesResponse = (
  response: FixedExpense[] | { fixed_expenses: FixedExpense[] }
): FixedExpense[] => {
  if (Array.isArray(response)) {
    return response
  }
  return (response as { fixed_expenses: FixedExpense[] }).fixed_expenses || []
}

// Fixed Expense API endpoints
export const fixedExpenseApi = {
  // Get all fixed expenses
  getAll: async (filters?: FixedExpenseFilters): Promise<FixedExpense[]> => {
    const params = new URLSearchParams()
    if (filters?.include_deleted) {
      params.append("include_deleted", filters.include_deleted.toString())
    }
    if (filters?.status) {
      params.append("status", filters.status)
    }

    const queryString = params.toString()
    const endpoint = queryString
      ? `/api/v1/fixed-expenses?${queryString}`
      : "/api/v1/fixed-expenses"

    const response = await apiClient.get<FixedExpense[] | { fixed_expenses: FixedExpense[] }>(
      endpoint
    )
    return normalizeFixedExpensesResponse(response)
  },

  // Get fixed expenses for a specific month (calendar view)
  getCalendar: async (query: FixedExpenseCalendarQuery): Promise<FixedExpense[]> => {
    const params = new URLSearchParams({
      year: query.year.toString(),
      month: query.month.toString(),
    })

    const response = await apiClient.get<FixedExpense[] | { fixed_expenses: FixedExpense[] }>(
      `/api/v1/fixed-expenses/calendar?${params.toString()}`
    )
    return normalizeFixedExpensesResponse(response)
  },

  // Create new fixed expense
  create: async (data: CreateFixedExpenseRequest): Promise<FixedExpense> => {
    const response = await apiClient.post<FixedExpense>("/api/v1/fixed-expenses", data)
    return response
  },

  // Get single fixed expense by ID
  getById: async (id: string): Promise<FixedExpense> => {
    const response = await apiClient.get<FixedExpense>(`/api/v1/fixed-expenses/${id}`)
    return response
  },

  // Update fixed expense
  update: async (id: string, data: UpdateFixedExpenseRequest): Promise<FixedExpense> => {
    const response = await apiClient.patch<FixedExpense>(`/api/v1/fixed-expenses/${id}`, data)
    return response
  },

  // Delete fixed expense (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/fixed-expenses/${id}`)
  },

  // Restore deleted fixed expense
  restore: async (id: string): Promise<FixedExpense> => {
    const response = await apiClient.post<FixedExpense>(`/api/v1/fixed-expenses/${id}/restore`)
    return response
  },

  // Update fixed expense status
  updateStatus: async (id: string, data: FixedExpenseStatusRequest): Promise<FixedExpense> => {
    const response = await apiClient.patch<FixedExpense>(
      `/api/v1/fixed-expenses/${id}/status`,
      data
    )
    return response
  },
}
