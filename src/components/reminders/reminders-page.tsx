"use client"

import { Bell, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useOverdueRemindersQuery, useReminderStatsQuery } from "@/lib/reminder-queries"
import { RemindersList } from "./reminders-list"
import { ReminderForm } from "./reminder-form"

export function RemindersPage() {
  const [showReminderForm, setShowReminderForm] = useState(false)
  const { data: overdueReminders } = useOverdueRemindersQuery()
  const { data: stats } = useReminderStatsQuery()

  const overdueCount = Array.isArray(overdueReminders) ? overdueReminders.length : 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold persona-title bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Reminders
          </h1>
          <p className="text-muted-foreground mt-2">
            Stay on top of bills, goals, and budget reviews
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowReminderForm(true)}
            className="persona-glow bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="h-4 w-4" />
            New Reminder
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="persona-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="persona-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card className="persona-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>
          <Card className="persona-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total - stats.completed - stats.overdue}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {overdueCount > 0 && (
        <Card className="persona-card border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Bell className="h-5 w-5" />
              {overdueCount} Overdue Reminder{overdueCount !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <Card className="persona-card">
        <CardHeader>
          <CardTitle>All Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <RemindersList />
        </CardContent>
      </Card>

      {showReminderForm && (
        <ReminderForm open={showReminderForm} onOpenChange={setShowReminderForm} editingReminder={null} />
      )}
    </div>
  )
}

