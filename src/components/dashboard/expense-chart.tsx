"use client"

import { useId, useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useActiveExpensesQuery } from "@/lib/expense-queries"
import { useActiveIncomesQuery } from "@/lib/income-queries"
import type { Expense } from "@/types/expense"
import type { Income } from "@/types/income"

export function ExpenseChart() {
  const incomeGradientId = useId()
  const expensesGradientId = useId()

  // Fetch all active expenses and incomes
  const { data: expenses, isLoading: expensesLoading } = useActiveExpensesQuery()
  const { data: incomes, isLoading: incomesLoading } = useActiveIncomesQuery()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Prepare chart data for last 6 months
  const data = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]

    const chartData: Array<{ month: string; expenses: number; income: number }> = []

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const monthName = monthNames[date.getMonth()]

      // Filter expenses for this month
      const monthExpenses =
        expenses?.filter((expense: Expense) => {
          const expenseDate = new Date(expense.date)
          return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month
        }) || []

      // Filter incomes for this month
      const monthIncomes =
        incomes?.filter((income: Income) => {
          const incomeDate = new Date(income.date)
          return incomeDate.getFullYear() === year && incomeDate.getMonth() + 1 === month
        }) || []

      // Calculate totals
      const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const totalIncome = monthIncomes.reduce((sum, income) => sum + income.amount, 0)

      chartData.push({
        month: monthName,
        expenses: Math.round(totalExpenses * 100) / 100,
        income: Math.round(totalIncome * 100) / 100,
      })
    }

    return chartData
  }, [expenses, incomes, currentYear, currentMonth])

  const isLoading = expensesLoading || incomesLoading

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  // Show empty state if no data
  if (!data || data.length === 0 || data.every((d) => d.expenses === 0 && d.income === 0)) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-muted-foreground">No data available for the last 6 months</div>
      </div>
    )
  }

  // Persona 3 Reload inspired colors - matching the game's sleek, modern aesthetic
  const persona3Colors = {
    income: {
      main: "#10b981", // Emerald green for income
      light: "#34d399", // Lighter emerald
      stroke: "#059669", // Darker emerald for stroke
    },
    expenses: {
      main: "#3b82f6", // Electric blue for expenses
      light: "#60a5fa", // Lighter blue
      stroke: "#2563eb", // Darker blue for stroke
    },
    grid: "#334155", // Dark blue-gray for grid
    text: "#94a3b8", // Light blue-gray for text
    background: "#1e293b", // Dark background
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            {/* Income gradient with Persona 3 colors */}
            <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={persona3Colors.income.main} stopOpacity={0.4} />
              <stop offset="50%" stopColor={persona3Colors.income.light} stopOpacity={0.2} />
              <stop offset="100%" stopColor={persona3Colors.income.main} stopOpacity={0.05} />
            </linearGradient>
            {/* Expenses gradient with Persona 3 colors */}
            <linearGradient id={expensesGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={persona3Colors.expenses.main} stopOpacity={0.4} />
              <stop offset="50%" stopColor={persona3Colors.expenses.light} stopOpacity={0.2} />
              <stop offset="100%" stopColor={persona3Colors.expenses.main} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={persona3Colors.grid} opacity={0.3} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: persona3Colors.text }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: persona3Colors.text }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: persona3Colors.background,
              border: `1px solid ${persona3Colors.grid}`,
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
              color: "#e2e8f0",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            labelStyle={{ color: "#e2e8f0" }}
          />
          {/* Income area with emerald colors */}
          <Area
            type="monotone"
            dataKey="income"
            stroke={persona3Colors.income.stroke}
            strokeWidth={3}
            fill={`url(#${incomeGradientId})`}
            name="Income"
            dot={{ fill: persona3Colors.income.main, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: persona3Colors.income.stroke }}
          />
          {/* Expenses area with blue colors */}
          <Area
            type="monotone"
            dataKey="expenses"
            stroke={persona3Colors.expenses.stroke}
            strokeWidth={3}
            fill={`url(#${expensesGradientId})`}
            name="Expenses"
            dot={{ fill: persona3Colors.expenses.main, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: persona3Colors.expenses.stroke }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
