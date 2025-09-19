"use client"

import { useId } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Mock data for the chart
const data = [
  { month: "Jan", expenses: 2800, income: 8200 },
  { month: "Feb", expenses: 3200, income: 8500 },
  { month: "Mar", expenses: 2900, income: 8300 },
  { month: "Apr", expenses: 3400, income: 8700 },
  { month: "May", expenses: 3100, income: 8400 },
  { month: "Jun", expenses: 3300, income: 8600 },
  { month: "Jul", expenses: 3000, income: 8500 },
  { month: "Aug", expenses: 3250, income: 8500 },
  { month: "Sep", expenses: 3250, income: 8500 },
]

export function ExpenseChart() {
  const incomeGradientId = useId()
  const expensesGradientId = useId()

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
