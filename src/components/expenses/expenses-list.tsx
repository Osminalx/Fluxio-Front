"use client"

import { Edit, Eye, Filter, MoreHorizontal, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useExpensesQuery } from "@/lib/expense-queries"
import { ExpenseTypeUtils } from "@/types/expense-type"

export function ExpensesList() {
  const [searchTerm, setSearchTerm] = useState("")
  // const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const { data: expensesData, isLoading } = useExpensesQuery()

  const expenses = expensesData?.expenses || []

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.bank_account.account_name.toLowerCase().includes(searchTerm.toLowerCase())
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="persona-input"
              />
            </div>
            <Button variant="outline" className="persona-hover">
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
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm
                        ? "No expenses match your search."
                        : "No expenses found. Add your first expense to get started!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => {
                    const expenseTypeColor = ExpenseTypeUtils.getDisplayColor(
                      expense.category.expense_type.name
                    )

                    return (
                      <TableRow key={expense.id} className="persona-hover">
                        <TableCell className="font-medium">{formatDate(expense.date)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">{expense.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: expenseTypeColor }}
                            />
                            <span className="font-medium">{expense.category.name}</span>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: expenseTypeColor,
                                color: expenseTypeColor,
                              }}
                            >
                              {expense.category.expense_type.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {expense.bank_account.account_name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-lg">
                            {formatCurrency(expense.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
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
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  // TODO: Implement view details functionality
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Expense
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
