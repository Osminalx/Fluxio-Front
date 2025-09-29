"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DollarSign, Loader2, X } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateBudget, useUpdateBudget } from "@/lib/budget-queries"
import { type Budget, type CreateBudgetRequest, createBudgetSchema } from "@/types/budgets"

interface BudgetFormProps {
  budget?: Budget | null
  onClose: () => void
  onSuccess?: () => void
}

export function BudgetForm({ budget, onClose, onSuccess }: BudgetFormProps) {
  const isEditing = !!budget
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()

  const form = useForm<CreateBudgetRequest>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      // biome-ignore lint/style/useNamingConvention: API uses snake_case
      month_year: budget?.month_year || new Date().toISOString().split("T")[0],
      // biome-ignore lint/style/useNamingConvention: API uses snake_case
      needs_budget: budget?.needs_budget || undefined,
      // biome-ignore lint/style/useNamingConvention: API uses snake_case
      savings_budget: budget?.savings_budget || undefined,
      // biome-ignore lint/style/useNamingConvention: API uses snake_case
      wants_budget: budget?.wants_budget || undefined,
    },
  })

  // Reset form when budget changes
  useEffect(() => {
    if (budget) {
      form.reset({
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        month_year: budget.month_year.split("T")[0], // Convert to date format
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        needs_budget: budget.needs_budget,
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        savings_budget: budget.savings_budget,
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        wants_budget: budget.wants_budget,
      })
    }
  }, [budget, form])

  const onSubmit = async (data: CreateBudgetRequest) => {
    try {
      if (isEditing && budget) {
        await updateMutation.mutateAsync({
          id: budget.id,
          data: {
            // biome-ignore lint/style/useNamingConvention: API uses snake_case
            needs_budget: data.needs_budget,
            // biome-ignore lint/style/useNamingConvention: API uses snake_case
            savings_budget: data.savings_budget,
            // biome-ignore lint/style/useNamingConvention: API uses snake_case
            wants_budget: data.wants_budget,
            // biome-ignore lint/style/useNamingConvention: API uses snake_case
            change_reason: "Updated via form",
          },
        })
      } else {
        await createMutation.mutateAsync(data)
      }

      onSuccess?.()
      onClose()
    } catch {
      // Handle error silently or show toast notification
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const totalBudget =
    (form.watch("needs_budget") || 0) +
    (form.watch("savings_budget") || 0) +
    (form.watch("wants_budget") || 0)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {isEditing ? "Edit Budget" : "Create New Budget"}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="month_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month & Year</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      disabled={isEditing} // Don't allow changing month/year when editing
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="needs_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Needs Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === "" ? undefined : Number.parseFloat(value) || 0)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wants_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wants Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === "" ? undefined : Number.parseFloat(value) || 0)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="savings_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Savings Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === "" ? undefined : Number.parseFloat(value) || 0)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Budget:</span>
                <span className="text-lg font-bold">${totalBudget.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                50/30/20 Rule: Needs (50%), Wants (30%), Savings (20%)
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Budget" : "Create Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
