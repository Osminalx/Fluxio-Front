import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  BankAccountFilters,
  BankAccountStatusRequest,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
} from "@/types/bank-account"
import type { Status } from "@/types/status"
import { bankAccountApi } from "./bank-account-api"

// Query keys for TanStack Query
export const bankAccountKeys = {
  all: ["bankAccounts"] as const,
  lists: () => [...bankAccountKeys.all, "list"] as const,
  list: (filters?: BankAccountFilters) => [...bankAccountKeys.lists(), filters] as const,
  details: () => [...bankAccountKeys.all, "detail"] as const,
  detail: (id: string) => [...bankAccountKeys.details(), id] as const,
  active: () => [...bankAccountKeys.all, "active"] as const,
  deleted: () => [...bankAccountKeys.all, "deleted"] as const,
} as const

// Hook for getting all bank accounts
export function useBankAccounts(filters?: BankAccountFilters) {
  return useQuery({
    queryKey: bankAccountKeys.list(filters),
    queryFn: () => bankAccountApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting active bank accounts
export function useActiveBankAccounts() {
  return useQuery({
    queryKey: bankAccountKeys.active(),
    queryFn: bankAccountApi.getActive,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting deleted bank accounts
export function useDeletedBankAccounts() {
  return useQuery({
    queryKey: bankAccountKeys.deleted(),
    queryFn: bankAccountApi.getDeleted,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting a single bank account
export function useBankAccount(id: string) {
  return useQuery({
    queryKey: bankAccountKeys.detail(id),
    queryFn: () => bankAccountApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for creating a bank account
export function useCreateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBankAccountRequest) => bankAccountApi.create(data),
    onSuccess: (newAccount) => {
      // Invalidate and refetch bank accounts list
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })

      // Add the new account to the cache
      queryClient.setQueryData(bankAccountKeys.detail(newAccount.id), newAccount)
    },
  })
}

// Hook for updating a bank account
export function useUpdateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBankAccountRequest }) =>
      bankAccountApi.update(id, data),
    onSuccess: (updatedAccount, { id }) => {
      // Update the specific account in cache
      queryClient.setQueryData(bankAccountKeys.detail(id), updatedAccount)

      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}

// Hook for deleting a bank account
export function useDeleteBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bankAccountApi.delete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: bankAccountKeys.lists() })

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: bankAccountKeys.lists() })

      // Optimistically update all list queries by marking the account as deleted
      queryClient.setQueriesData({ queryKey: bankAccountKeys.lists() }, (old: unknown) => {
        if (!Array.isArray(old)) {
          return old
        }

        return old.map((account: { id: string; status: Status; [key: string]: unknown }) =>
          account.id === id ? { ...account, status: "deleted" as Status } : account
        )
      })

      // Return a context object with the snapshotted value
      return { previousData }
    },
    onError: (_err, _id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.deleted() })
    },
  })
}

// Hook for restoring a bank account
export function useRestoreBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bankAccountApi.restore(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: bankAccountKeys.lists() })

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: bankAccountKeys.lists() })

      // Optimistically update all list queries by marking the account as active
      queryClient.setQueriesData({ queryKey: bankAccountKeys.lists() }, (old: unknown) => {
        if (!Array.isArray(old)) {
          return old
        }

        return old.map((account: { id: string; status: Status; [key: string]: unknown }) =>
          account.id === id ? { ...account, status: "active" as Status } : account
        )
      })

      // Return a context object with the snapshotted value
      return { previousData }
    },
    onSuccess: (restoredAccount, id) => {
      // Update the specific account in cache with the actual response
      if (restoredAccount) {
        queryClient.setQueryData(bankAccountKeys.detail(id), restoredAccount)

        // Update the optimistic data with the real data
        queryClient.setQueriesData({ queryKey: bankAccountKeys.lists() }, (old: unknown) => {
          if (!Array.isArray(old)) {
            return old
          }

          return old.map((account: { id: string; [key: string]: unknown }) =>
            account.id === id ? restoredAccount : account
          )
        })
      }
    },
    onError: (_err, _id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.deleted() })
    },
  })
}

// Hook for updating bank account status
export function useUpdateBankAccountStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BankAccountStatusRequest }) =>
      bankAccountApi.updateStatus(id, data),
    onSuccess: (updatedAccount, { id }) => {
      // Update the specific account in cache
      queryClient.setQueryData(bankAccountKeys.detail(id), updatedAccount)

      // Invalidate all relevant queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.deleted() })
    },
  })
}
