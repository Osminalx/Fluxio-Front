import type {
  CreateGoalRequest,
  Goal,
  GoalFilters,
  GoalStatusRequest,
  UpdateGoalRequest,
} from "@/types/goal"
import { apiClient } from "./api"

// Helper to normalize goal response (handle both array and wrapped formats)
const normalizeGoalsResponse = (response: Goal[] | { goals: Goal[] }): Goal[] => {
  if (Array.isArray(response)) {
    return response
  }
  return (response as { goals: Goal[] }).goals || []
}

// Goal API endpoints
export const goalApi = {
  // Get all goals
  getAll: async (filters?: GoalFilters): Promise<Goal[]> => {
    const params = new URLSearchParams()
    if (filters?.include_deleted) {
      params.append("include_deleted", filters.include_deleted.toString())
    }
    if (filters?.status) {
      params.append("status", filters.status)
    }

    const queryString = params.toString()
    const endpoint = queryString ? `/api/v1/goals?${queryString}` : "/api/v1/goals"

    const response = await apiClient.get<Goal[] | { goals: Goal[] }>(endpoint)
    return normalizeGoalsResponse(response)
  },

  // Get active goals only
  getActive: async (): Promise<Goal[]> => {
    const response = await apiClient.get<Goal[] | { goals: Goal[] }>("/api/v1/goals/active")
    return normalizeGoalsResponse(response)
  },

  // Get deleted goals
  getDeleted: async (): Promise<Goal[]> => {
    const response = await apiClient.get<Goal[] | { goals: Goal[] }>("/api/v1/goals/deleted")
    return normalizeGoalsResponse(response)
  },

  // Get single goal by ID
  getById: async (id: string): Promise<Goal> => {
    const response = await apiClient.get<Goal>(`/api/v1/goals/${id}`)
    return response
  },

  // Create new goal
  create: async (data: CreateGoalRequest): Promise<Goal> => {
    const response = await apiClient.post<Goal>("/api/v1/goals", data)
    return response
  },

  // Update goal
  update: async (id: string, data: UpdateGoalRequest): Promise<Goal> => {
    const response = await apiClient.patch<Goal>(`/api/v1/goals/${id}`, data)
    return response
  },

  // Delete goal (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/goals/${id}`)
  },

  // Restore deleted goal
  restore: async (id: string): Promise<Goal> => {
    const response = await apiClient.post<Goal>(`/api/v1/goals/${id}/restore`)
    return response
  },

  // Update goal status
  updateStatus: async (id: string, data: GoalStatusRequest): Promise<Goal> => {
    const response = await apiClient.patch<Goal>(`/api/v1/goals/${id}/status`, data)
    return response
  },
}

