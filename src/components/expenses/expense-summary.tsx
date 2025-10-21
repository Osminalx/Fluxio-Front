"use client"

import { DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useExpenseSummaryQuery } from "@/lib/expense-queries"
import { EXPENSE_TYPES, ExpenseTypeUtils } from "@/types/expense-type"

export function ExpenseSummary() {
  const { data: summary, isLoading: summaryLoading } = useExpenseSummaryQuery()
  const isLoading = summaryLoading

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, () => (
          <Card key={`loading-card-${Math.random()}`} className="persona-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-8 bg-muted rounded w-1/2" />
                <div className="h-2 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <Card className="persona-card">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No expense data available yet.</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="persona-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_amount)}</div>
            <p className="text-xs text-muted-foreground">Total spending this period</p>
          </CardContent>
        </Card>

        <Card className="persona-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs (50%)</CardTitle>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: ExpenseTypeUtils.getDisplayColor("Needs") }}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                summary.by_expense_type.find((item) => item.expense_type_name === "Needs")
                  ?.total_amount || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Essential expenses</p>
          </CardContent>
        </Card>

        <Card className="persona-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.top_categories.length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      {/* 50/30/20 Breakdown */}
      <Card className="persona-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">50/30/20 Budget Analysis</CardTitle>
          <CardDescription>
            See how your spending aligns with the recommended financial philosophy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {EXPENSE_TYPES.map((expenseType) => {
              const recommendedPercentage = expenseType.percentage
              const color = ExpenseTypeUtils.getDisplayColor(expenseType.name)

              // Get actual spending for this expense type from the API
              const expenseTypeData = summary.by_expense_type.find(
                (item) => item.expense_type_name === expenseType.name
              )
              const totalSpent = expenseTypeData?.total_amount || 0
              const actualPercentage =
                summary.total_amount > 0 ? (totalSpent / summary.total_amount) * 100 : 0

              const isOverBudget = actualPercentage > recommendedPercentage
              const difference = actualPercentage - recommendedPercentage

              return (
                <div key={expenseType.value} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium">{expenseType.name}</span>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: color,
                          color: color,
                        }}
                      >
                        Target: {recommendedPercentage}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(totalSpent)} ({actualPercentage.toFixed(1)}%)
                      </span>
                      {isOverBudget ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />+{difference.toFixed(1)}%
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />-{Math.abs(difference).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress
                      value={actualPercentage}
                      max={100}
                      className="h-2"
                      style={{
                        backgroundColor: `${color}20`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="font-medium" style={{ color }}>
                        {recommendedPercentage}% recommended
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card className="persona-card">
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
          <CardDescription>Your most expensive categories this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.top_categories.map((category, index) => {
              const color = ExpenseTypeUtils.getDisplayColor(
                category.expense_type_name as "Needs" | "Wants" | "Savings"
              )
              const percentage =
                summary.total_amount > 0 ? (category.total_amount / summary.total_amount) * 100 : 0

              return (
                <div
                  key={`${category.category_name}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <div>
                      <p className="font-medium">{category.category_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ExpenseTypeUtils.getDescription(
                          category.expense_type_name as "Needs" | "Wants" | "Savings"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(category.total_amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
