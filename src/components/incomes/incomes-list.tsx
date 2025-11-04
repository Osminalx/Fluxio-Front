"use client"

import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDeleteIncomeMutation, useIncomesQuery } from "@/lib/income-queries"
import type { Income } from "@/types/income"
import { IncomeForm } from "./income-form"

export function IncomesList() {
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
  const [showIncomeForm, setShowIncomeForm] = useState(false)

  const { data: incomes, isLoading } = useIncomesQuery()
  const deleteIncome = useDeleteIncomeMutation()

  const incomesList = Array.isArray(incomes) ? incomes : []

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const handleEditIncome = (income: Income) => {
    setSelectedIncome(income)
    setShowIncomeForm(true)
  }

  const handleDeleteIncome = async (income: Income) => {
    try {
      await deleteIncome.mutateAsync(income.id)
      toast.success("Income deleted successfully")
    } catch (_e) {
      toast.error("Failed to delete income")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="-mx-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Date</TableHead>
            <TableHead className="min-w-[220px]">Account</TableHead>
            <TableHead className="w-[140px] text-right">Amount</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
            <TableHead className="w-[70px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomesList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No incomes found. Add your first income to get started!
              </TableCell>
            </TableRow>
          ) : (
            incomesList.map((income) => (
              <TableRow key={income.id} className="hover:bg-muted/50 transition-colors duration-200">
                <TableCell className="font-medium">{formatDate(income.date)}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground truncate block">
                    {income.bank_account?.account_name || "Unknown"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-lg">{formatCurrency(income.amount)}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={income.status === "active" ? "default" : "secondary"}
                    className="persona-badge"
                  >
                    {income.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild={true}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEditIncome(income)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Income
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteIncome(income)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Income
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showIncomeForm && (
        <IncomeForm
          open={showIncomeForm}
          onOpenChange={setShowIncomeForm}
          editingIncome={selectedIncome}
        />
      )}
    </div>
  )
}









