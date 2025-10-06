import type {
  CreateExpenseRequest,
  DateRangeQuery,
  Expense,
  ExpenseFilters,
  ExpenseStatusRequest,
  ExpenseSummary,
  ExpensesResponse,
  MonthlyQuery,
  UpdateExpenseRequest,
} from "@/types/expense"
import { apiClient } from "./api"

// Expense API endpoints
export const expenseApi = {
  // Get all expenses
  getAll: async (filters?: ExpenseFilters): Promise<ExpensesResponse> => {
    const params = new URLSearchParams()
    if (filters?.bank_account_id) {
      params.append("bank_account_id", filters.bank_account_id)
    }
    if (filters?.category_id) {
      params.append("category_id", filters.category_id)
    }
    if (filters?.start_date) {
      params.append("start_date", filters.start_date)
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date)
    }
    if (filters?.status) {
      params.append("status", filters.status)
    }
    if (filters?.include_deleted) {
      params.append("include_deleted", filters.include_deleted.toString())
    }

    const response = await apiClient.get<ExpensesResponse>(`/api/v1/expenses?${params.toString()}`)
    return response
  },

  // Create new expense
  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await apiClient.post<Expense>("/api/v1/expenses", data)
    return response
  },

  // Get active expenses only
  getActive: async (): Promise<ExpensesResponse> => {
    const response = await apiClient.get<ExpensesResponse>("/api/v1/expenses/active")
    return response
  },

  // Get expenses by bank account
  getByBankAccount: async (bankAccountId: string): Promise<ExpensesResponse> => {
    const response = await apiClient.get<ExpensesResponse>(
      `/api/v1/expenses/bank-account/${bankAccountId}`
    )
    return response
  },

  // Get expenses by category
  getByCategory: async (categoryId: string): Promise<ExpensesResponse> => {
    const response = await apiClient.get<ExpensesResponse>(
      `/api/v1/expenses/category/${categoryId}`
    )
    return response
  },

  // Get expenses by date range
  getByDateRange: async (query: DateRangeQuery): Promise<ExpensesResponse> => {
    const params = new URLSearchParams({
      start_date: query.start_date,
      end_date: query.end_date,
    })
    if (query.bank_account_id) {
      params.append("bank_account_id", query.bank_account_id)
    }
    if (query.category_id) {
      params.append("category_id", query.category_id)
    }

    const response = await apiClient.get<ExpensesResponse>(
      `/api/v1/expenses/date-range?${params.toString()}`
    )
    return response
  },

  // Get deleted expenses
  getDeleted: async (): Promise<ExpensesResponse> => {
    const response = await apiClient.get<ExpensesResponse>("/api/v1/expenses/deleted")
    return response
  },

  // Get monthly expenses
  getMonthly: async (query: MonthlyQuery): Promise<ExpensesResponse> => {
    const params = new URLSearchParams({
      year: query.year.toString(),
      month: query.month.toString(),
    })
    if (query.bank_account_id) {
      params.append("bank_account_id", query.bank_account_id)
    }
    if (query.category_id) {
      params.append("category_id", query.category_id)
    }

    const response = await apiClient.get<ExpensesResponse>(
      `/api/v1/expenses/monthly?${params.toString()}`
    )
    return response
  },

  // Get expense summary/analytics
  getSummary: async (
    startDate: string,
    endDate: string,
    filters?: Omit<ExpenseFilters, "start_date" | "end_date">
  ): Promise<ExpenseSummary> => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    })
    if (filters?.bank_account_id) {
      params.append("bank_account_id", filters.bank_account_id)
    }
    if (filters?.category_id) {
      params.append("category_id", filters.category_id)
    }

    const response = await apiClient.get<ExpenseSummary>(
      `/api/v1/expenses/summary?${params.toString()}`
    )
    return response
  },

  // Get single expense by ID
  getById: async (id: string): Promise<Expense> => {
    const response = await apiClient.get<Expense>(`/api/v1/expenses/${id}`)
    return response
  },

  // Update expense
  update: async (id: string, data: UpdateExpenseRequest): Promise<Expense> => {
    const response = await apiClient.patch<Expense>(`/api/v1/expenses/${id}`, data)
    return response
  },

  // Delete expense (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/expenses/${id}`)
  },

  // Restore deleted expense
  restore: async (id: string): Promise<Expense> => {
    const response = await apiClient.post<Expense>(`/api/v1/expenses/${id}/restore`)
    return response
  },

  // Update expense status
  updateStatus: async (id: string, data: ExpenseStatusRequest): Promise<Expense> => {
    const response = await apiClient.patch<Expense>(`/api/v1/expenses/${id}/status`, data)
    return response
  },
}
