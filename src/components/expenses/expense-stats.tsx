"use client"

import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Expense } from "@/types/expense"
import { motion } from "framer-motion"

interface ExpenseStatsProps {
  expenses: Expense[]
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  // Calculate statistics
  const activeExpenses = expenses.filter((exp) => exp.status === "active")
  const totalExpenses = activeExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyExpenses = activeExpenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const averageExpense = activeExpenses.length > 0 ? totalExpenses / activeExpenses.length : 0
  const activeCount = activeExpenses.length

  const stats = [
    {
      title: "Total Expenses",
      value: totalExpenses,
      icon: DollarSign,
      gradient: "from-red-500 to-rose-600",
      bgGradient: "from-red-500/10 to-rose-600/10",
    },
    {
      title: "This Month",
      value: monthlyExpenses,
      icon: Wallet,
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-500/10 to-amber-600/10",
    },
    {
      title: "Average Expense",
      value: averageExpense,
      icon: TrendingDown,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/10 to-pink-600/10",
    },
    {
      title: "Active Expenses",
      value: activeCount,
      icon: TrendingUp,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/10",
      isCount: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card
            className={cn(
              "persona-card p-6 persona-hover overflow-hidden relative",
              "bg-gradient-to-br",
              stat.bgGradient
            )}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "p-3 rounded-xl bg-gradient-to-br",
                    stat.gradient,
                    "shadow-lg"
                  )}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold">
                  {stat.isCount
                    ? stat.value
                    : formatCurrency(stat.value)}
                </h3>
              </div>
            </div>
            {/* Decorative gradient overlay */}
            <div
              className={cn(
                "absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl",
                "bg-gradient-to-br",
                stat.gradient
              )}
            />
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

