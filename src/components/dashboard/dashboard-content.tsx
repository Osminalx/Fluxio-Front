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
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExpenseChart } from "./expense-chart"
import { FinancialCard } from "./financial-card"
import { RecentTransactions } from "./recent-transactions"

// Mock data - replace with real data from your backend
const financialData = {
  totalBalance: 15420.5,
  monthlyIncome: 8500.0,
  monthlyExpenses: 3250.75,
  savings: 12169.75,
  balanceChange: 2.5, // percentage
  incomeChange: 5.2,
  expensesChange: -1.8,
  savingsChange: 8.3,
}

const recentTransactions = [
  { id: 1, description: "Grocery Store", amount: -89.32, date: "2025-09-17", category: "Food" },
  { id: 2, description: "Salary Deposit", amount: 4250.0, date: "2025-09-15", category: "Income" },
  {
    id: 3,
    description: "Electric Bill",
    amount: -125.5,
    date: "2025-09-14",
    category: "Utilities",
  },
  { id: 4, description: "Coffee Shop", amount: -12.75, date: "2025-09-14", category: "Food" },
  {
    id: 5,
    description: "Gas Station",
    amount: -65.2,
    date: "2025-09-13",
    category: "Transportation",
  },
]

export function DashboardContent() {
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
        <Button variant="persona" className="gap-2">
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
          trend="up"
        />
        <FinancialCard
          title="Monthly Income"
          amount={financialData.monthlyIncome}
          change={financialData.incomeChange}
          icon={TrendingUp}
          trend="up"
        />
        <FinancialCard
          title="Monthly Expenses"
          amount={financialData.monthlyExpenses}
          change={financialData.expensesChange}
          icon={TrendingDown}
          trend="down"
        />
        <FinancialCard
          title="Savings"
          amount={financialData.savings}
          change={financialData.savingsChange}
          icon={CreditCard}
          trend="up"
        />
      </div>

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Chart */}
        <Card className="persona-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Monthly Expenses</h3>
            <Button variant="ghost" size="sm">
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
            <Button variant="ghost" size="sm">
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
          <Button variant="outline" className="h-20 flex-col gap-2 persona-hover">
            <Plus className="h-6 w-6" />
            Add Income
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 persona-hover">
            <ArrowDownRight className="h-6 w-6" />
            Record Expense
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 persona-hover">
            <TrendingUp className="h-6 w-6" />
            Set Budget Goal
          </Button>
        </div>
      </Card>
    </div>
  )
}
