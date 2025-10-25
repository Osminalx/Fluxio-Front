"use client"

import { ArrowLeft, DollarSign, Edit, History, Trash2, TrendingUp } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useBudgetHistoryByBudgetId } from "@/lib/budget-history-queries"
import { useDeleteBudget } from "@/lib/budget-queries"
import type { Budget } from "@/types/budgets"
import { BudgetForm } from "./budget-form"

interface BudgetDetailsProps {
  budget: Budget
  onBack: () => void
}

export function BudgetDetails({ budget, onBack }: BudgetDetailsProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const deleteMutation = useDeleteBudget()
  const { data: budgetHistory, isLoading: historyLoading } = useBudgetHistoryByBudgetId(budget.id)

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(budget.id)
      setShowDeleteConfirm(false)
      onBack() // Go back to list after deletion
    } catch {
      // Handle error silently or show toast notification
    }
  }

  const handleEditSuccess = () => {
    setShowEditForm(false)
    // The budget will be automatically updated via React Query
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "deleted":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getBudgetPercentages = () => {
    const total = budget.total_budget
    if (total === 0) {
      return { needs: 0, wants: 0, savings: 0 }
    }

    return {
      needs: (budget.needs_budget / total) * 100,
      wants: (budget.wants_budget / total) * 100,
      savings: (budget.savings_budget / total) * 100,
    }
  }

  const percentages = getBudgetPercentages()

  if (showEditForm) {
    return (
      <BudgetForm
        budget={budget}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleEditSuccess}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Budgets
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Details</h1>
            <p className="text-muted-foreground">
              {new Date(budget.month_year).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(budget.status)}>{budget.status}</Badge>
          {budget.status !== "deleted" && (
            <>
              <Button variant="outline" onClick={() => setShowEditForm(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budget.total_budget)}</div>
            <p className="text-xs text-muted-foreground">Monthly allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budget.needs_budget)}</div>
            <p className="text-xs text-muted-foreground">
              {percentages.needs.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wants Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budget.wants_budget)}</div>
            <p className="text-xs text-muted-foreground">
              {percentages.wants.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budget.savings_budget)}</div>
            <p className="text-xs text-muted-foreground">
              {percentages.savings.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Needs ({percentages.needs.toFixed(1)}%)</span>
                <span>{formatCurrency(budget.needs_budget)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${percentages.needs}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Wants ({percentages.wants.toFixed(1)}%)</span>
                <span>{formatCurrency(budget.wants_budget)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${percentages.wants}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Savings ({percentages.savings.toFixed(1)}%)</span>
                <span>{formatCurrency(budget.savings_budget)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${percentages.savings}%` }}
                />
              </div>
            </div>
          </div>

          {/* 50/30/20 Rule Comparison */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">50/30/20 Rule Comparison</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Needs</div>
                <div className="text-muted-foreground">
                  Your: {percentages.needs.toFixed(1)}% | Ideal: 50%
                </div>
              </div>
              <div>
                <div className="font-medium">Wants</div>
                <div className="text-muted-foreground">
                  Your: {percentages.wants.toFixed(1)}% | Ideal: 30%
                </div>
              </div>
              <div>
                <div className="font-medium">Savings</div>
                <div className="text-muted-foreground">
                  Your: {percentages.savings.toFixed(1)}% | Ideal: 20%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Information */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Created</div>
              <div>{formatDate(budget.created_at)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
              <div>{formatDate(budget.updated_at)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status Changed</div>
              <div>{formatDate(budget.status_changed_at)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Budget ID</div>
              <div className="font-mono text-sm">{budget.id}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !budgetHistory?.budget_history || budgetHistory.budget_history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No changes recorded for this budget.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Changed At</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Old Value</TableHead>
                    <TableHead>New Value</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetHistory.budget_history.slice(0, 5).map((entry) => (
                    <>
                      {entry.old_needs_budget !== entry.new_needs_budget && (
                        <TableRow key={`${entry.id}-needs`}>
                          <TableCell className="font-medium">
                            {formatDate(entry.changed_at)}
                          </TableCell>
                          <TableCell>Needs Budget</TableCell>
                          <TableCell>{formatCurrency(entry.old_needs_budget)}</TableCell>
                          <TableCell>{formatCurrency(entry.new_needs_budget)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.change_reason || "—"}
                          </TableCell>
                        </TableRow>
                      )}
                      {entry.old_wants_budget !== entry.new_wants_budget && (
                        <TableRow key={`${entry.id}-wants`}>
                          <TableCell className="font-medium">
                            {formatDate(entry.changed_at)}
                          </TableCell>
                          <TableCell>Wants Budget</TableCell>
                          <TableCell>{formatCurrency(entry.old_wants_budget)}</TableCell>
                          <TableCell>{formatCurrency(entry.new_wants_budget)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.change_reason || "—"}
                          </TableCell>
                        </TableRow>
                      )}
                      {entry.old_savings_budget !== entry.new_savings_budget && (
                        <TableRow key={`${entry.id}-savings`}>
                          <TableCell className="font-medium">
                            {formatDate(entry.changed_at)}
                          </TableCell>
                          <TableCell>Savings Budget</TableCell>
                          <TableCell>{formatCurrency(entry.old_savings_budget)}</TableCell>
                          <TableCell>{formatCurrency(entry.new_savings_budget)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.change_reason || "—"}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
              {budgetHistory.budget_history.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing 5 of {budgetHistory.budget_history.length} changes
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
