"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EXPENSE_TYPE_NAMES, ExpenseTypeUtils } from "@/types/expense-type"
import type { ExpenseSummary } from "@/types/expense"
import { cn } from "@/lib/utils"

interface ExpenseTypeCardsProps {
  summary: ExpenseSummary | null | undefined
}

export function ExpenseTypeCards({ summary }: ExpenseTypeCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getGradientForType = (typeName: string) => {
    switch (typeName) {
      case "Needs":
        return {
          gradient: "from-red-500 to-rose-600",
          bgGradient: "from-red-500/10 to-rose-600/10",
        }
      case "Wants":
        return {
          gradient: "from-amber-500 to-orange-600",
          bgGradient: "from-amber-500/10 to-orange-600/10",
        }
      case "Savings":
        return {
          gradient: "from-emerald-500 to-teal-600",
          bgGradient: "from-emerald-500/10 to-teal-600/10",
        }
      default:
        return {
          gradient: "from-gray-500 to-slate-600",
          bgGradient: "from-gray-500/10 to-slate-600/10",
        }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {EXPENSE_TYPE_NAMES.map((expenseTypeName, index) => {
        const percentage = ExpenseTypeUtils.getRecommendedPercentage(expenseTypeName)
        const color = ExpenseTypeUtils.getDisplayColor(expenseTypeName)
        const description = ExpenseTypeUtils.getDescription(expenseTypeName)
        const { gradient, bgGradient } = getGradientForType(expenseTypeName)

        // Get actual spending for this expense type from summary
        const expenseTypeData = summary?.by_expense_type?.find(
          (item) => item.expense_type_name === expenseTypeName
        )
        const totalSpent = expenseTypeData?.total_amount || 0
        const actualPercentage = summary?.total_amount
          ? (totalSpent / summary.total_amount) * 100
          : 0

        return (
          <motion.div
            key={expenseTypeName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "persona-card border-2 hover:shadow-xl transition-all duration-300 persona-hover overflow-hidden relative",
                "bg-gradient-to-br",
                bgGradient
              )}
            >
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full shadow-lg",
                        "bg-gradient-to-br",
                        gradient
                      )}
                    />
                    {expenseTypeName}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="persona-badge font-bold"
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
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Spent</span>
                    <span className="font-bold text-xl" style={{ color }}>
                      {formatCurrency(totalSpent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Actual Percentage</span>
                    <span className="font-semibold text-lg">{actualPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                        width: `${Math.min((totalSpent / (summary?.total_amount || 1)) * 100, 100)}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((totalSpent / (summary?.total_amount || 1)) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </CardContent>
              {/* Decorative gradient overlay */}
              <div
                className={cn(
                  "absolute -right-12 -top-12 w-40 h-40 rounded-full opacity-10 blur-3xl",
                  "bg-gradient-to-br",
                  gradient
                )}
              />
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

