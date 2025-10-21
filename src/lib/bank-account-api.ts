import type {
  BankAccount,
  BankAccountFilters,
  BankAccountStatusRequest,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
} from "@/types/bank-account"
import { apiClient } from "./api"

// Bank Account API functions
export const bankAccountApi = {
  // GET /api/v1/bank-accounts
  getAll: async (filters?: BankAccountFilters): Promise<BankAccount[]> => {
    const params = new URLSearchParams()
    if (filters?.include_deleted) {
      params.append("include_deleted", "true")
    }
    if (filters?.status) {
      params.append("status", filters.status)
    }

    const queryString = params.toString()
    const endpoint = `/api/v1/bank-accounts${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.get<BankAccount[] | { bank_accounts: BankAccount[] }>(endpoint)

    // Handle both direct array and wrapped response
    if (Array.isArray(response)) {
      return response
    }
    return (response as { bank_accounts: BankAccount[] }).bank_accounts || []
  },

  // POST /api/v1/bank-accounts
  create: async (data: CreateBankAccountRequest): Promise<BankAccount> => {
    return await apiClient.post<BankAccount>("/api/v1/bank-accounts", data)
  },

  // GET /api/v1/bank-accounts/active
  getActive: async (): Promise<BankAccount[]> => {
    const response = await apiClient.get<BankAccount[] | { bank_accounts: BankAccount[] }>(
      "/api/v1/bank-accounts/active"
    )

    // Handle both direct array and wrapped response
    if (Array.isArray(response)) {
      return response
    }
    return (response as { bank_accounts: BankAccount[] }).bank_accounts || []
  },

  // GET /api/v1/bank-accounts/deleted
  getDeleted: async (): Promise<BankAccount[]> => {
    const response = await apiClient.get<BankAccount[] | { bank_accounts: BankAccount[] }>(
      "/api/v1/bank-accounts/deleted"
    )

    // Handle both direct array and wrapped response
    if (Array.isArray(response)) {
      return response
    }
    return (response as { bank_accounts: BankAccount[] }).bank_accounts || []
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
