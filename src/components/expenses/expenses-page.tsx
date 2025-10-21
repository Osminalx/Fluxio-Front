"use client"

import { DollarSign, Filter, Plus, TrendingUp } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useExpenseSummaryQuery } from "@/lib/expense-queries"
import { EXPENSE_TYPE_NAMES, ExpenseTypeUtils } from "@/types/expense-type"
import { CategoriesManagement } from "./categories-management"
import { ExpenseForm } from "./expense-form"
import { ExpenseSummary } from "./expense-summary"
import { ExpensesList } from "./expenses-list"

export function ExpensesPage() {
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const { data: summary } = useExpenseSummaryQuery()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold persona-title bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Expense Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your expenses following the 50/30/20 financial philosophy
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowExpenseForm(true)}
            className="persona-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* 50/30/20 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {EXPENSE_TYPE_NAMES.map((expenseTypeName) => {
          const percentage = ExpenseTypeUtils.getRecommendedPercentage(expenseTypeName)
          const color = ExpenseTypeUtils.getDisplayColor(expenseTypeName)
          const description = ExpenseTypeUtils.getDescription(expenseTypeName)

          // Get actual spending for this expense type from summary
          const expenseTypeData = summary?.by_expense_type?.find(
            (item) => item.expense_type_name === expenseTypeName
          )
          const totalSpent = expenseTypeData?.total_amount || 0
          const actualPercentage = summary?.total_amount
            ? (totalSpent / summary.total_amount) * 100
            : 0

          return (
            <Card
              key={expenseTypeName}
              className="persona-card border-2 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    {expenseTypeName}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="persona-badge"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      borderColor: color,
                    }}
                  >
                    {percentage}%
                  </Badge>
                </div>
                <CardDescription className="text-sm">{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Spent</span>
                    <span className="font-semibold text-lg" style={{ color }}>
                      ${totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Actual Percentage</span>
                    <span className="font-medium">{actualPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: color,
                        width: `${Math.min((totalSpent / (summary?.total_amount || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 persona-tabs">
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-6">
          <ExpensesList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ExpenseSummary />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoriesManagement />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showExpenseForm && (
        <ExpenseForm
          open={showExpenseForm}
          onOpenChange={setShowExpenseForm}
          editingExpense={null}
        />
      )}
    </div>
  )
}
