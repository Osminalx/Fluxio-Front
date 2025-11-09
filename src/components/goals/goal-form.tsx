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
import { useCreateGoalMutation, useUpdateGoalMutation } from "@/lib/goal-queries"
import { type CreateGoalRequest, createGoalSchema, type Goal } from "@/types/goal"

interface GoalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingGoal?: Goal | null
}

export function GoalForm({ open, onOpenChange, editingGoal }: GoalFormProps) {
  const form = useForm<CreateGoalRequest>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      name: "",
      total_amount: 0,
      saved_amount: 0,
    },
  })

  useEffect(() => {
    if (editingGoal) {
      form.reset({
        name: editingGoal.name,
        total_amount: editingGoal.total_amount,
        saved_amount: editingGoal.saved_amount,
      })
    } else {
      form.reset({ name: "", total_amount: 0, saved_amount: 0 })
    }
  }, [editingGoal, form])

  const createGoal = useCreateGoalMutation()
  const updateGoal = useUpdateGoalMutation()

  const onSubmit = async (data: CreateGoalRequest) => {
    try {
      if (editingGoal) {
        await updateGoal.mutateAsync({ id: editingGoal.id, data })
        toast.success("Goal updated successfully!")
      } else {
        await createGoal.mutateAsync(data)
        toast.success("Goal created successfully!")
      }
      form.reset()
      onOpenChange(false)
    } catch (_e) {
      toast.error(editingGoal ? "Failed to update goal" : "Failed to create goal")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] persona-modal">
        <DialogHeader>
          <DialogTitle className="persona-title">
            {editingGoal ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
          <DialogDescription>
            {editingGoal
              ? "Update your savings goal. Progress is automatically calculated."
              : "Set a new savings goal and track your progress."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Emergency Fund" {...field} className="persona-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        className="persona-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="saved_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        className="persona-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="persona-hover">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGoal.isPending || updateGoal.isPending}
                className="persona-glow bg-gradient-to-r from-primary to-accent"
              >
                {createGoal.isPending || updateGoal.isPending
                  ? editingGoal
                    ? "Updating..."
                    : "Creating..."
                  : editingGoal
                    ? "Update Goal"
                    : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}



