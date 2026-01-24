import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  CreateGoalRequest,
  GoalFilters,
  GoalStatusRequest,
  UpdateGoalRequest,
} from "@/types/goal"
import { goalApi } from "./goal-api"

// Query keys
export const goalKeys = {
  all: ["goals"] as const,
  lists: () => [...goalKeys.all, "list"] as const,
  list: (filters?: GoalFilters) => [...goalKeys.lists(), { filters }] as const,
  details: () => [...goalKeys.all, "detail"] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
  active: () => [...goalKeys.all, "active"] as const,
  deleted: () => [...goalKeys.all, "deleted"] as const,
} as const

// Queries
export const useGoalsQuery = (filters?: GoalFilters) => {
  return useQuery({
    queryKey: goalKeys.list(filters),
    queryFn: () => goalApi.getAll(filters),
  })
}

export const useGoalQuery = (id: string) => {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => goalApi.getById(id),
    enabled: !!id,
  })
}

export const useActiveGoalsQuery = () => {
  return useQuery({
    queryKey: goalKeys.active(),
    queryFn: goalApi.getActive,
  })
}

export const useDeletedGoalsQuery = () => {
  return useQuery({
    queryKey: goalKeys.deleted(),
    queryFn: goalApi.getDeleted,
  })
}

// Mutations
export const useCreateGoalMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGoalRequest) => goalApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}

export const useUpdateGoalMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) => goalApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
    },
  })
}

export const useDeleteGoalMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => goalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}

export const useRestoreGoalMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => goalApi.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
    },
  })
}

export const useUpdateGoalStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GoalStatusRequest }) =>
      goalApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
    },
  })
}
