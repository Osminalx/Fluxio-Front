"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DollarSign, Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

  // Parse initial month/year
  const initialMonthYear = budget?.month_year || new Date().toISOString().substring(0, 7)
  const [selectedYear, setSelectedYear] = useState(initialMonthYear.split("-")[0])
  const [selectedMonth, setSelectedMonth] = useState(initialMonthYear.split("-")[1])

  const form = useForm<CreateBudgetRequest>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      // biome-ignore lint/style/useNamingConvention: API uses snake_case
      month_year: initialMonthYear,
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
      const monthYear = budget.month_year.substring(0, 7)
      const [year, month] = monthYear.split("-")
      setSelectedYear(year)
      setSelectedMonth(month)
      form.reset({
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        month_year: monthYear,
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        needs_budget: budget.needs_budget,
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        savings_budget: budget.savings_budget,
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        wants_budget: budget.wants_budget,
      })
    }
  }, [budget, form])

  // Update form value when month or year changes
  useEffect(() => {
    const monthYear = `${selectedYear}-${selectedMonth}`
    form.setValue("month_year", monthYear)
  }, [selectedYear, selectedMonth, form])

  // Generate years (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <DollarSign className="h-6 w-6" />
          {isEditing ? "Edit Budget" : "Create New Budget"}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="month_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Month & Year</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                      disabled={isEditing}
                    >
                      <SelectTrigger className="h-12 text-base w-full">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value} className="text-base">
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                      disabled={isEditing}
                    >
                      <SelectTrigger className="h-12 text-base w-full">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-base">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <input type="hidden" {...field} />
                  <p className="text-sm text-muted-foreground mt-2">
                    Select the month and year for this budget
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="needs_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Needs Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-12 text-base"
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
                    <FormLabel className="text-base font-semibold">Wants Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-12 text-base"
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
                    <FormLabel className="text-base font-semibold">Savings Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-12 text-base"
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
            <div className="bg-muted/50 p-6 rounded-lg border">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-semibold">Total Budget:</span>
                <span className="text-3xl font-bold">${totalBudget.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                50/30/20 Rule: Needs (50%), Wants (30%), Savings (20%)
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-8"
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting} className="px-8">
                {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isEditing ? "Update Budget" : "Create Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
