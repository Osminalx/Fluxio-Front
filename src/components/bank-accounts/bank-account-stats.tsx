"use client"

import { Building2, DollarSign, TrendingUp, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { BankAccount } from "@/types/bank-account"
import { motion } from "framer-motion"

interface BankAccountStatsProps {
  accounts: BankAccount[]
  showDeleted?: boolean
}

export function BankAccountStats({ accounts, showDeleted = false }: BankAccountStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  // Calculate statistics
  const activeAccounts = accounts.filter((acc) => acc.status === "active")
  const totalRealBalance = activeAccounts.reduce((sum, acc) => sum + acc.real_balance, 0)
  const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalCommitted = activeAccounts.reduce(
    (sum, acc) => sum + acc.committed_fixed_expenses_month,
    0
  )
  const averageBalance = activeAccounts.length > 0 ? totalRealBalance / activeAccounts.length : 0

  const stats = showDeleted
    ? [
        {
          title: "Deleted Accounts",
          value: accounts.filter((acc) => acc.status === "deleted").length,
          icon: Building2,
          gradient: "from-red-500 to-rose-600",
          bgGradient: "from-red-500/10 to-rose-600/10",
          isCount: true,
        },
        {
          title: "Suspended/Locked",
          value: accounts.filter(
            (acc) => acc.status === "suspended" || acc.status === "locked"
          ).length,
          icon: Building2,
          gradient: "from-amber-500 to-orange-600",
          bgGradient: "from-amber-500/10 to-orange-600/10",
          isCount: true,
        },
        {
          title: "Total Deleted Balance",
          value: accounts
            .filter((acc) => acc.status === "deleted")
            .reduce((sum, acc) => sum + acc.balance, 0),
          icon: DollarSign,
          gradient: "from-gray-500 to-slate-600",
          bgGradient: "from-gray-500/10 to-slate-600/10",
        },
      ]
    : [
        {
          title: "Total Real Balance",
          value: totalRealBalance,
          icon: DollarSign,
          gradient: "from-emerald-500 to-teal-600",
          bgGradient: "from-emerald-500/10 to-teal-600/10",
        },
        {
          title: "Total Balance",
          value: totalBalance,
          icon: Wallet,
          gradient: "from-blue-500 to-cyan-600",
          bgGradient: "from-blue-500/10 to-cyan-600/10",
        },
        {
          title: "Committed Expenses",
          value: totalCommitted,
          icon: TrendingUp,
          gradient: "from-purple-500 to-pink-600",
          bgGradient: "from-purple-500/10 to-pink-600/10",
        },
        {
          title: "Active Accounts",
          value: activeAccounts.length,
          icon: Building2,
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


