import { z } from "zod"

// Common status enum values used across different entities
export const STATUS_VALUES = [
  "active",
  "deleted",
  "suspended",
  "archived",
  "pending",
  "locked",
] as const

// Zod schema for status validation
export const statusSchema = z.enum(STATUS_VALUES)

// TypeScript type for status
export type Status = z.infer<typeof statusSchema>

// Zod schema for status update requests
export const statusUpdateSchema = z.object({
  status: statusSchema,
})

// TypeScript type for status update requests
export type StatusUpdateRequest = z.infer<typeof statusUpdateSchema>

// Utility functions for status handling
export const StatusUtils = {
  // Check if status is active
  isActive: (status: Status): boolean => status === "active",

  // Check if status is considered inactive
  isInactive: (status: Status): boolean => status !== "active",

  // Check if status is deleted
  isDeleted: (status: Status): boolean => status === "deleted",

  // Check if status is problematic (suspended, locked, deleted)
  isProblematic: (status: Status): boolean => ["suspended", "locked", "deleted"].includes(status),

  // Get display label for status
  getLabel: (status: Status): string => {
    switch (status) {
      case "active":
        return "Active"
      case "suspended":
        return "Suspended"
      case "deleted":
        return "Deleted"
      case "archived":
        return "Archived"
      case "pending":
        return "Pending"
      case "locked":
        return "Locked"
      default:
        return "Unknown"
    }
  },

  // Get CSS classes for status styling
  getStyleClasses: (status: Status): string => {
    switch (status) {
      case "active":
        return "text-green-700 bg-green-50 border-green-200"
      case "suspended":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      case "deleted":
        return "text-red-700 bg-red-50 border-red-200"
      case "archived":
        return "text-gray-700 bg-gray-50 border-gray-200"
      case "pending":
        return "text-blue-700 bg-blue-50 border-blue-200"
      case "locked":
        return "text-red-800 bg-red-100 border-red-300"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  },
}
