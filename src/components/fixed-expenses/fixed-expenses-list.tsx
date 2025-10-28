"use client"

import { Calendar, DollarSign, Edit, MoreHorizontal, Search, Trash2 } from "lucide-react"
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
import { useDeleteFixedExpenseMutation, useFixedExpensesQuery } from "@/lib/fixed-expense-queries"
import { ExpenseTypeConverter, ExpenseTypeUtils } from "@/types/expense-type"
import type { FixedExpense } from "@/types/fixed-expense"
import { FixedExpenseForm } from "./fixed-expense-form"

export function FixedExpensesList() {
  const [selectedFixedExpense, setSelectedFixedExpense] = useState<FixedExpense | null>(null)
  const [showFixedExpenseForm, setShowFixedExpenseForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: fixedExpenses, isLoading } = useFixedExpensesQuery()
  const deleteFixedExpenseMutation = useDeleteFixedExpenseMutation()

  // Ensure fixedExpenses is always an array
  const fixedExpensesList = Array.isArray(fixedExpenses) ? fixedExpenses : []

  // Filter fixed expenses based on search term
  const filteredFixedExpenses = fixedExpensesList.filter((fixedExpense) => {
    return fixedExpense.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Calculate total monthly fixed expenses
  const totalMonthlyAmount = filteredFixedExpenses.reduce(
    (sum, fixedExpense) => sum + fixedExpense.amount,
    0
  )

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

  // Get day of month from date string
  const getDayOfMonth = (dateString: string) => {
    return new Date(dateString).getDate()
  }

  const handleEditFixedExpense = (fixedExpense: FixedExpense) => {
    setSelectedFixedExpense(fixedExpense)
    setShowFixedExpenseForm(true)
  }

  const handleDeleteFixedExpense = async (fixedExpense: FixedExpense) => {
    try {
      await deleteFixedExpenseMutation.mutateAsync(fixedExpense.id)
      toast.success("Fixed expense deleted successfully")
    } catch (_error) {
      toast.error("Failed to delete fixed expense")
    }
  }

  // Check if a due date is upcoming (within next 7 days)
  const isUpcoming = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }

  // Check if a due date is overdue
  const isOverdue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    return due < today
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
      {/* Summary Card */}
      <Card className="persona-card border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Monthly Fixed Expenses</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalMonthlyAmount)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Active Fixed Expenses</p>
              <p className="text-2xl font-bold">{filteredFixedExpenses.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="persona-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Fixed Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="persona-input"
          />
        </CardContent>
      </Card>

      {/* Fixed Expenses Table */}
      <Card className="persona-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recurring Bills & Subscriptions</CardTitle>
            <Badge variant="secondary" className="persona-badge">
              {filteredFixedExpenses.length} expenses
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Name</TableHead>
                <TableHead className="w-[140px] text-right">Amount</TableHead>
                <TableHead className="w-[120px]">Bank Account</TableHead>
                <TableHead className="w-[140px]">Category</TableHead>
                <TableHead className="w-[180px]">Due Date</TableHead>
                <TableHead className="w-[120px] text-center">Recurrence</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
                <TableHead className="w-[70px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFixedExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm
                      ? "No fixed expenses match your search."
                      : "No fixed expenses found. Add your first recurring bill or subscription!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredFixedExpenses.map((fixedExpense) => {
                  const upcoming = isUpcoming(fixedExpense.due_date)
                  const overdue = isOverdue(fixedExpense.due_date)

                  // Get category expense type for coloring
                  let expenseTypeValue: string | undefined = fixedExpense.category?.expense_type as
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
                    : null
                  const expenseTypeColor = expenseTypeName
                    ? ExpenseTypeUtils.getDisplayColor(expenseTypeName)
                    : null

                  return (
                    <TableRow
                      key={fixedExpense.id}
                      className="hover:bg-muted/50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">{fixedExpense.name}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-lg">
                          {formatCurrency(fixedExpense.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {fixedExpense.bank_account ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {fixedExpense.bank_account.account_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(fixedExpense.bank_account.balance)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No account</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {fixedExpense.category ? (
                          <div className="flex items-center gap-2">
                            {expenseTypeColor && (
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: expenseTypeColor }}
                              />
                            )}
                            <span className="font-medium">{fixedExpense.category.name}</span>
                            {expenseTypeName && expenseTypeColor && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: expenseTypeColor,
                                  color: expenseTypeColor,
                                }}
                              >
                                {expenseTypeName}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No category</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(fixedExpense.due_date)}</span>
                          {upcoming && !overdue && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            >
                              Due Soon
                            </Badge>
                          )}
                          {overdue && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-red-500/10 text-red-600 border-red-500/20"
                            >
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Day {getDayOfMonth(fixedExpense.due_date)} of each month
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={fixedExpense.is_recurring ? "default" : "secondary"}
                          className="persona-badge"
                        >
                          {fixedExpense.recurrence_type === "monthly" ? "Monthly" : "Yearly"}
                        </Badge>
                        {!fixedExpense.is_recurring && (
                          <p className="text-xs text-muted-foreground mt-1">One-time</p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={fixedExpense.status === "active" ? "default" : "secondary"}
                          className="persona-badge"
                        >
                          {fixedExpense.status}
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
                            <DropdownMenuItem onClick={() => handleEditFixedExpense(fixedExpense)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Fixed Expense
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteFixedExpense(fixedExpense)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
      {showFixedExpenseForm && (
        <FixedExpenseForm
          open={showFixedExpenseForm}
          onOpenChange={setShowFixedExpenseForm}
          editingFixedExpense={selectedFixedExpense}
        />
      )}
    </div>
  )
}
