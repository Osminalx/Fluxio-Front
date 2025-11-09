import { z } from "zod"
import { type Status, statusSchema } from "./status"

// Reminder type enum
export const reminderTypeSchema = z.enum(["bill", "goal", "budget_review"])
export type ReminderType = z.infer<typeof reminderTypeSchema>

// Zod Schemas for validation
export const createReminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  reminder_type: reminderTypeSchema,
})

export const updateReminderSchema = createReminderSchema.partial()

// TypeScript types inferred from schemas
export type CreateReminderRequest = z.infer<typeof createReminderSchema>
export type UpdateReminderRequest = z.infer<typeof updateReminderSchema>

// API Response types (per API docs)
export interface Reminder {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string
  is_completed: boolean
  reminder_type: ReminderType
  status: Status
  status_changed_at: string | null
  created_at: string
  updated_at: string
}

// Filter and query types
export interface ReminderFilters {
  reminder_type?: ReminderType
  status?: Status
  is_completed?: boolean
  include_deleted?: boolean
}

// Reminder statistics response
export interface ReminderStatsResponse {
  total: number
  completed: number
  overdue: number
  by_type: Record<string, number>
}

// State management types
export interface ReminderState {
  reminders: Reminder[]
  selectedReminder: Reminder | null
  stats: ReminderStatsResponse | null
  isLoading: boolean
  error: string | null
}

// Utility types
export interface ReminderFormData {
  title: string
  description: string
  due_date: string
  reminder_type: ReminderType
}



