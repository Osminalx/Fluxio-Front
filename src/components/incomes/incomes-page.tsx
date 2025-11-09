"use client"

import { Plus, TrendingUp } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IncomesList } from "./incomes-list"
import { IncomeForm } from "./income-form"
import { IncomeStats } from "./income-stats"
import { IncomeChart } from "./income-chart"
import { useIncomesQuery } from "@/lib/income-queries"

export function IncomesPage() {
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const { data: incomes, isLoading } = useIncomesQuery()
  const incomesList = Array.isArray(incomes) ? incomes : []

  return (
    <div className="space-y-6 p-6 persona-gradient min-h-screen">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold persona-title bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Income Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track money coming into your accounts
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowIncomeForm(true)}
            className="persona-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Income
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      {!isLoading && incomesList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <IncomeStats incomes={incomesList} />
        </motion.div>
      )}

      {/* Chart and List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Trend Chart */}
        {!isLoading && incomesList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="persona-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>Income Trends</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <IncomeChart incomes={incomesList} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats Card */}
        {!isLoading && incomesList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="persona-card h-full">
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Total Records</span>
                    <span className="font-bold text-lg">{incomesList.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-bold text-lg text-emerald-500">
                      {incomesList.filter((i) => i.status === "active").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Inactive</span>
                    <span className="font-bold text-lg text-muted-foreground">
                      {incomesList.filter((i) => i.status !== "active").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Recent Incomes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="persona-card">
          <CardHeader>
            <CardTitle>Recent Incomes</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomesList />
          </CardContent>
        </Card>
      </motion.div>

      {showIncomeForm && (
        <IncomeForm open={showIncomeForm} onOpenChange={setShowIncomeForm} editingIncome={null} />
      )}
    </div>
  )
}










