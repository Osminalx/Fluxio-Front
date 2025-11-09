"use client"

import { DollarSign, TrendingUp, Calendar, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Income } from "@/types/income"
import { motion } from "framer-motion"

interface IncomeStatsProps {
  incomes: Income[]
}

export function IncomeStats({ incomes }: IncomeStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  // Calculate statistics
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyIncome = incomes
    .filter((income) => {
      const incomeDate = new Date(income.date)
      return (
        incomeDate.getMonth() === currentMonth &&
        incomeDate.getFullYear() === currentYear &&
        income.status === "active"
      )
    })
    .reduce((sum, income) => sum + income.amount, 0)

  const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0
  const activeCount = incomes.filter((income) => income.status === "active").length

  const stats = [
    {
      title: "Total Income",
      value: totalIncome,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/10 to-teal-600/10",
    },
    {
      title: "This Month",
      value: monthlyIncome,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/10",
    },
    {
      title: "Average Income",
      value: averageIncome,
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/10 to-pink-600/10",
    },
    {
      title: "Active Incomes",
      value: activeCount,
      icon: CheckCircle2,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/10 to-orange-600/10",
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


