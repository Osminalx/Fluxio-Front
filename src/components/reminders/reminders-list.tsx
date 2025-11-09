"use client"

import { CheckCircle2, Edit, MoreHorizontal, Trash2, XCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useCompleteReminderMutation,
  useDeleteReminderMutation,
  useRemindersQuery,
} from "@/lib/reminder-queries"
import type { Reminder } from "@/types/reminder"
import { ReminderForm } from "./reminder-form"

export function RemindersList() {
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [showReminderForm, setShowReminderForm] = useState(false)

  const { data: reminders, isLoading } = useRemindersQuery()
  const deleteReminder = useDeleteReminderMutation()
  const completeReminder = useCompleteReminderMutation()

  const remindersList = Array.isArray(reminders) ? reminders : []

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  const isOverdue = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) return false
    return new Date(dueDate) < new Date()
  }

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder)
    setShowReminderForm(true)
  }

  const handleDeleteReminder = async (reminder: Reminder) => {
    try {
      await deleteReminder.mutateAsync(reminder.id)
      toast.success("Reminder deleted successfully")
    } catch (_e) {
      toast.error("Failed to delete reminder")
    }
  }

  const handleCompleteReminder = async (reminder: Reminder) => {
    try {
      await completeReminder.mutateAsync(reminder.id)
      toast.success("Reminder marked as completed")
    } catch (_e) {
      toast.error("Failed to complete reminder")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="-mx-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Title</TableHead>
            <TableHead className="w-[140px]">Type</TableHead>
            <TableHead className="w-[140px]">Due Date</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
            <TableHead className="w-[70px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {remindersList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No reminders found. Create your first reminder to stay on track!
              </TableCell>
            </TableRow>
          ) : (
            remindersList.map((reminder) => {
              const overdue = isOverdue(reminder.due_date, reminder.is_completed)
              return (
                <TableRow
                  key={reminder.id}
                  className={`hover:bg-muted/50 transition-colors duration-200 ${
                    overdue ? "bg-red-50/50 dark:bg-red-950/20" : ""
                  }`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {reminder.is_completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={reminder.is_completed ? "line-through text-muted-foreground" : ""}
                      >
                        {reminder.title}
                      </span>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="persona-badge">
                      {reminder.reminder_type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={overdue ? "text-red-600 font-semibold" : ""}>
                      {formatDate(reminder.due_date)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={reminder.is_completed ? "default" : overdue ? "destructive" : "secondary"}
                      className="persona-badge"
                    >
                      {reminder.is_completed ? "Completed" : overdue ? "Overdue" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild={true}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {!reminder.is_completed && (
                          <DropdownMenuItem onClick={() => handleCompleteReminder(reminder)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEditReminder(reminder)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteReminder(reminder)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Reminder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {showReminderForm && (
        <ReminderForm
          open={showReminderForm}
          onOpenChange={setShowReminderForm}
          editingReminder={selectedReminder}
        />
      )}
    </div>
  )
}



