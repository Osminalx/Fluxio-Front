import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  CategoryStatusRequest,
  CreateCategoryRequest,
  DefaultCategoriesRequest,
  UpdateCategoryRequest,
} from "@/types/category"
import { categoryApi } from "./category-api"

// Query keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  grouped: () => [...categoryKeys.all, "grouped"] as const,
  stats: () => [...categoryKeys.all, "stats"] as const,
  byExpenseType: (expenseTypeId: string) =>
    [...categoryKeys.all, "expense-type", expenseTypeId] as const,
  byExpenseTypeName: (expenseTypeName: string) =>
    [...categoryKeys.all, "expense-type-name", expenseTypeName] as const,
}

// Queries
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: categoryApi.getAll,
  })
}

export const useCategoryQuery = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
  })
}

export const useGroupedCategoriesQuery = () => {
  return useQuery({
    queryKey: categoryKeys.grouped(),
    queryFn: categoryApi.getGrouped,
  })
}

export const useCategoryStatsQuery = () => {
  return useQuery({
    queryKey: categoryKeys.stats(),
    queryFn: categoryApi.getStats,
  })
}

export const useCategoriesByExpenseTypeQuery = (expenseTypeId: string) => {
  return useQuery({
    queryKey: categoryKeys.byExpenseType(expenseTypeId),
    queryFn: () => categoryApi.getByExpenseTypeId(expenseTypeId),
    enabled: !!expenseTypeId,
  })
}

export const useCategoriesByExpenseTypeNameQuery = (expenseTypeName: string) => {
  return useQuery({
    queryKey: categoryKeys.byExpenseTypeName(expenseTypeName),
    queryFn: () => categoryApi.getByExpenseTypeName(expenseTypeName),
    enabled: !!expenseTypeName,
  })
}

// Mutations
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export const useRestoreCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoryApi.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

export const useUpdateCategoryStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryStatusRequest }) =>
      categoryApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

export const useCreateDefaultCategoriesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DefaultCategoriesRequest) => categoryApi.createDefaults(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

