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
  FormDescription,
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
import { useBankAccountsQuery } from "@/lib/bank-account-queries"
import { useGroupedCategoriesQuery } from "@/lib/category-queries"
import {
  useCreateFixedExpenseMutation,
  useUpdateFixedExpenseMutation,
} from "@/lib/fixed-expense-queries"
import { EXPENSE_TYPES, ExpenseTypeUtils } from "@/types/expense-type"
import {
  type CreateFixedExpenseRequest,
  createFixedExpenseSchema,
  type FixedExpense,
} from "@/types/fixed-expense"

interface FixedExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingFixedExpense?: FixedExpense | null
}

export function FixedExpenseForm({
  open,
  onOpenChange,
  editingFixedExpense,
}: FixedExpenseFormProps) {
  const form = useForm({
    resolver: zodResolver(createFixedExpenseSchema),
    defaultValues: {
      name: "",
      amount: 0,
      due_date: new Date().toISOString().split("T")[0],
      bank_account_id: "",
      category_id: undefined,
      is_recurring: true,
      recurrence_type: "monthly" as const,
    },
  })

  // Reset form when editing expense changes
  useEffect(() => {
    if (editingFixedExpense) {
      form.reset({
        name: editingFixedExpense.name,
        amount: editingFixedExpense.amount,
        due_date: editingFixedExpense.due_date.split("T")[0],
        bank_account_id: editingFixedExpense.bank_account_id,
        category_id: editingFixedExpense.category_id || undefined,
        is_recurring: editingFixedExpense.is_recurring,
        recurrence_type: editingFixedExpense.recurrence_type,
      })
    } else {
      form.reset({
        name: "",
        amount: 0,
        due_date: new Date().toISOString().split("T")[0],
        bank_account_id: "",
        category_id: undefined,
        is_recurring: true,
        recurrence_type: "monthly",
      })
    }
  }, [editingFixedExpense, form])

  const createFixedExpenseMutation = useCreateFixedExpenseMutation()
  const updateFixedExpenseMutation = useUpdateFixedExpenseMutation()
  const { data: groupedCategoriesData, isLoading: categoriesLoading } = useGroupedCategoriesQuery()
  const { data: bankAccounts, isLoading: bankAccountsLoading } = useBankAccountsQuery()

  // Process grouped categories - ensure proper format
  const groupedCategories = groupedCategoriesData || { needs: [], wants: [], savings: [] }
  const activeBankAccounts = bankAccounts?.items?.filter((acc) => acc.status === "active") || []

  const onSubmit = async (data: CreateFixedExpenseRequest) => {
    try {
      if (editingFixedExpense) {
        await updateFixedExpenseMutation.mutateAsync({
          id: editingFixedExpense.id,
          data,
        })
        toast.success("Fixed expense updated successfully!")
      } else {
        await createFixedExpenseMutation.mutateAsync(data)
        toast.success("Fixed expense added successfully!")
      }
      form.reset()
      onOpenChange(false)
    } catch (_error) {
      toast.error(
        editingFixedExpense ? "Failed to update fixed expense" : "Failed to add fixed expense"
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] persona-modal">
        <DialogHeader>
          <DialogTitle className="persona-title">
            {editingFixedExpense ? "Edit Fixed Expense" : "Add New Fixed Expense"}
          </DialogTitle>
          <DialogDescription>
            {editingFixedExpense
              ? "Update your recurring fixed expense details."
              : "Add a recurring bill or subscription that you pay regularly."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Netflix, Rent, Car Insurance"
                      {...field}
                      className="persona-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

              {/* Due Date */}
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Day of Month)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="persona-input" />
                    </FormControl>
                    <FormDescription>Select the day it's due each month</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bank Account (Required) */}
            <FormField
              control={form.control}
              name="bank_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="persona-input">
                        <SelectValue placeholder="Select a bank account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankAccountsLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Loading accounts...
                        </div>
                      ) : activeBankAccounts.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No active accounts available
                        </div>
                      ) : (
                        activeBankAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_name} ({account.balance.toFixed(2)})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Bank account where the payment will be deducted from
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category (Optional) */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                    defaultValue={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="persona-input">
                        <SelectValue placeholder="Select a category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
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
                  <FormDescription>
                    Link to a category to track this expense in your budget
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Recurrence Type */}
              <FormField
                control={form.control}
                name="recurrence_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="persona-input">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Recurring (Hidden field with checkbox representation) */}
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>Auto-Repeat</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value ? "true" : "false"}
                      >
                        <SelectTrigger className="persona-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                disabled={
                  createFixedExpenseMutation.isPending || updateFixedExpenseMutation.isPending
                }
                className="persona-glow bg-gradient-to-r from-primary to-accent"
              >
                {createFixedExpenseMutation.isPending || updateFixedExpenseMutation.isPending
                  ? editingFixedExpense
                    ? "Updating..."
                    : "Adding..."
                  : editingFixedExpense
                    ? "Update Fixed Expense"
                    : "Add Fixed Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
