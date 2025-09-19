import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FinancialCardProps {
  title: string
  amount: number
  change: number
  icon: LucideIcon
  trend: "up" | "down"
}

export function FinancialCard({ title, amount, change, icon: Icon, trend }: FinancialCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatChange = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <Card className="persona-card p-6 persona-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl font-bold">{formatCurrency(amount)}</h3>
          <span
            className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              trend === "up" ? "status-positive bg-emerald-500/10" : "status-negative bg-red-500/10"
            )}
          >
            {formatChange(change)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {trend === "up" ? "↗" : "↘"} vs last month
        </p>
      </div>
    </Card>
  )
}
