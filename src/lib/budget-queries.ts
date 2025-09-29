import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  BudgetFilters,
  BudgetStatusRequest,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "@/types/budgets"
import type { Status } from "@/types/status"
import { budgetApi } from "./budget-api"

// Query keys for TanStack Query
export const budgetKeys = {
  all: ["budgets"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (filters?: BudgetFilters) => [...budgetKeys.lists(), filters] as const,
  details: () => [...budgetKeys.all, "detail"] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
  active: () => [...budgetKeys.all, "active"] as const,
  deleted: () => [...budgetKeys.all, "deleted"] as const,
  byMonth: (monthYear?: string) => [...budgetKeys.all, "by-month", monthYear] as const,
} as const

// Hook for getting all budgets
export function useBudgets(filters?: BudgetFilters) {
  return useQuery({
    queryKey: budgetKeys.list(filters),
    queryFn: () => budgetApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting active budgets
export function useActiveBudgets() {
  return useQuery({
    queryKey: budgetKeys.active(),
    queryFn: budgetApi.getActive,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting deleted budgets
export function useDeletedBudgets() {
  return useQuery({
    queryKey: budgetKeys.deleted(),
    queryFn: budgetApi.getDeleted,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting budgets by month
export function useBudgetsByMonth(monthYear?: string) {
  return useQuery({
    queryKey: budgetKeys.byMonth(monthYear),
    queryFn: () => budgetApi.getByMonth(monthYear),
    enabled: !!monthYear,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting a single budget
export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => budgetApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for creating a budget
export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => budgetApi.create(data),
    onSuccess: (newBudget) => {
      // Invalidate and refetch budgets list
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.active() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.byMonth() })

      // Add the new budget to the cache
      queryClient.setQueryData(budgetKeys.detail(newBudget.id), newBudget)
    },
  })
}

// Hook for updating a budget
export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetRequest }) =>
      budgetApi.update(id, data),
    onSuccess: (updatedBudget, { id }) => {
      // Update the specific budget in cache
      queryClient.setQueryData(budgetKeys.detail(id), updatedBudget)

      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.active() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.byMonth() })
    },
  })
}

// Hook for deleting a budget
export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetApi.delete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: budgetKeys.lists() })

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: budgetKeys.lists() })

      // Optimistically update all list queries by marking the budget as deleted
      queryClient.setQueriesData({ queryKey: budgetKeys.lists() }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("budgets" in old)) {
          return old
        }

        const data = old as {
          budgets: Array<{ id: string; status: Status; [key: string]: unknown }>
        }

        return {
          ...data,
          budgets: data.budgets.map((budget) =>
            budget.id === id ? { ...budget, status: "deleted" } : budget
          ),
        }
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
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.active() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.deleted() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.byMonth() })
    },
  })
}

// Hook for restoring a budget
export function useRestoreBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetApi.restore(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: budgetKeys.lists() })

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: budgetKeys.lists() })

      // Optimistically update all list queries by marking the budget as active
      queryClient.setQueriesData({ queryKey: budgetKeys.lists() }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("budgets" in old)) {
          return old
        }

        const data = old as {
          budgets: Array<{ id: string; status: Status; [key: string]: unknown }>
        }

        return {
          ...data,
          budgets: data.budgets.map((budget) =>
            budget.id === id ? { ...budget, status: "active" } : budget
          ),
        }
      })

      // Return a context object with the snapshotted value
      return { previousData }
    },
    onSuccess: (restoredBudget, id) => {
      // Update the specific budget in cache with the actual response
      if (restoredBudget) {
        queryClient.setQueryData(budgetKeys.detail(id), restoredBudget)

        // Update the optimistic data with the real data
        queryClient.setQueriesData({ queryKey: budgetKeys.lists() }, (old: unknown) => {
          if (!old || typeof old !== "object" || !("budgets" in old)) {
            return old
          }

          const data = old as { budgets: Array<{ id: string; [key: string]: unknown }> }

          return {
            ...data,
            budgets: data.budgets.map((budget) => (budget.id === id ? restoredBudget : budget)),
          }
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
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.active() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.deleted() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.byMonth() })
    },
  })
}

// Hook for updating budget status
export function useUpdateBudgetStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetStatusRequest }) =>
      budgetApi.updateStatus(id, data),
    onSuccess: (updatedBudget, { id }) => {
      // Update the specific budget in cache
      queryClient.setQueryData(budgetKeys.detail(id), updatedBudget)

      // Invalidate all relevant queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.active() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.deleted() })
      queryClient.invalidateQueries({ queryKey: budgetKeys.byMonth() })
    },
  })
}

