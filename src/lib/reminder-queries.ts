import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  CreateReminderRequest,
  ReminderFilters,
  UpdateReminderRequest,
} from "@/types/reminder"
import { reminderApi } from "./reminder-api"

// Query keys
export const reminderKeys = {
  all: ["reminders"] as const,
  lists: () => [...reminderKeys.all, "list"] as const,
  list: (filters?: ReminderFilters) => [...reminderKeys.lists(), { filters }] as const,
  details: () => [...reminderKeys.all, "detail"] as const,
  detail: (id: string) => [...reminderKeys.details(), id] as const,
  overdue: () => [...reminderKeys.all, "overdue"] as const,
  stats: () => [...reminderKeys.all, "stats"] as const,
} as const

// Queries
export const useRemindersQuery = (filters?: ReminderFilters) => {
  return useQuery({
    queryKey: reminderKeys.list(filters),
    queryFn: () => reminderApi.getAll(filters),
  })
}

export const useReminderQuery = (id: string) => {
  return useQuery({
    queryKey: reminderKeys.detail(id),
    queryFn: () => reminderApi.getById(id),
    enabled: !!id,
  })
}

export const useOverdueRemindersQuery = () => {
  return useQuery({
    queryKey: reminderKeys.overdue(),
    queryFn: reminderApi.getOverdue,
  })
}

export const useReminderStatsQuery = () => {
  return useQuery({
    queryKey: reminderKeys.stats(),
    queryFn: reminderApi.getStats,
  })
}

// Mutations
export const useCreateReminderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReminderRequest) => reminderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all })
    },
  })
}

export const useUpdateReminderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderRequest }) =>
      reminderApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() })
    },
  })
}

export const useCompleteReminderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reminderApi.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reminderKeys.stats() })
    },
  })
}

export const useDeleteReminderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reminderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all })
    },
  })
}

