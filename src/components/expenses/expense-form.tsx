"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBankAccounts } from "@/lib/bank-account-queries"
import { useCreateCategoryMutation, useGroupedCategoriesQuery } from "@/lib/category-queries"
import { useCreateExpenseMutation, useUpdateExpenseMutation } from "@/lib/expense-queries"
import { type CreateExpenseRequest, createExpenseSchema, type Expense } from "@/types/expense"
import { EXPENSE_TYPES, ExpenseTypeUtils, type ExpenseTypeValue } from "@/types/expense-type"

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingExpense?: Expense | null
}

export function ExpenseForm({ open, onOpenChange, editingExpense }: ExpenseFormProps) {
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseTypeValue | "">("")

  const form = useForm<CreateExpenseRequest>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: 0,
      bank_account_id: "",
      category_id: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  })

  // Reset form when editing expense changes
  useEffect(() => {
    if (editingExpense) {
      form.reset({
        amount: editingExpense.amount,
        bank_account_id: editingExpense.bank_account_id,
        category_id: editingExpense.category_id,
        date: editingExpense.date.split("T")[0],
        description: editingExpense.description || "",
      })
    } else {
      form.reset({
        amount: 0,
        bank_account_id: "",
        category_id: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      })
    }
  }, [editingExpense, form])

  const createExpenseMutation = useCreateExpenseMutation()
  const updateExpenseMutation = useUpdateExpenseMutation()
  const createCategoryMutation = useCreateCategoryMutation()
  const { data: bankAccountsData } = useBankAccounts()
  const { data: groupedCategoriesData, isLoading: categoriesLoading } = useGroupedCategoriesQuery()

  // Ensure data is always in the correct format
  const bankAccounts = Array.isArray(bankAccountsData) ? bankAccountsData : []

  // Process grouped categories - ensure proper format
  const groupedCategories = groupedCategoriesData || { needs: [], wants: [], savings: [] }

  // Validate structure - ensure each expense type key exists and initialize if missing
  if (!groupedCategories.needs) {
    groupedCategories.needs = []
  }
  if (!groupedCategories.wants) {
    groupedCategories.wants = []
  }
  if (!groupedCategories.savings) {
    groupedCategories.savings = []
  }

  const onSubmit = async (data: CreateExpenseRequest) => {
    try {
      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({
          id: editingExpense.id,
          data,
        })
        toast.success("Expense updated successfully!")
      } else {
        await createExpenseMutation.mutateAsync(data)
        toast.success("Expense added successfully!")
      }
      form.reset()
      onOpenChange(false)
    } catch (_error) {
      toast.error(editingExpense ? "Failed to update expense" : "Failed to add expense")
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !selectedExpenseType) {
      toast.error("Please fill in all category fields")
      return
    }

    try {
      const newCategory = await createCategoryMutation.mutateAsync({
        name: newCategoryName.trim(),
        expense_type: selectedExpenseType,
      })

      // Set the new category as selected
      form.setValue("category_id", newCategory.id)

      toast.success(`Category "${newCategoryName}" created successfully!`)

      // Reset form state
      setNewCategoryName("")
      setSelectedExpenseType("")
      setShowNewCategoryForm(false)
    } catch (_error) {
      toast.error("Failed to create category")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] persona-modal">
        <DialogHeader>
          <DialogTitle className="persona-title">
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {editingExpense
              ? "Update your expense and categorize it according to the 50/30/20 philosophy."
              : "Track a new expense and categorize it according to the 50/30/20 philosophy."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
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

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="persona-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bank Account */}
            <FormField
              control={form.control}
              name="bank_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="persona-input">
                        <SelectValue placeholder="Select a bank account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.account_name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ${account.balance.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Category
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCategoryForm(true)}
                      className="persona-hover"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      New Category
                    </Button>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="persona-input">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Loading categories...
                        </div>
                      ) : (
                        EXPENSE_TYPES.map((expenseType) => {
                          const categories = groupedCategories[expenseType.value] || []
                          return (
                            <div key={expenseType.value}>
                              <div className="px-2 py-1 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: ExpenseTypeUtils.getDisplayColor(
                                      expenseType.name
                                    ),
                                  }}
                                />
                                {expenseType.name} ({expenseType.percentage}%)
                              </div>
                              {categories.length === 0 ? (
                                <div className="pl-6 py-2 text-xs text-muted-foreground italic">
                                  No categories yet
                                </div>
                              ) : (
                                categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                    className="pl-6"
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </div>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Category Form */}
            {showNewCategoryForm && (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Create New Category</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewCategoryForm(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Expense Type</Label>
                    <Select
                      onValueChange={(value: ExpenseTypeValue) => setSelectedExpenseType(value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_TYPES.map((expenseType) => (
                          <SelectItem key={expenseType.value} value={expenseType.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: ExpenseTypeUtils.getDisplayColor(
                                    expenseType.name
                                  ),
                                }}
                              />
                              {expenseType.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Category Name</Label>
                    <Input
                      placeholder="e.g., Groceries"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || !selectedExpenseType}
                  className="w-full"
                >
                  Create Category
                </Button>
              </div>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was this expense for?"
                      className="persona-input resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="persona-hover"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
                className="persona-glow bg-gradient-to-r from-primary to-accent"
              >
                {createExpenseMutation.isPending || updateExpenseMutation.isPending
                  ? editingExpense
                    ? "Updating..."
                    : "Adding..."
                  : editingExpense
                    ? "Update Expense"
                    : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
