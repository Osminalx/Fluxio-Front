import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  CreateIncomeRequest,
  IncomeFilters,
  IncomeStatusRequest,
  UpdateIncomeRequest,
} from "@/types/income"
import { incomeApi } from "./income-api"
import { bankAccountKeys } from "./bank-account-queries"

export const incomeKeys = {
  all: ["incomes"] as const,
  lists: () => [...incomeKeys.all, "list"] as const,
  list: (filters?: IncomeFilters) => [...incomeKeys.lists(), { filters }] as const,
  details: () => [...incomeKeys.all, "detail"] as const,
  detail: (id: string) => [...incomeKeys.details(), id] as const,
  active: () => [...incomeKeys.all, "active"] as const,
  deleted: () => [...incomeKeys.all, "deleted"] as const,
} as const

// Queries
export const useIncomesQuery = (filters?: IncomeFilters) => {
  return useQuery({
    queryKey: incomeKeys.list(filters),
    queryFn: () => incomeApi.getAll(filters),
  })
}

export const useIncomeQuery = (id: string) => {
  return useQuery({
    queryKey: incomeKeys.detail(id),
    queryFn: () => incomeApi.getById(id),
    enabled: !!id,
  })
}

export const useActiveIncomesQuery = () => {
  return useQuery({
    queryKey: incomeKeys.active(),
    queryFn: incomeApi.getActive,
  })
}

export const useDeletedIncomesQuery = () => {
  return useQuery({
    queryKey: incomeKeys.deleted(),
    queryFn: incomeApi.getDeleted,
  })
}

// Mutations (also invalidate bank accounts to refresh balances)
export const useCreateIncomeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateIncomeRequest) => incomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}

export const useUpdateIncomeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomeRequest }) =>
      incomeApi.update(id, data),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}

export const useDeleteIncomeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}

export const useRestoreIncomeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => incomeApi.restore(id),
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.active() })
    },
  })
}

export const useUpdateIncomeStatusMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IncomeStatusRequest }) =>
      incomeApi.updateStatus(id, data),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() })
    },
  })
}









