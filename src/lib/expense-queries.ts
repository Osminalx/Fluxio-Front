import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  CreateExpenseRequest,
  DateRangeQuery,
  ExpenseFilters,
  ExpenseStatusRequest,
  MonthlyQuery,
  UpdateExpenseRequest,
} from "@/types/expense"
import { expenseApi } from "./expense-api"
import { bankAccountKeys } from "./bank-account-queries"

// Query keys
export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters?: ExpenseFilters) => [...expenseKeys.lists(), { filters }] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  active: () => [...expenseKeys.all, "active"] as const,
  deleted: () => [...expenseKeys.all, "deleted"] as const,
  summary: (filters?: ExpenseFilters) => [...expenseKeys.all, "summary", { filters }] as const,
  byBankAccount: (bankAccountId: string) =>
    [...expenseKeys.all, "bank-account", bankAccountId] as const,
  byCategory: (categoryId: string) => [...expenseKeys.all, "category", categoryId] as const,
  byDateRange: (query: DateRangeQuery) => [...expenseKeys.all, "date-range", query] as const,
  monthly: (query: MonthlyQuery) => [...expenseKeys.all, "monthly", query] as const,
}

// Queries
export const useExpensesQuery = (filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => expenseApi.getAll(filters),
  })
}

export const useExpenseQuery = (id: string) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expenseApi.getById(id),
    enabled: !!id,
  })
}

export const useActiveExpensesQuery = () => {
  return useQuery({
    queryKey: expenseKeys.active(),
    queryFn: expenseApi.getActive,
  })
}

export const useDeletedExpensesQuery = () => {
  return useQuery({
    queryKey: expenseKeys.deleted(),
    queryFn: expenseApi.getDeleted,
  })
}

export const useExpensesByBankAccountQuery = (bankAccountId: string) => {
  return useQuery({
    queryKey: expenseKeys.byBankAccount(bankAccountId),
    queryFn: () => expenseApi.getByBankAccount(bankAccountId),
    enabled: !!bankAccountId,
  })
}

export const useExpensesByCategoryQuery = (categoryId: string) => {
  return useQuery({
    queryKey: expenseKeys.byCategory(categoryId),
    queryFn: () => expenseApi.getByCategory(categoryId),
    enabled: !!categoryId,
  })
}

export const useExpensesByDateRangeQuery = (query: DateRangeQuery) => {
  return useQuery({
    queryKey: expenseKeys.byDateRange(query),
    queryFn: () => expenseApi.getByDateRange(query),
    enabled: !!(query.start_date && query.end_date),
  })
}

export const useMonthlyExpensesQuery = (query: MonthlyQuery) => {
  return useQuery({
    queryKey: expenseKeys.monthly(query),
    queryFn: () => expenseApi.getMonthly(query),
    enabled: !!(query.year && query.month),
  })
}

export const useExpenseSummaryQuery = (
  startDate?: string,
  endDate?: string,
  filters?: Omit<ExpenseFilters, "start_date" | "end_date">
) => {
  // Default to current month if no dates provided
  const defaultStartDate =
    startDate ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  const defaultEndDate = endDate || new Date().toISOString().split("T")[0]

  return useQuery({
    queryKey: expenseKeys.summary({
      ...filters,
      start_date: defaultStartDate,
      end_date: defaultEndDate,
    }),
    queryFn: () => expenseApi.getSummary(defaultStartDate, defaultEndDate, filters),
  })
}

// Mutations
export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expenseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      // Also refresh bank accounts as balances are adjusted by backend
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      expenseApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => expenseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}

export const useRestoreExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => expenseApi.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}

export const useUpdateExpenseStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseStatusRequest }) =>
      expenseApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}
