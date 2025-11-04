"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Plus, Sparkles, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useUpdateGoalMutation } from "@/lib/goal-queries"
import type { Goal } from "@/types/goal"
import { cn } from "@/lib/utils"

interface GoalQuickAddProps {
  goal: Goal
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoalQuickAdd({ goal, open, onOpenChange }: GoalQuickAddProps) {
  const [amount, setAmount] = useState("")
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [previousProgress, setPreviousProgress] = useState(goal.progress_percent)

  const updateGoal = useUpdateGoalMutation()

  useEffect(() => {
    setPreviousProgress(goal.progress_percent)
    setAmount("")
  }, [goal.id, open])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

  const getNewProgress = (additionalAmount: number) => {
    const newSaved = goal.saved_amount + additionalAmount
    return Math.min(100, (newSaved / goal.total_amount) * 100)
  }

  const checkMilestone = (newProgress: number) => {
    const milestones = [25, 50, 75, 100]
    const previousMilestone = Math.floor(previousProgress / 25) * 25
    const newMilestone = Math.floor(newProgress / 25) * 25

    if (newMilestone > previousMilestone && milestones.includes(newMilestone)) {
      return newMilestone
    }
    return null
  }

  const handleQuickAdd = async (quickAmount: number) => {
    const newSaved = goal.saved_amount + quickAmount
    const newProgress = getNewProgress(quickAmount)
    const milestone = checkMilestone(newProgress)

    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        data: { saved_amount: newSaved },
      })

      if (milestone) {
        setIsCelebrating(true)
        toast.success(`🎉 Milestone reached! ${milestone}% complete!`, {
          duration: 4000,
        })
        setTimeout(() => setIsCelebrating(false), 2000)
      } else {
        toast.success(`Added ${formatCurrency(quickAmount)} to your goal!`, {
          icon: "💰",
        })
      }

      onOpenChange(false)
    } catch (_e) {
      toast.error("Failed to update goal")
    }
  }

  const handleCustomAdd = async () => {
    const numAmount = Number.parseFloat(amount)
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const newSaved = goal.saved_amount + numAmount
    const newProgress = getNewProgress(numAmount)
    const milestone = checkMilestone(newProgress)

    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        data: { saved_amount: newSaved },
      })

      if (milestone) {
        setIsCelebrating(true)
        toast.success(`🎉 Milestone reached! ${milestone}% complete!`, {
          duration: 4000,
        })
        setTimeout(() => setIsCelebrating(false), 2000)
      } else {
        toast.success(`Added ${formatCurrency(numAmount)} to your goal!`, {
          icon: "💰",
        })
      }

      onOpenChange(false)
    } catch (_e) {
      toast.error("Failed to update goal")
    }
  }

  const remaining = goal.total_amount - goal.saved_amount
  const quickAmounts = [
    { label: "$50", value: 50 },
    { label: "$100", value: 100 },
    { label: "$250", value: 250 },
    { label: "$500", value: 500 },
  ].filter((item) => item.value <= remaining)

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "from-green-500 to-emerald-600"
    if (progress >= 75) return "from-blue-500 to-cyan-500"
    if (progress >= 50) return "from-purple-500 to-blue-500"
    if (progress >= 25) return "from-yellow-500 to-orange-500"
    return "from-primary to-accent"
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] persona-modal">
          <DialogHeader>
            <DialogTitle className="persona-title flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Add to {goal.name}
            </DialogTitle>
            <DialogDescription>
              Track your progress and celebrate milestones as you reach your goal!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Progress</span>
                <span className="font-semibold">{goal.progress_percent.toFixed(1)}%</span>
              </div>
              <div className="relative">
                <Progress
                  value={goal.progress_percent}
                  className={cn(
                    "h-4 transition-all duration-500",
                    `bg-gradient-to-r ${getProgressColor(goal.progress_percent)}`
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-0 rounded-full transition-all duration-500",
                    `bg-gradient-to-r ${getProgressColor(goal.progress_percent)} opacity-20`
                  )}
                  style={{ width: `${goal.progress_percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(goal.saved_amount)} saved</span>
                <span>{formatCurrency(remaining)} remaining</span>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Add</Label>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((item) => (
                  <motion.button
                    key={item.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAdd(item.value)}
                    disabled={updateGoal.isPending || item.value > remaining}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border-2 p-3 transition-all",
                      "hover:border-primary hover:bg-primary/10 hover:shadow-md",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "persona-hover"
                    )}
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="custom-amount" className="text-sm font-medium">
                Custom Amount
              </Label>
              <div className="flex gap-2">
                <Input
                  id="custom-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remaining}
                  placeholder={formatCurrency(remaining)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="persona-input"
                />
                <Button
                  onClick={handleCustomAdd}
                  disabled={updateGoal.isPending || !amount || Number.parseFloat(amount) > remaining}
                  className="persona-glow bg-gradient-to-r from-primary to-accent"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              {amount && Number.parseFloat(amount) > remaining && (
                <p className="text-xs text-destructive">
                  Amount exceeds remaining goal ({formatCurrency(remaining)})
                </p>
              )}
            </div>

            {/* Next Milestone Indicator */}
            {goal.progress_percent < 100 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Next milestone:{" "}
                    <span className="font-semibold text-primary">
                      {Math.ceil(goal.progress_percent / 25) * 25}%
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="persona-hover">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration Animation */}
      <AnimatePresence>
        {isCelebrating && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

