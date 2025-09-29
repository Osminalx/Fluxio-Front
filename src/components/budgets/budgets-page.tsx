"use client"

import { useState } from "react"
import type { Budget } from "@/types/budgets"
import { BudgetDetails } from "./budget-details"
import { BudgetsList } from "./budgets-list"

export function BudgetsPage() {
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  const handleBudgetSelect = (budget: Budget) => {
    setSelectedBudget(budget)
  }

  const handleBackToList = () => {
    setSelectedBudget(null)
  }

  if (selectedBudget) {
    return <BudgetDetails budget={selectedBudget} onBack={handleBackToList} />
  }

  return <BudgetsList onBudgetSelect={handleBudgetSelect} />
}

