import { z } from "zod"
import { type Status, statusSchema } from "./status"

// Zod Schemas for validation
export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  total_amount: z
    .number()
    .positive("Total amount must be greater than 0")
    .multipleOf(0.01, "Amount must have at most 2 decimal places"),
  saved_amount: z
    .number()
    .min(0, "Saved amount must be non-negative")
    .multipleOf(0.01, "Amount must have at most 2 decimal places"),
})

export const updateGoalSchema = createGoalSchema.partial()

export const goalStatusSchema = z.object({
  status: statusSchema,
})

// TypeScript types inferred from schemas
export type CreateGoalRequest = z.infer<typeof createGoalSchema>
export type UpdateGoalRequest = z.infer<typeof updateGoalSchema>
export type GoalStatusRequest = z.infer<typeof goalStatusSchema>

// API Response types (per API docs)
export interface Goal {
  id: string
  user_id: string
  name: string
  total_amount: number
  saved_amount: number
  progress_percent: number // Computed by API (0-100)
  status: Status
  status_changed_at: string | null
  created_at: string
  updated_at: string
}

// Filter and query types
export interface GoalFilters {
  status?: Status
  include_deleted?: boolean
}

// State management types
export interface GoalState {
  goals: Goal[]
  selectedGoal: Goal | null
  isLoading: boolean
  error: string | null
}

// Utility types
export interface GoalFormData {
  name: string
  total_amount: string
  saved_amount: string
}
