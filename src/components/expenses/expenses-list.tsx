"use client"

import { Edit, Eye, Filter, MoreHorizontal, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDeleteExpenseMutation, useExpensesQuery } from "@/lib/expense-queries"
import type { Expense } from "@/types/expense"
import { ExpenseTypeConverter, ExpenseTypeUtils } from "@/types/expense-type"
import { AdvancedFilters, type ExpenseFilters } from "./advanced-filters"
import { ExpenseDetailsModal } from "./expense-details-modal"
import { ExpenseForm } from "./expense-form"
import { motion } from "framer-motion"

export function ExpensesList() {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showExpenseDetails, setShowExpenseDetails] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState<ExpenseFilters>({
    searchTerm: "",
    bankAccountId: "all",
    categoryId: "all",
    status: "all",
  })

  const { data: expenses, isLoading } = useExpensesQuery()
  const deleteExpenseMutation = useDeleteExpenseMutation()

  // Ensure expenses is always an array
  const expensesList = Array.isArray(expenses) ? expenses : []

  // Filter expenses based on search term and filters
  const filteredExpenses = expensesList.filter((expense) => {
    // Search term filter
    const matchesSearch =
      expense.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      expense.category?.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      expense.bank_account?.account_name.toLowerCase().includes(filters.searchTerm.toLowerCase())

    // Date range filter
    const expenseDate = new Date(expense.date)
    const matchesDateRange =
      (!filters.startDate || expenseDate >= new Date(filters.startDate)) &&
      (!filters.endDate || expenseDate <= new Date(filters.endDate))

    // Bank account filter
    const matchesBankAccount =
      !filters.bankAccountId ||
      filters.bankAccountId === "all" ||
      expense.bank_account_id === filters.bankAccountId

    // Category filter
    const matchesCategory =
      !filters.categoryId ||
      filters.categoryId === "all" ||
      expense.category_id === filters.categoryId

    // Status filter
    const matchesStatus =
      !filters.status || filters.status === "all" || expense.status === filters.status

    // Amount range filter
    const matchesAmountRange =
      (!filters.minAmount || expense.amount >= filters.minAmount) &&
      (!filters.maxAmount || expense.amount <= filters.maxAmount)

    return (
      matchesSearch &&
      matchesDateRange &&
      matchesBankAccount &&
      matchesCategory &&
      matchesStatus &&
      matchesAmountRange
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowExpenseDetails(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowExpenseForm(true)
  }

  const handleDeleteExpense = async (expense: Expense) => {
    try {
      await deleteExpenseMutation.mutateAsync(expense.id)
      toast.success("Expense deleted successfully")
    } catch (_error) {
      toast.error("Failed to delete expense")
    }
  }

  const handleFiltersChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters)
  }

  if (isLoading) {
    return (
      <Card className="persona-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="persona-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by description, category, or account..."
                value={filters.searchTerm}
                onChange={(e) => handleFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="persona-input"
              />
            </div>
            <Button
              variant="outline"
              className="persona-hover"
              onClick={() => setShowAdvancedFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="persona-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Expenses</CardTitle>
            <Badge variant="secondary" className="persona-badge">
              {filteredExpenses.length} expenses
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="min-w-[220px]">Category</TableHead>
                <TableHead className="min-w-[150px]">Account</TableHead>
                <TableHead className="w-[140px] text-right">Amount</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
                <TableHead className="w-[70px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {filters.searchTerm
                      ? "No expenses match your search."
                      : "No expenses found. Add your first expense to get started!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense, index) => {
                  // Handle both string values and objects from backend
                  let expenseTypeValue: string | undefined = expense.category?.expense_type as
                    | string
                    | undefined

                  // If it's an object, try to get the value property
                  if (expenseTypeValue && typeof expenseTypeValue === "object") {
                    const expenseTypeObj = expenseTypeValue as Record<string, unknown>
                    expenseTypeValue =
                      (expenseTypeObj.value as string) ||
                      (typeof expenseTypeObj.name === "string"
                        ? expenseTypeObj.name.toLowerCase()
                        : undefined)
                  }

                  // Validate it's a valid expense type
                  const validExpenseTypes = ["needs", "wants", "savings"]
                  const isValidType =
                    expenseTypeValue && validExpenseTypes.includes(expenseTypeValue)

                  const expenseTypeName = isValidType
                    ? ExpenseTypeConverter.valueToName(
                        expenseTypeValue as "needs" | "wants" | "savings"
                      )
                    : "Needs"
                  const expenseTypeColor = ExpenseTypeUtils.getDisplayColor(expenseTypeName)

                  return (
                    <TableRow
                      key={expense.id}
                      className="hover:bg-muted/50 transition-all duration-200 group"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <TableCell className="font-medium">{formatDate(expense.date)}</TableCell>
                      <TableCell>
                        <div className="truncate">{expense.description || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: expenseTypeColor }}
                          />
                          <span className="font-medium truncate">
                            {expense.category?.name || "Unknown"}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0"
                            style={{
                              borderColor: expenseTypeColor,
                              color: expenseTypeColor,
                            }}
                          >
                            {expenseTypeName}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate block">
                          {expense.bank_account?.account_name || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-lg text-red-600 dark:text-red-400">
                          {formatCurrency(expense.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={expense.status === "active" ? "default" : "secondary"}
                          className="persona-badge"
                        >
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild={true}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewDetails(expense)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Expense
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteExpense(expense)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Expense
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
        </CardContent>
      </Card>

      {/* Modals */}
      <AdvancedFilters
        open={showAdvancedFilters}
        onOpenChange={setShowAdvancedFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <ExpenseDetailsModal
        open={showExpenseDetails}
        onOpenChange={setShowExpenseDetails}
        expense={selectedExpense}
      />

      {showExpenseForm && (
        <ExpenseForm
          open={showExpenseForm}
          onOpenChange={setShowExpenseForm}
          editingExpense={selectedExpense}
        />
      )}
    </div>
  )
}
