"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IncomesList } from "./incomes-list"
import { IncomeForm } from "./income-form"

export function IncomesPage() {
  const [showIncomeForm, setShowIncomeForm] = useState(false)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold persona-title bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Income Management
          </h1>
          <p className="text-muted-foreground mt-2">Track money coming into your accounts</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowIncomeForm(true)}
            className="persona-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="h-4 w-4" />
            Add Income
          </Button>
        </div>
      </div>

      <Card className="persona-card">
        <CardHeader>
          <CardTitle>Recent Incomes</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomesList />
        </CardContent>
      </Card>

      {showIncomeForm && (
        <IncomeForm open={showIncomeForm} onOpenChange={setShowIncomeForm} editingIncome={null} />
      )}
    </div>
  )
}









