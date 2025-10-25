"use client"

import { DollarSign, Edit, Plus, RotateCcw, Trash2 } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
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
  useActiveBudgets,
  useBudgets,
  useDeleteBudget,
  useDeletedBudgets,
  useRestoreBudget,
} from "@/lib/budget-queries"
import type { Budget } from "@/types/budgets"
import { BudgetForm } from "./budget-form"

interface BudgetsListProps {
  onBudgetSelect?: (budget: Budget) => void
}

export function BudgetsList({ onBudgetSelect }: BudgetsListProps) {
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null)

  // Queries
  // biome-ignore lint/style/useNamingConvention: API uses snake_case
  const { data: allBudgets, isLoading: allLoading } = useBudgets({ include_deleted: true })
  const { data: activeBudgets, isLoading: activeLoading } = useActiveBudgets()
  const { data: deletedBudgets, isLoading: deletedLoading } = useDeletedBudgets()

  // Mutations
  const deleteMutation = useDeleteBudget()
  const restoreMutation = useRestoreBudget()

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      setDeleteConfirmId(null)
    } catch {
      // Handle error silently or show toast notification
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id)
      setRestoreConfirmId(null)
    } catch {
      // Handle error silently or show toast notification
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedBudget(null)
  }

  if (showForm) {
    return (
      <BudgetForm budget={selectedBudget} onClose={handleFormClose} onSuccess={handleFormClose} />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Manage your monthly budgets and track your financial goals.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deleted">Deleted</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Active Budgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : activeBudgets?.budgets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active budgets found.</p>
                  <Button className="mt-4" onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Budget
                  </Button>
                </div>
              ) : (
                <BudgetTable
                  budgets={activeBudgets?.budgets || []}
                  showActions={true}
                  isDeleted={false}
                  onEdit={handleEdit}
                  onDelete={setDeleteConfirmId}
                  onRestore={setRestoreConfirmId}
                  onBudgetSelect={onBudgetSelect}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                All Budgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : allBudgets?.budgets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No budgets found.</p>
                </div>
              ) : (
                <BudgetTable
                  budgets={allBudgets?.budgets || []}
                  showActions={true}
                  isDeleted={false}
                  onEdit={handleEdit}
                  onDelete={setDeleteConfirmId}
                  onRestore={setRestoreConfirmId}
                  onBudgetSelect={onBudgetSelect}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deleted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Deleted Budgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deletedLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : deletedBudgets?.budgets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No deleted budgets found.</p>
                </div>
              ) : (
                <BudgetTable
                  budgets={deletedBudgets?.budgets || []}
                  showActions={true}
                  isDeleted={true}
                  onEdit={handleEdit}
                  onDelete={setDeleteConfirmId}
                  onRestore={setRestoreConfirmId}
                  onBudgetSelect={onBudgetSelect}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      {/* Restore Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!restoreConfirmId}
        onClose={() => setRestoreConfirmId(null)}
        onConfirm={() => restoreConfirmId && handleRestore(restoreConfirmId)}
        title="Restore Budget"
        description="Are you sure you want to restore this budget? It will be moved back to active budgets."
        confirmText="Restore"
        isLoading={restoreMutation.isPending}
      />
    </div>
  )
}

interface BudgetTableProps {
  budgets: Budget[]
  showActions?: boolean
  isDeleted?: boolean
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onBudgetSelect?: (budget: Budget) => void
}

function BudgetTable({
  budgets,
  showActions = true,
  isDeleted = false,
  onEdit,
  onDelete,
  onRestore,
  onBudgetSelect,
}: BudgetTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "deleted":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month/Year</TableHead>
          <TableHead>Needs</TableHead>
          <TableHead>Wants</TableHead>
          <TableHead>Savings</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead className="w-[100px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {budgets.map((budget) => (
          <TableRow
            key={budget.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onBudgetSelect?.(budget)}
          >
            <TableCell className="font-medium">{formatDate(budget.month_year)}</TableCell>
            <TableCell>{formatCurrency(budget.needs_budget)}</TableCell>
            <TableCell>{formatCurrency(budget.wants_budget)}</TableCell>
            <TableCell>{formatCurrency(budget.savings_budget)}</TableCell>
            <TableCell className="font-medium">{formatCurrency(budget.total_budget)}</TableCell>
            <TableCell>
              <Badge variant={getStatusColor(budget.status)}>{budget.status}</Badge>
            </TableCell>
            {showActions && (
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  {isDeleted ? (
                    <Button variant="ghost" size="sm" onClick={() => onRestore(budget.id)}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(budget.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
