import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  CreateFixedExpenseRequest,
  FixedExpenseFilters,
  UpdateFixedExpenseRequest,
} from "@/types/fixed-expense"
import { fixedExpenseApi } from "./fixed-expense-api"

// Query keys
export const fixedExpenseKeys = {
  all: ["fixed-expenses"] as const,
  lists: () => [...fixedExpenseKeys.all, "list"] as const,
  list: (filters?: FixedExpenseFilters) => [...fixedExpenseKeys.lists(), { filters }] as const,
  calendar: (year: number, month: number) =>
    [...fixedExpenseKeys.all, "calendar", year, month] as const,
  details: () => [...fixedExpenseKeys.all, "detail"] as const,
  detail: (id: string) => [...fixedExpenseKeys.details(), id] as const,
}

// Queries
export function useFixedExpensesQuery(filters?: FixedExpenseFilters) {
  return useQuery({
    queryKey: fixedExpenseKeys.list(filters),
    queryFn: () => fixedExpenseApi.getAll(filters),
  })
}

export function useFixedExpensesCalendarQuery(year: number, month: number) {
  return useQuery({
    queryKey: fixedExpenseKeys.calendar(year, month),
    queryFn: () => fixedExpenseApi.getCalendar({ year, month }),
    enabled: !!year && !!month,
  })
}

export function useFixedExpenseQuery(id: string) {
  return useQuery({
    queryKey: fixedExpenseKeys.detail(id),
    queryFn: () => fixedExpenseApi.getById(id),
    enabled: !!id,
  })
}

// Mutations
export function useCreateFixedExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFixedExpenseRequest) => fixedExpenseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() })
    },
  })
}

export function useUpdateFixedExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFixedExpenseRequest }) =>
      fixedExpenseApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.detail(variables.id) })
    },
  })
}

export function useDeleteFixedExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fixedExpenseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() })
    },
  })
}

export function useRestoreFixedExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fixedExpenseApi.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.detail(id) })
    },
  })
}
