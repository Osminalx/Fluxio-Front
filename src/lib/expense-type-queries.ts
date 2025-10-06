import { useQuery } from "@tanstack/react-query"
import type { ExpenseTypeName } from "@/types/expense-type"
import { expenseTypeApi } from "./expense-type-api"

// Query keys
export const expenseTypeKeys = {
  all: ["expense-types"] as const,
  lists: () => [...expenseTypeKeys.all, "list"] as const,
  details: () => [...expenseTypeKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseTypeKeys.details(), id] as const,
  byName: (name: ExpenseTypeName) => [...expenseTypeKeys.all, "name", name] as const,
  withCategories: () => [...expenseTypeKeys.all, "with-categories"] as const,
}

// Queries
export const useExpenseTypesQuery = () => {
  return useQuery({
    queryKey: expenseTypeKeys.lists(),
    queryFn: expenseTypeApi.getAll,
  })
}

export const useExpenseTypeQuery = (id: string) => {
  return useQuery({
    queryKey: expenseTypeKeys.detail(id),
    queryFn: () => expenseTypeApi.getById(id),
    enabled: !!id,
  })
}

export const useExpenseTypeByNameQuery = (name: ExpenseTypeName) => {
  return useQuery({
    queryKey: expenseTypeKeys.byName(name),
    queryFn: () => expenseTypeApi.getByName(name),
    enabled: !!name,
  })
}

export const useExpenseTypesWithCategoriesQuery = () => {
  return useQuery({
    queryKey: expenseTypeKeys.withCategories(),
    queryFn: expenseTypeApi.getWithCategories,
  })
}

