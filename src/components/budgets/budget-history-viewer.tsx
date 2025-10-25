"use client"

import { Calendar, History, TrendingDown, TrendingUp } from "lucide-react"
import { useId, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useBudgetHistory,
  useBudgetHistoryByBudgetId,
  useBudgetHistoryByDateRange,
  useBudgetHistoryPatterns,
  useBudgetHistoryStats,
  useBudgetHistoryWithReasons,
} from "@/lib/budget-history-queries"
import type { BudgetHistory } from "@/types/budget-history"

interface BudgetHistoryViewerProps {
  budgetId?: string // Optional: filter by specific budget
}

export function BudgetHistoryViewer({ budgetId }: BudgetHistoryViewerProps) {
  const startDateId = useId()
  const endDateId = useId()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "stats" | "patterns">("all")

  // Queries
  const { data: allHistory, isLoading: allLoading } = useBudgetHistory()
  const { data: budgetSpecificHistory, isLoading: budgetLoading } = useBudgetHistoryByBudgetId(
    budgetId || ""
  )
  const { data: historyWithReasons, isLoading: reasonsLoading } = useBudgetHistoryWithReasons()
  const { data: dateRangeHistory, isLoading: dateRangeLoading } = useBudgetHistoryByDateRange(
    // biome-ignore lint/style/useNamingConvention: API uses snake_case
    { start_date: startDate, end_date: endDate },
    !!startDate && !!endDate
  )
  const { data: stats, isLoading: statsLoading } = useBudgetHistoryStats()
  const { data: patterns, isLoading: patternsLoading } = useBudgetHistoryPatterns()

  // Choose which data to display based on filters
  const historyData = budgetId
    ? budgetSpecificHistory?.budget_history
    : startDate && endDate
      ? dateRangeHistory?.budget_history
      : allHistory?.budget_history

  const isLoading = budgetId ? budgetLoading : startDate && endDate ? dateRangeLoading : allLoading

  const formatCurrency = (amount: number | null) => {
    if (amount === null) {
      return "N/A"
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const clearDateFilters = () => {
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget History</h1>
          <p className="text-muted-foreground">Track all changes made to your budgets over time.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="all">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <Calendar className="mr-2 h-4 w-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Date Range Filter */}
          {!budgetId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filter by Date Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor={startDateId} className="text-sm font-medium mb-2 block">
                      Start Date
                    </label>
                    <Input
                      id={startDateId}
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={endDateId} className="text-sm font-medium mb-2 block">
                      End Date
                    </label>
                    <Input
                      id={endDateId}
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  {(startDate || endDate) && (
                    <div className="flex items-end">
                      <Button variant="outline" onClick={clearDateFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Budget Change History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : historyData && historyData.length > 0 ? (
                <BudgetHistoryTable history={historyData} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No budget history found.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History with Reasons */}
          {!budgetId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Changes with Reasons
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reasonsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : historyWithReasons?.budget_history &&
                  historyWithReasons.budget_history.length > 0 ? (
                  <BudgetHistoryTable
                    history={historyWithReasons.budget_history}
                    showReason={true}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No budget changes with reasons found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Budget History Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Changes</p>
                    <p className="text-3xl font-bold">{stats.total_changes}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Change</p>
                    <p className="text-3xl font-bold">{formatCurrency(stats.average_change)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Most Common Reason</p>
                    <p className="text-xl font-semibold">{stats.most_common_reason || "N/A"}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No statistics available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Budget Change Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patternsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : patterns?.patterns && patterns.patterns.length > 0 ? (
                <div className="space-y-4">
                  {patterns.patterns.map((pattern, index) => (
                    <div
                      key={`${pattern.month}-${index}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{pattern.month}</p>
                        <p className="text-sm text-muted-foreground">
                          {pattern.most_common_reason || "No reason provided"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Changes</p>
                        <p className="font-semibold">{pattern.change_count}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Avg Change</p>
                        <p className="font-semibold">{formatCurrency(pattern.average_change)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No patterns found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface BudgetHistoryTableProps {
  history: BudgetHistory[]
  showReason?: boolean
}

function BudgetHistoryTable({ history, showReason = false }: BudgetHistoryTableProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) {
      return "—"
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateChange = (oldValue: number | null, newValue: number | null) => {
    if (oldValue === null || newValue === null) {
      return null
    }
    return newValue - oldValue
  }

  const renderChangeIndicator = (change: number | null) => {
    if (change === null) {
      return null
    }
    if (change === 0) {
      return <Badge variant="secondary">No Change</Badge>
    }

    const isIncrease = change > 0

    return (
      <div className="flex items-center gap-1">
        {isIncrease ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span className={isIncrease ? "text-green-600" : "text-red-600"}>
          {formatCurrency(Math.abs(change))}
        </span>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Changed At</TableHead>
          <TableHead>Needs Budget</TableHead>
          <TableHead>Wants Budget</TableHead>
          <TableHead>Savings Budget</TableHead>
          {showReason && <TableHead>Reason</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((entry) => {
          const needsChange = calculateChange(entry.old_needs_budget, entry.new_needs_budget)
          const wantsChange = calculateChange(entry.old_wants_budget, entry.new_wants_budget)
          const savingsChange = calculateChange(entry.old_savings_budget, entry.new_savings_budget)

          return (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{formatDate(entry.changed_at)}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    {formatCurrency(entry.old_needs_budget)} →{" "}
                    {formatCurrency(entry.new_needs_budget)}
                  </div>
                  {renderChangeIndicator(needsChange)}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    {formatCurrency(entry.old_wants_budget)} →{" "}
                    {formatCurrency(entry.new_wants_budget)}
                  </div>
                  {renderChangeIndicator(wantsChange)}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    {formatCurrency(entry.old_savings_budget)} →{" "}
                    {formatCurrency(entry.new_savings_budget)}
                  </div>
                  {renderChangeIndicator(savingsChange)}
                </div>
              </TableCell>
              {showReason && (
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {entry.change_reason || "No reason provided"}
                  </span>
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
