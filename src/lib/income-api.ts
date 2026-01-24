import type {
  CreateIncomeRequest,
  Income,
  IncomeFilters,
  IncomeStatusRequest,
  UpdateIncomeRequest,
} from "@/types/income"
import { apiClient } from "./api"

// Helper to normalize response that may be array or wrapped
const normalizeIncomesResponse = (response: Income[] | { incomes: Income[] }): Income[] => {
  if (Array.isArray(response)) {
    return response
  }
  return (response as { incomes: Income[] }).incomes || []
}

export const incomeApi = {
  getAll: async (filters?: IncomeFilters): Promise<Income[]> => {
    const params = new URLSearchParams()
    if (filters?.bank_account_id) {
      params.append("bank_account_id", filters.bank_account_id)
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

    const response = await apiClient.get<Income[] | { incomes: Income[] }>(
      `/api/v1/incomes${params.toString() ? `?${params.toString()}` : ""}`
    )
    return normalizeIncomesResponse(response)
  },

  getActive: async (): Promise<Income[]> => {
    const response = await apiClient.get<Income[] | { incomes: Income[] }>("/api/v1/incomes/active")
    return normalizeIncomesResponse(response)
  },

  getDeleted: async (): Promise<Income[]> => {
    const response = await apiClient.get<Income[] | { incomes: Income[] }>(
      "/api/v1/incomes/deleted"
    )
    return normalizeIncomesResponse(response)
  },

  getById: async (id: string): Promise<Income> => {
    return await apiClient.get<Income>(`/api/v1/incomes/${id}`)
  },

  create: async (data: CreateIncomeRequest): Promise<Income> => {
    return await apiClient.post<Income>("/api/v1/incomes", data)
  },

  update: async (id: string, data: UpdateIncomeRequest): Promise<Income> => {
    return await apiClient.patch<Income>(`/api/v1/incomes/${id}`, data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/incomes/${id}`)
  },

  restore: async (id: string): Promise<Income> => {
    return await apiClient.post<Income>(`/api/v1/incomes/${id}/restore`)
  },

  updateStatus: async (id: string, data: IncomeStatusRequest): Promise<Income> => {
    return await apiClient.patch<Income>(`/api/v1/incomes/${id}/status`, data)
  },
}
