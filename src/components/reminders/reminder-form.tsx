"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateReminderMutation, useUpdateReminderMutation } from "@/lib/reminder-queries"
import { type CreateReminderRequest, createReminderSchema, type Reminder } from "@/types/reminder"

interface ReminderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingReminder?: Reminder | null
}

export function ReminderForm({ open, onOpenChange, editingReminder }: ReminderFormProps) {
  const form = useForm<CreateReminderRequest>({
    resolver: zodResolver(createReminderSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: new Date().toISOString().split("T")[0],
      reminder_type: "bill",
    },
  })

  useEffect(() => {
    if (editingReminder) {
      form.reset({
        title: editingReminder.title,
        description: editingReminder.description || "",
        due_date: editingReminder.due_date.split("T")[0],
        reminder_type: editingReminder.reminder_type,
      })
    } else {
      form.reset({
        title: "",
        description: "",
        due_date: new Date().toISOString().split("T")[0],
        reminder_type: "bill",
      })
    }
  }, [editingReminder, form])

  const createReminder = useCreateReminderMutation()
  const updateReminder = useUpdateReminderMutation()

  const onSubmit = async (data: CreateReminderRequest) => {
    try {
      if (editingReminder) {
        await updateReminder.mutateAsync({ id: editingReminder.id, data })
        toast.success("Reminder updated successfully!")
      } else {
        await createReminder.mutateAsync(data)
        toast.success("Reminder created successfully!")
      }
      form.reset()
      onOpenChange(false)
    } catch (_e) {
      toast.error(editingReminder ? "Failed to update reminder" : "Failed to create reminder")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] persona-modal">
        <DialogHeader>
          <DialogTitle className="persona-title">
            {editingReminder ? "Edit Reminder" : "Create New Reminder"}
          </DialogTitle>
          <DialogDescription>
            {editingReminder
              ? "Update your reminder details."
              : "Set a reminder for bills, goals, or budget reviews."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Pay rent" {...field} className="persona-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminder_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="persona-input">
                        <SelectValue placeholder="Select reminder type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bill">Bill</SelectItem>
                      <SelectItem value="goal">Goal</SelectItem>
                      <SelectItem value="budget_review">Budget Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="persona-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details..."
                      {...field}
                      className="persona-input"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="persona-hover">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createReminder.isPending || updateReminder.isPending}
                className="persona-glow bg-gradient-to-r from-primary to-accent"
              >
                {createReminder.isPending || updateReminder.isPending
                  ? editingReminder
                    ? "Updating..."
                    : "Creating..."
                  : editingReminder
                    ? "Update Reminder"
                    : "Create Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

