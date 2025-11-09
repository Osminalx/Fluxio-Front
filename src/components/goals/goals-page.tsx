"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoalsList } from "./goals-list"
import { GoalForm } from "./goal-form"

export function GoalsPage() {
  const [showGoalForm, setShowGoalForm] = useState(false)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold persona-title bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Savings Goals
          </h1>
          <p className="text-muted-foreground mt-2">Track your progress towards financial goals</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowGoalForm(true)}
            className="persona-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        </div>
      </div>

      <Card className="persona-card">
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalsList />
        </CardContent>
      </Card>

      {showGoalForm && (
        <GoalForm open={showGoalForm} onOpenChange={setShowGoalForm} editingGoal={null} />
      )}
    </div>
  )
}



