"use client"

import { CreditCard, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useExpenseSummaryQuery } from "@/lib/expense-queries"
import { EXPENSE_TYPE_NAMES, type ExpenseTypeName, ExpenseTypeUtils } from "@/types/expense-type"

export function ExpenseSummary() {
  const { data: summary, isLoading } = useExpenseSummaryQuery()

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
            <p className="text-xs text-muted-foreground">{summary.total_expenses} transactions</p>
          </CardContent>
        </Card>

        <Card className="persona-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.average_amount)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card className="persona-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories Used</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.by_category.length}</div>
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
            {EXPENSE_TYPE_NAMES.map((expenseTypeName) => {
              const recommendedPercentage =
                ExpenseTypeUtils.getRecommendedPercentage(expenseTypeName)
              const color = ExpenseTypeUtils.getDisplayColor(expenseTypeName)

              // Calculate actual spending for this expense type
              const categoryData = summary.by_category.filter(
                (cat) => cat.expense_type_name === expenseTypeName
              )
              const totalSpent = categoryData.reduce((sum, cat) => sum + cat.total_amount, 0)
              const actualPercentage =
                summary.total_amount > 0 ? (totalSpent / summary.total_amount) * 100 : 0

              const isOverBudget = actualPercentage > recommendedPercentage
              const difference = actualPercentage - recommendedPercentage

              return (
                <div key={expenseTypeName} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium">{expenseTypeName}</span>
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
            {summary.by_category
              .sort((a, b) => b.total_amount - a.total_amount)
              .slice(0, 5)
              .map((category) => {
                const color = ExpenseTypeUtils.getDisplayColor(
                  category.expense_type_name as ExpenseTypeName
                )

                return (
                  <div
                    key={category.category_id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <div>
                        <p className="font-medium">{category.category_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.expense_type_name} • {category.total_expenses} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(category.total_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Breakdown */}
      {summary.by_bank_account.length > 0 && (
        <Card className="persona-card">
          <CardHeader>
            <CardTitle>Spending by Account</CardTitle>
            <CardDescription>How much you've spent from each bank account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.by_bank_account.map((account) => (
                <div
                  key={account.bank_account_id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.total_expenses} transactions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(account.total_amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.percentage.toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
