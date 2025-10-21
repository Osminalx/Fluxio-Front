"use client"

import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBankAccounts } from "@/lib/bank-account-queries"
import { useGroupedCategoriesQuery } from "@/lib/category-queries"
import type { Category } from "@/types/category"

export interface ExpenseFilters {
  searchTerm: string
  startDate?: string
  endDate?: string
  bankAccountId?: string | "all"
  categoryId?: string | "all"
  status?: string | "all"
  minAmount?: number
  maxAmount?: number
}

interface AdvancedFiltersProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ExpenseFilters
  onFiltersChange: (filters: ExpenseFilters) => void
}

export function AdvancedFilters({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: AdvancedFiltersProps) {
  const { data: bankAccountsData } = useBankAccounts()
  const { data: groupedCategoriesData } = useGroupedCategoriesQuery()

  const bankAccounts = Array.isArray(bankAccountsData) ? bankAccountsData : []
  const groupedCategories = groupedCategoriesData || { needs: [], wants: [], savings: [] }

  const handleFilterChange = (key: keyof ExpenseFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      startDate: undefined,
      endDate: undefined,
      bankAccountId: "all",
      categoryId: "all",
      status: "all",
      minAmount: undefined,
      maxAmount: undefined,
    })
  }

  const applyFilters = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] persona-modal">
        <DialogHeader>
          <DialogTitle className="persona-title flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </DialogTitle>
          <DialogDescription>
            Filter your expenses by date range, account, category, and amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
                  className="persona-input"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
                  className="persona-input"
                />
              </div>
            </div>
          </div>

          {/* Bank Account */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Bank Account</Label>
            <Select
              value={filters.bankAccountId || ""}
              onValueChange={(value) => handleFilterChange("bankAccountId", value || undefined)}
            >
              <SelectTrigger className="persona-input">
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Category</Label>
            <Select
              value={filters.categoryId || ""}
              onValueChange={(value) => handleFilterChange("categoryId", value || undefined)}
            >
              <SelectTrigger className="persona-input">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {Object.entries(groupedCategories).map(([expenseType, categories]) => (
                  <div key={expenseType}>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                      {expenseType.charAt(0).toUpperCase() + expenseType.slice(1)}
                    </div>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id} className="pl-6">
                        {category.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Range */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Amount Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minAmount" className="text-sm text-muted-foreground">
                  Min Amount
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.minAmount || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minAmount",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="persona-input"
                />
              </div>
              <div>
                <Label htmlFor="maxAmount" className="text-sm text-muted-foreground">
                  Max Amount
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.maxAmount || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxAmount",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="persona-input"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Status</Label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) => handleFilterChange("status", value || undefined)}
            >
              <SelectTrigger className="persona-input">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={clearFilters} className="persona-hover">
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="persona-hover"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={applyFilters}
              className="persona-glow bg-gradient-to-r from-primary to-accent"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
