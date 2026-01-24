"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useActiveBankAccounts } from "@/lib/bank-account-queries"
import { useActiveExpensesQuery, useMonthlyExpensesQuery } from "@/lib/expense-queries"
import { useActiveIncomesQuery, useIncomesQuery } from "@/lib/income-queries"
import type { Expense } from "@/types/expense"
import type { Income } from "@/types/income"
import { ExpenseChart } from "./expense-chart"
import { FinancialCard } from "./financial-card"
import { RecentTransactions } from "./recent-transactions"

export function DashboardContent() {
  const router = useRouter()
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Calculate date ranges for current month
  // currentMonth is 1-12 (January = 1), JS Date months are 0-11 (January = 0)
  const currentMonthStart = new Date(currentYear, currentMonth - 1, 1).toISOString().split("T")[0]
  // To get last day of current month: new Date(year, month+1, 0) gives last day of month
  const currentMonthEnd = new Date(currentYear, currentMonth, 0).toISOString().split("T")[0]

  // Calculate date ranges for previous month
  const previousMonthStart = new Date(currentYear, currentMonth - 2, 1).toISOString().split("T")[0]
  const previousMonthEnd = new Date(currentYear, currentMonth - 1, 0).toISOString().split("T")[0]

  // Fetch data
  const { data: bankAccounts, isLoading: bankAccountsLoading } = useActiveBankAccounts()
  const { data: currentMonthExpenses, isLoading: expensesLoading } = useMonthlyExpensesQuery({
    year: currentYear,
    month: currentMonth,
  })
  const { data: previousMonthExpenses } = useMonthlyExpensesQuery({
    year: currentMonth === 1 ? currentYear - 1 : currentYear,
    month: currentMonth === 1 ? 12 : currentMonth - 1,
  })
  const { data: currentMonthIncomes, isLoading: incomesLoading } = useIncomesQuery({
    start_date: currentMonthStart,
    end_date: currentMonthEnd,
    status: "active",
  })
  const { data: previousMonthIncomes } = useIncomesQuery({
    start_date: previousMonthStart,
    end_date: previousMonthEnd,
    status: "active",
  })
  const { data: allActiveExpenses } = useActiveExpensesQuery()
  const { data: allActiveIncomes } = useActiveIncomesQuery()

  // Calculate financial metrics
  const financialData = useMemo(() => {
    // Total balance from all active bank accounts
    const totalBalance =
      bankAccounts?.items.reduce((sum, account) => sum + account.real_balance, 0) || 0

    // Current month totals
    const monthlyIncome = currentMonthIncomes?.reduce((sum, income) => sum + income.amount, 0) || 0
    const monthlyExpenses =
      currentMonthExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0

    // Previous month totals for comparison
    const previousMonthlyIncome =
      previousMonthIncomes?.reduce((sum, income) => sum + income.amount, 0) || 0
    const previousMonthlyExpenses =
      previousMonthExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0

    // Calculate savings (income - expenses for current month)
    const savings = monthlyIncome - monthlyExpenses
    const previousSavings = previousMonthlyIncome - previousMonthlyExpenses

    // Calculate percentage changes
    const incomeChange =
      previousMonthlyIncome > 0
        ? ((monthlyIncome - previousMonthlyIncome) / previousMonthlyIncome) * 100
        : 0
    const expensesChange =
      previousMonthlyExpenses > 0
        ? ((monthlyExpenses - previousMonthlyExpenses) / previousMonthlyExpenses) * 100
        : 0
    const savingsChange =
      previousSavings !== 0 ? ((savings - previousSavings) / Math.abs(previousSavings)) * 100 : 0

    // Balance change (simplified - could be improved with historical data)
    const balanceChange = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savings,
      balanceChange: Math.round(balanceChange * 10) / 10,
      incomeChange: Math.round(incomeChange * 10) / 10,
      expensesChange: Math.round(expensesChange * 10) / 10,
      savingsChange: Math.round(savingsChange * 10) / 10,
    }
  }, [
    bankAccounts,
    currentMonthExpenses,
    previousMonthExpenses,
    currentMonthIncomes,
    previousMonthIncomes,
  ])

  // Prepare recent transactions (combine expenses and income, sort by date)
  const recentTransactions = useMemo(() => {
    const transactions: Array<{
      id: string
      description: string
      amount: number
      date: string
      category: string
      type: "expense" | "income"
    }> = []

    // Add expenses
    if (allActiveExpenses) {
      allActiveExpenses.slice(0, 10).forEach((expense: Expense) => {
        transactions.push({
          id: expense.id,
          description: expense.description || expense.category?.name || "Expense",
          amount: -expense.amount, // Negative for expenses
          date: expense.date,
          category: expense.category?.name || "Uncategorized",
          type: "expense",
        })
      })
    }

    // Add incomes
    if (allActiveIncomes) {
      allActiveIncomes.slice(0, 10).forEach((income: Income) => {
        transactions.push({
          id: income.id,
          description: `Income - ${income.bank_account_name}`,
          amount: income.amount, // Positive for income
          date: income.date,
          category: "Income",
          type: "income",
        })
      })
    }

    // Sort by date (most recent first) and take top 10
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [allActiveExpenses, allActiveIncomes])

  const isLoading = bankAccountsLoading || expensesLoading || incomesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold persona-title">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Loading your financial overview...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["balance", "income", "expenses", "savings"].map((cardType) => (
            <Card key={`loading-${cardType}`} className="persona-card p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-8 bg-muted rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold persona-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <Button variant="default" className="gap-2" onClick={() => router.push("/expenses")}>
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          title="Total Balance"
          amount={financialData.totalBalance}
          change={financialData.balanceChange}
          icon={DollarSign}
          trend={financialData.balanceChange >= 0 ? "up" : "down"}
        />
        <FinancialCard
          title="Monthly Income"
          amount={financialData.monthlyIncome}
          change={financialData.incomeChange}
          icon={TrendingUp}
          trend={financialData.incomeChange >= 0 ? "up" : "down"}
        />
        <FinancialCard
          title="Monthly Expenses"
          amount={financialData.monthlyExpenses}
          change={financialData.expensesChange}
          icon={TrendingDown}
          trend={financialData.expensesChange <= 0 ? "up" : "down"}
        />
        <FinancialCard
          title="Savings"
          amount={financialData.savings}
          change={financialData.savingsChange}
          icon={CreditCard}
          trend={financialData.savings >= 0 ? "up" : "down"}
        />
      </div>

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Chart */}
        <Card className="persona-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Monthly Expenses & Income</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push("/expenses")}>
              View Details
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <ExpenseChart />
        </Card>

        {/* Recent Transactions */}
        <Card className="persona-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push("/expenses")}>
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <RecentTransactions transactions={recentTransactions} />
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="persona-card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 persona-hover"
            onClick={() => router.push("/incomes")}
          >
            <Plus className="h-6 w-6" />
            Add Income
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 persona-hover"
            onClick={() => router.push("/expenses")}
          >
            <ArrowDownRight className="h-6 w-6" />
            Record Expense
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 persona-hover"
            onClick={() => router.push("/goals")}
          >
            <TrendingUp className="h-6 w-6" />
            Set Budget Goal
          </Button>
        </div>
      </Card>
    </div>
  )
}
