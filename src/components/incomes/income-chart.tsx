"use client"

import { useMemo } from "react"
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
import type { Income } from "@/types/income"

interface IncomeChartProps {
  incomes: Income[]
}

export function IncomeChart({ incomes }: IncomeChartProps) {
  const incomeGradientId = useId()
  
  // Process data to group by month
  const chartData = useMemo(() => {
    const monthlyData = new Map<string, { amount: number; dateKey: string }>()
    
    incomes
      .filter((income) => income.status === "active")
      .forEach((income) => {
        const date = new Date(income.date)
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        
        if (!monthlyData.has(monthLabel)) {
          monthlyData.set(monthLabel, { amount: 0, dateKey })
        }
        const existing = monthlyData.get(monthLabel)!
        monthlyData.set(monthLabel, { amount: existing.amount + income.amount, dateKey: existing.dateKey })
      })

    // Sort by date and take last 6 months
    const sortedEntries = Array.from(monthlyData.entries())
      .sort((a, b) => {
        return a[1].dateKey.localeCompare(b[1].dateKey)
      })
      .slice(-6)

    return sortedEntries.map(([month, data]) => ({
      month,
      amount: Math.round(data.amount * 100) / 100,
    }))
  }, [incomes])

  const persona3Colors = {
    income: {
      main: "#10b981", // Emerald green for income
      light: "#34d399", // Lighter emerald
      stroke: "#059669", // Darker emerald for stroke
    },
    grid: "#334155", // Dark blue-gray for grid
    text: "#94a3b8", // Light blue-gray for text
    background: "#1e293b", // Dark background
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No income data available for chart</p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            {/* Income gradient with Persona 3 colors */}
            <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={persona3Colors.income.main} stopOpacity={0.4} />
              <stop offset="50%" stopColor={persona3Colors.income.light} stopOpacity={0.2} />
              <stop offset="100%" stopColor={persona3Colors.income.main} stopOpacity={0.05} />
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
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: persona3Colors.background,
              border: `1px solid ${persona3Colors.grid}`,
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
              color: "#e2e8f0",
            }}
            formatter={(value: number) => [
              `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              "Income",
            ]}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={persona3Colors.income.stroke}
            strokeWidth={3}
            fill={`url(#${incomeGradientId})`}
            name="Income"
            dot={{ fill: persona3Colors.income.main, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: persona3Colors.income.stroke }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

