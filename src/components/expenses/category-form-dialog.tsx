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
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/lib/category-queries"
import type { Category, CreateCategoryRequest } from "@/types/category"
import { createCategorySchema } from "@/types/category"
import { EXPENSE_TYPES, ExpenseTypeUtils } from "@/types/expense-type"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  mode?: "create" | "edit"
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  mode = "create",
}: CategoryFormDialogProps) {
  const form = useForm<CreateCategoryRequest>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      expense_type: "needs",
    },
  })

  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()

  // Update form when category changes
  useEffect(() => {
    if (category && mode === "edit") {
      form.reset({
        name: category.name,
        expense_type: category.expense_type,
      })
    } else if (!category || mode === "create") {
      form.reset({
        name: "",
        expense_type: "needs",
      })
    }
  }, [category, mode, form])

  const onSubmit = async (data: CreateCategoryRequest) => {
    try {
      if (mode === "edit" && category?.id) {
        await updateMutation.mutateAsync({
          id: category.id,
          data,
        })
        toast.success("Category updated successfully!")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Category created successfully!")
      }
      form.reset()
      onOpenChange(false)
    } catch (_error) {
      toast.error(mode === "edit" ? "Failed to update category" : "Failed to create category")
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] persona-modal">
        <DialogHeader>
          <DialogTitle className="persona-title">
            {mode === "edit" ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the category details below."
              : "Add a new category to organize your expenses."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Groceries, Rent, Entertainment"
                      {...field}
                      className="persona-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expense Type */}
            <FormField
              control={form.control}
              name="expense_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="persona-input">
                        <SelectValue placeholder="Select expense type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_TYPES.map((expenseType) => (
                        <SelectItem key={expenseType.value} value={expenseType.value}>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: ExpenseTypeUtils.getDisplayColor(expenseType.name),
                              }}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{expenseType.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {expenseType.description} ({expenseType.percentage}%)
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
                className="persona-hover"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="persona-glow bg-gradient-to-r from-primary to-accent"
              >
                {isLoading ? "Saving..." : mode === "edit" ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
