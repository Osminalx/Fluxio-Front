"use client"

import { Calendar, DollarSign, Filter, Plus, TrendingUp } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { FixedExpenseForm } from "@/components/fixed-expenses/fixed-expense-form"
import { FixedExpensesList } from "@/components/fixed-expenses/fixed-expenses-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useExpenseSummaryQuery, useExpensesQuery } from "@/lib/expense-queries"
import { CategoriesManagement } from "./categories-management"
import { ExpenseChart } from "./expense-chart"
import { ExpenseForm } from "./expense-form"
import { ExpenseStats } from "./expense-stats"
import { ExpenseSummary } from "./expense-summary"
import { ExpenseTypeCards } from "./expense-type-cards"
import { ExpensesList } from "./expenses-list"

export function ExpensesPage() {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showFixedExpenseForm, setShowFixedExpenseForm] = useState(false)
  const [activeTab, setActiveTab] = useState("expenses")

  const { data: summary } = useExpenseSummaryQuery()
  const { data: expenses } = useExpensesQuery()
  const expensesList = Array.isArray(expenses) ? expenses : []

  return (
    <div className="space-y-6 p-6 persona-gradient min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold persona-title bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Expense Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track your expenses following the 50/30/20 financial philosophy
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === "fixed-expenses" ? (
            <Button
              onClick={() => setShowFixedExpenseForm(true)}
              className="persona-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Fixed Expense
            </Button>
          ) : (
            <Button
              onClick={() => setShowExpenseForm(true)}
              className="persona-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Expense
            </Button>
          )}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      {expensesList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ExpenseStats expenses={expensesList} />
        </motion.div>
      )}

      {/* 50/30/20 Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ExpenseTypeCards summary={summary} />
      </motion.div>

      {/* Chart Section */}
      {expensesList.length > 0 && activeTab === "expenses" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="persona-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Expense Trends</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ExpenseChart expenses={expensesList} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <Tabs
        defaultValue="expenses"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 persona-tabs">
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="fixed-expenses" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fixed Expenses
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

        <TabsContent value="fixed-expenses" className="space-y-6">
          <FixedExpensesList />
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

      {showFixedExpenseForm && (
        <FixedExpenseForm
          open={showFixedExpenseForm}
          onOpenChange={setShowFixedExpenseForm}
          editingFixedExpense={null}
        />
      )}
    </div>
  )
}
