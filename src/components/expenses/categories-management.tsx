"use client"

import { Edit, MoreHorizontal, Plus, RotateCcw, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  useDeleteCategoryMutation,
  useGroupedCategoriesQuery,
  useRestoreCategoryMutation,
} from "@/lib/category-queries"
import type { Category } from "@/types/category"
import { EXPENSE_TYPES, ExpenseTypeUtils } from "@/types/expense-type"
import { CategoryFormDialog } from "./category-form-dialog"

interface CategoriesManagementProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CategoriesManagement({ open, onOpenChange }: CategoriesManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExpenseType, setSelectedExpenseType] = useState<string>("all")
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const { data: groupedCategoriesData, isLoading } = useGroupedCategoriesQuery()
  // const { data: categoryStatsData } = useCategoryStatsQuery() // TODO: Update when category stats are needed
  const deleteCategoryMutation = useDeleteCategoryMutation()
  const restoreCategoryMutation = useRestoreCategoryMutation()

  const groupedCategories = groupedCategoriesData || { needs: [], wants: [], savings: [] }

  // Filter categories based on search and expense type
  const filteredExpenseTypes = EXPENSE_TYPES.map((expenseType) => {
    const categories = (groupedCategories[expenseType.value] || []).filter((category) => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedExpenseType === "all" || expenseType.value === selectedExpenseType
      return matchesSearch && matchesType
    })

    return {
      ...expenseType,
      categories,
    }
  }).filter((expenseType) => selectedExpenseType === "all" || expenseType.categories.length > 0)

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowCategoryForm(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowCategoryForm(true)
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) {
      return
    }

    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id)
      toast.success(`Category "${deletingCategory.name}" deleted successfully`)
      setDeletingCategory(null)
    } catch (_error) {
      toast.error("Failed to delete category")
    }
  }

  const handleRestoreCategory = async (category: Category) => {
    try {
      await restoreCategoryMutation.mutateAsync(category.id)
      toast.success(`Category "${category.name}" restored successfully`)
    } catch (_error) {
      toast.error("Failed to restore category")
    }
  }

  if (isLoading) {
    return (
      <Card className="persona-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const content = (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold persona-title">Category Management</h2>
          <p className="text-muted-foreground">Organize your expenses into meaningful categories</p>
        </div>
        <Button
          onClick={handleAddCategory}
          className="persona-glow bg-gradient-to-r from-primary to-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="persona-card">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="persona-input flex-1"
            />
            <select
              value={selectedExpenseType}
              onChange={(e) => setSelectedExpenseType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              {EXPENSE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Categories by Expense Type */}
      <div className="space-y-6">
        {filteredExpenseTypes.map((expenseType) => {
          const color = ExpenseTypeUtils.getDisplayColor(expenseType.name)
          const percentage = ExpenseTypeUtils.getRecommendedPercentage(expenseType.name)

          return (
            <Card key={expenseType.value} className="persona-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {expenseType.name}
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color,
                            borderColor: color,
                          }}
                        >
                          {percentage}%
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {ExpenseTypeUtils.getDescription(expenseType.name)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="persona-badge">
                    {expenseType.categories.length} categories
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {expenseType.categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No categories in this expense type yet.</p>
                    <Button
                      variant="outline"
                      className="mt-2 persona-hover"
                      onClick={handleAddCategory}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Category
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expenseType.categories.map((category) => {
                      return (
                        <div
                          key={category.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 persona-hover"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{category.name}</h4>
                              <Badge
                                variant="outline"
                                className="text-xs mt-1"
                                style={{
                                  borderColor: color,
                                  color: color,
                                }}
                              >
                                {category.status}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild={true}>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {category.status === "deleted" ? (
                                  <DropdownMenuItem onClick={() => handleRestoreCategory(category)}>
                                    <RotateCcw className="h-3 w-3 mr-2" />
                                    Restore
                                  </DropdownMenuItem>
                                ) : (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => setDeletingCategory(category)}
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredExpenseTypes.length === 0 && (
        <Card className="persona-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No categories match your search." : "No categories found."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // If used as a modal
  if (open !== undefined && onOpenChange) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto persona-modal">
            <DialogHeader>
              <DialogTitle className="persona-title">Category Management</DialogTitle>
              <DialogDescription>
                Organize your expenses into meaningful categories following the 50/30/20 philosophy.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">{content}</div>
          </DialogContent>
        </Dialog>

        {/* Category Form Dialog */}
        <CategoryFormDialog
          open={showCategoryForm}
          onOpenChange={setShowCategoryForm}
          category={editingCategory}
          mode={editingCategory ? "edit" : "create"}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onConfirm={handleDeleteCategory}
          title="Delete Category"
          description={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          isLoading={deleteCategoryMutation.isPending}
        />
      </>
    )
  }

  // If used as a regular component
  return (
    <>
      {content}

      {/* Category Form Dialog */}
      <CategoryFormDialog
        open={showCategoryForm}
        onOpenChange={setShowCategoryForm}
        category={editingCategory}
        mode={editingCategory ? "edit" : "create"}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteCategoryMutation.isPending}
      />
    </>
  )
}
