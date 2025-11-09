"use client"

import { useMemo } from "react"
import { useId } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { BankAccount } from "@/types/bank-account"

interface BankAccountChartProps {
  accounts: BankAccount[]
}

export function BankAccountChart({ accounts }: BankAccountChartProps) {
  const balanceGradientId = useId()
  const realBalanceGradientId = useId()

  // Process data for chart - show top accounts by balance
  const chartData = useMemo(() => {
    const activeAccounts = accounts.filter((acc) => acc.status === "active")
    
    // Sort by real balance and take top 6
    const sortedAccounts = [...activeAccounts]
      .sort((a, b) => b.real_balance - a.real_balance)
      .slice(0, 6)

    return sortedAccounts.map((account) => ({
      name: account.account_name.length > 12 
        ? `${account.account_name.substring(0, 12)}...` 
        : account.account_name,
      balance: Math.round(account.balance * 100) / 100,
      realBalance: Math.round(account.real_balance * 100) / 100,
    }))
  }, [accounts])

  const persona3Colors = {
    balance: {
      main: "#3b82f6", // Electric blue
      light: "#60a5fa",
      stroke: "#2563eb",
    },
    realBalance: {
      main: "#10b981", // Emerald green
      light: "#34d399",
      stroke: "#059669",
    },
    grid: "#334155",
    text: "#94a3b8",
    background: "#1e293b",
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No account data available for chart</p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={balanceGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={persona3Colors.balance.main} stopOpacity={0.8} />
              <stop offset="100%" stopColor={persona3Colors.balance.light} stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id={realBalanceGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={persona3Colors.realBalance.main} stopOpacity={0.8} />
              <stop offset="100%" stopColor={persona3Colors.realBalance.light} stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={persona3Colors.grid} opacity={0.3} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: persona3Colors.text }}
            angle={-45}
            textAnchor="end"
            height={60}
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
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              name === "balance" ? "Current Balance" : "Real Balance",
            ]}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Bar
            dataKey="balance"
            fill={`url(#${balanceGradientId})`}
            name="Current Balance"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="realBalance"
            fill={`url(#${realBalanceGradientId})`}
            name="Real Balance"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


