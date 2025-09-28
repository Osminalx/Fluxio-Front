import type {
  BankAccount,
  BankAccountFilters,
  BankAccountStatusRequest,
  BankAccountsResponse,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
} from "@/types/bank-account"
import { apiClient } from "./api"

// Bank Account API functions
export const bankAccountApi = {
  // GET /api/v1/bank-accounts
  getAll: async (filters?: BankAccountFilters): Promise<BankAccountsResponse> => {
    const params = new URLSearchParams()
    if (filters?.include_deleted) {
      params.append("include_deleted", "true")
    }
    if (filters?.status) {
      params.append("status", filters.status)
    }

    const queryString = params.toString()
    const endpoint = `/api/v1/bank-accounts${queryString ? `?${queryString}` : ""}`

    return await apiClient.get<BankAccountsResponse>(endpoint)
  },

  // POST /api/v1/bank-accounts
  create: async (data: CreateBankAccountRequest): Promise<BankAccount> => {
    return await apiClient.post<BankAccount>("/api/v1/bank-accounts", data)
  },

  // GET /api/v1/bank-accounts/active
  getActive: async (): Promise<BankAccountsResponse> => {
    return await apiClient.get<BankAccountsResponse>("/api/v1/bank-accounts/active")
  },

  // GET /api/v1/bank-accounts/deleted
  getDeleted: async (): Promise<BankAccountsResponse> => {
    return await apiClient.get<BankAccountsResponse>("/api/v1/bank-accounts/deleted")
  },

  // GET /api/v1/bank-accounts/{id}
  getById: async (id: string): Promise<BankAccount> => {
    return await apiClient.get<BankAccount>(`/api/v1/bank-accounts/${id}`)
  },

  // PATCH /api/v1/bank-accounts/{id}
  update: async (id: string, data: UpdateBankAccountRequest): Promise<BankAccount> => {
    return await apiClient.patch<BankAccount>(`/api/v1/bank-accounts/${id}`, data)
  },

  // DELETE /api/v1/bank-accounts/{id}
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete<void>(`/api/v1/bank-accounts/${id}`)
  },

  // POST /api/v1/bank-accounts/{id}/restore
  restore: async (id: string): Promise<BankAccount> => {
    return await apiClient.post<BankAccount>(`/api/v1/bank-accounts/${id}/restore`)
  },

  // PATCH /api/v1/bank-accounts/{id}/status
  updateStatus: async (id: string, data: BankAccountStatusRequest): Promise<BankAccount> => {
    return await apiClient.patch<BankAccount>(`/api/v1/bank-accounts/${id}/status`, data)
  },
}
