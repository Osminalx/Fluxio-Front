"use client"

import { motion } from "framer-motion"
import { Edit, MoreHorizontal, Plus, Sparkles, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { useDeleteGoalMutation, useGoalsQuery } from "@/lib/goal-queries"
import { cn } from "@/lib/utils"
import type { Goal } from "@/types/goal"
import { GoalForm } from "./goal-form"
import { GoalQuickAdd } from "./goal-quick-add"

export function GoalsList() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [quickAddGoal, setQuickAddGoal] = useState<Goal | null>(null)

  const { data: goals, isLoading } = useGoalsQuery()
  const deleteGoal = useDeleteGoalMutation()

  const goalsList = Array.isArray(goals) ? goals : []

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowGoalForm(true)
  }

  const handleQuickAdd = (goal: Goal) => {
    setQuickAddGoal(goal)
  }

  const handleDeleteGoal = async (goal: Goal) => {
    try {
      await deleteGoal.mutateAsync(goal.id)
      toast.success("Goal deleted successfully")
    } catch (_e) {
      toast.error("Failed to delete goal")
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) {
      return "from-green-500 to-emerald-600"
    }
    if (progress >= 75) {
      return "from-blue-500 to-cyan-500"
    }
    if (progress >= 50) {
      return "from-purple-500 to-blue-500"
    }
    if (progress >= 25) {
      return "from-yellow-500 to-orange-500"
    }
    return "from-primary to-accent"
  }

  const getMilestoneIcon = (progress: number) => {
    if (progress >= 100) {
      return "🎉"
    }
    if (progress >= 75) {
      return "⭐"
    }
    if (progress >= 50) {
      return "🔥"
    }
    if (progress >= 25) {
      return "✨"
    }
    return null
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
            <TableHead className="min-w-[200px]">Goal Name</TableHead>
            <TableHead className="w-[140px] text-right">Target</TableHead>
            <TableHead className="w-[140px] text-right">Saved</TableHead>
            <TableHead className="w-[200px]">Progress</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
            <TableHead className="w-[70px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goalsList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No goals found. Create your first savings goal to get started!
              </TableCell>
            </TableRow>
          ) : (
            goalsList.map((goal, index) => {
              const milestoneIcon = getMilestoneIcon(goal.progress_percent)
              const isComplete = goal.progress_percent >= 100
              return (
                <TableRow
                  key={goal.id}
                  className="hover:bg-muted/50 transition-colors duration-200"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {milestoneIcon && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 2,
                            delay: index * 0.2,
                          }}
                          className="text-lg"
                        >
                          {milestoneIcon}
                        </motion.span>
                      )}
                      <span className={isComplete ? "line-through text-muted-foreground" : ""}>
                        {goal.name}
                      </span>
                      {isComplete && (
                        <Badge variant="default" className="ml-2 bg-green-600">
                          Complete!
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(goal.total_amount)}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn("font-semibold", isComplete && "text-green-600")}>
                      {formatCurrency(goal.saved_amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(goal)}
                        disabled={isComplete}
                        className="flex-1 relative group cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                        aria-label={`Quick add to ${goal.name}`}
                      >
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-primary/20">
                          <div
                            className={cn(
                              "h-full transition-all duration-500 ease-out bg-gradient-to-r",
                              getProgressColor(goal.progress_percent)
                            )}
                            style={{ width: `${goal.progress_percent}%` }}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="bg-background/90 backdrop-blur-sm rounded-full p-1 shadow-lg"
                          >
                            <Plus className="h-3 w-3 text-primary" />
                          </motion.div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 min-w-[4rem] justify-end">
                        <span className="text-sm font-medium">
                          {goal.progress_percent.toFixed(0)}%
                        </span>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuickAdd(goal)}
                        disabled={isComplete}
                        className={cn(
                          "rounded-full p-1.5 transition-all",
                          "bg-primary/10 hover:bg-primary/20",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        )}
                        aria-label={`Quick add to ${goal.name}`}
                        title="Quick add to goal"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </motion.button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={goal.status === "active" ? "default" : "secondary"}
                      className="persona-badge"
                    >
                      {goal.status}
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
                        <DropdownMenuItem
                          onClick={() => handleQuickAdd(goal)}
                          disabled={isComplete}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Goal
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteGoal(goal)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Goal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {showGoalForm && (
        <GoalForm open={showGoalForm} onOpenChange={setShowGoalForm} editingGoal={selectedGoal} />
      )}

      {quickAddGoal && (
        <GoalQuickAdd
          goal={quickAddGoal}
          open={!!quickAddGoal}
          onOpenChange={(open) => !open && setQuickAddGoal(null)}
        />
      )}
    </div>
  )
}
