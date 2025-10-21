"use client"

import { Calendar, CreditCard, DollarSign, FileText, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Expense } from "@/types/expense"
import { ExpenseTypeConverter, ExpenseTypeUtils } from "@/types/expense-type"

interface ExpenseDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
}

export function ExpenseDetailsModal({ open, onOpenChange, expense }: ExpenseDetailsModalProps) {
  if (!expense) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get expense type info - handle both string and object formats
  let expenseTypeValue: string | undefined = expense.category?.expense_type as string | undefined

  // If it's an object, try to get the value property
  if (expenseTypeValue && typeof expenseTypeValue === "object") {
    const expenseTypeObj = expenseTypeValue as Record<string, unknown>
    expenseTypeValue =
      (expenseTypeObj.value as string) ||
      (typeof expenseTypeObj.name === "string" ? expenseTypeObj.name.toLowerCase() : undefined)
  }

  // Validate it's a valid expense type
  const validExpenseTypes = ["needs", "wants", "savings"]
  const isValidType = expenseTypeValue && validExpenseTypes.includes(expenseTypeValue)

  const expenseTypeName = isValidType
    ? ExpenseTypeConverter.valueToName(expenseTypeValue as "needs" | "wants" | "savings")
    : "Needs"
  const expenseTypeColor = ExpenseTypeUtils.getDisplayColor(expenseTypeName)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] persona-modal">
        <DialogHeader>
          <DialogTitle className="persona-title flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Expense Details
          </DialogTitle>
          <DialogDescription>View detailed information about this expense.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Info */}
          <Card className="persona-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {expense.description || "No description"}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${expenseTypeColor}20`,
                        borderColor: expenseTypeColor,
                        color: expenseTypeColor,
                      }}
                    >
                      {expenseTypeName}
                    </Badge>
                    <Badge
                      variant={expense.status === "active" ? "default" : "secondary"}
                      className="persona-badge"
                    >
                      {expense.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">
                    {formatCurrency(expense.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <Card className="persona-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{formatDate(expense.date)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card className="persona-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-medium flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: expenseTypeColor }}
                      />
                      {expense.category?.name || "Unknown"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Account */}
            <Card className="persona-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Bank Account</div>
                    <div className="font-medium">
                      {expense.bank_account?.account_name || "Unknown"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="persona-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-medium capitalize">{expense.status}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timestamps */}
          <Card className="persona-card">
            <CardHeader>
              <CardTitle className="text-lg">Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDateTime(expense.created_at)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{formatDateTime(expense.updated_at)}</span>
              </div>
              {expense.status_changed_at && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status Changed</span>
                  <span className="font-medium">{formatDateTime(expense.status_changed_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
