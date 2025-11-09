import type {
  CreateReminderRequest,
  Reminder,
  ReminderFilters,
  ReminderStatsResponse,
  UpdateReminderRequest,
} from "@/types/reminder"
import { apiClient } from "./api"

// Helper to normalize reminder response (handle both array and wrapped formats)
const normalizeRemindersResponse = (
  response: Reminder[] | { reminders: Reminder[] }
): Reminder[] => {
  if (Array.isArray(response)) {
    return response
  }
  return (response as { reminders: Reminder[] }).reminders || []
}

// Reminder API endpoints
export const reminderApi = {
  // Get all reminders
  getAll: async (filters?: ReminderFilters): Promise<Reminder[]> => {
    const params = new URLSearchParams()
    if (filters?.reminder_type) {
      params.append("reminder_type", filters.reminder_type)
    }
    if (filters?.status) {
      params.append("status", filters.status)
    }
    if (filters?.is_completed !== undefined) {
      params.append("is_completed", filters.is_completed.toString())
    }
    if (filters?.include_deleted) {
      params.append("include_deleted", filters.include_deleted.toString())
    }

    const queryString = params.toString()
    const endpoint = queryString ? `/api/v1/reminders?${queryString}` : "/api/v1/reminders"

    const response = await apiClient.get<Reminder[] | { reminders: Reminder[] }>(endpoint)
    return normalizeRemindersResponse(response)
  },

  // Get overdue reminders
  getOverdue: async (): Promise<Reminder[]> => {
    const response = await apiClient.get<Reminder[] | { reminders: Reminder[] }>(
      "/api/v1/reminders/overdue"
    )
    return normalizeRemindersResponse(response)
  },

  // Get reminder statistics
  getStats: async (): Promise<ReminderStatsResponse> => {
    const response = await apiClient.get<ReminderStatsResponse>("/api/v1/reminders/stats")
    return response
  },

  // Get single reminder by ID
  getById: async (id: string): Promise<Reminder> => {
    const response = await apiClient.get<Reminder>(`/api/v1/reminders/${id}`)
    return response
  },

  // Create new reminder
  create: async (data: CreateReminderRequest): Promise<Reminder> => {
    const response = await apiClient.post<Reminder>("/api/v1/reminders", data)
    return response
  },

  // Update reminder
  update: async (id: string, data: UpdateReminderRequest): Promise<Reminder> => {
    const response = await apiClient.patch<Reminder>(`/api/v1/reminders/${id}`, data)
    return response
  },

  // Mark reminder as completed
  complete: async (id: string): Promise<Reminder> => {
    const response = await apiClient.post<Reminder>(`/api/v1/reminders/${id}/complete`)
    return response
  },

  // Delete reminder
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/reminders/${id}`)
  },
}



