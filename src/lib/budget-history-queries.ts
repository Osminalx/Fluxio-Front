import { useQuery } from "@tanstack/react-query"
import type { BudgetHistoryDateRangeParams } from "@/types/budget-history"
import { budgetHistoryApi } from "./budget-history-api"

// Query keys for TanStack Query
export const budgetHistoryKeys = {
  all: ["budget-history"] as const,
  lists: () => [...budgetHistoryKeys.all, "list"] as const,
  list: () => [...budgetHistoryKeys.lists()] as const,
  details: () => [...budgetHistoryKeys.all, "detail"] as const,
  detail: (id: string) => [...budgetHistoryKeys.details(), id] as const,
  byBudget: (budgetId: string) => [...budgetHistoryKeys.all, "by-budget", budgetId] as const,
  dateRange: (params: BudgetHistoryDateRangeParams) =>
    [...budgetHistoryKeys.all, "date-range", params] as const,
  withReasons: () => [...budgetHistoryKeys.all, "with-reasons"] as const,
  stats: () => [...budgetHistoryKeys.all, "stats"] as const,
  patterns: () => [...budgetHistoryKeys.all, "patterns"] as const,
} as const

// Hook for getting all budget history
export function useBudgetHistory() {
  return useQuery({
    queryKey: budgetHistoryKeys.list(),
    queryFn: budgetHistoryApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting a single budget history entry
export function useBudgetHistoryById(id: string) {
  return useQuery({
    queryKey: budgetHistoryKeys.detail(id),
    queryFn: () => budgetHistoryApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting budget history by budget ID
export function useBudgetHistoryByBudgetId(budgetId: string) {
  return useQuery({
    queryKey: budgetHistoryKeys.byBudget(budgetId),
    queryFn: () => budgetHistoryApi.getByBudgetId(budgetId),
    enabled: !!budgetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting budget history by date range
export function useBudgetHistoryByDateRange(params: BudgetHistoryDateRangeParams, enabled = true) {
  return useQuery({
    queryKey: budgetHistoryKeys.dateRange(params),
    queryFn: () => budgetHistoryApi.getByDateRange(params),
    enabled: enabled && !!params.start_date && !!params.end_date,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting budget history with reasons
export function useBudgetHistoryWithReasons() {
  return useQuery({
    queryKey: budgetHistoryKeys.withReasons(),
    queryFn: budgetHistoryApi.getWithReasons,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for getting budget history statistics
export function useBudgetHistoryStats() {
  return useQuery({
    queryKey: budgetHistoryKeys.stats(),
    queryFn: budgetHistoryApi.getStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for getting budget history patterns
export function useBudgetHistoryPatterns() {
  return useQuery({
    queryKey: budgetHistoryKeys.patterns(),
    queryFn: budgetHistoryApi.getPatterns,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}
