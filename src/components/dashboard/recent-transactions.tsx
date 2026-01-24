import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category: string
  type?: "expense" | "income"
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-orange-500/10 text-orange-500",
      Income: "bg-green-500/10 text-green-500",
      Utilities: "bg-blue-500/10 text-blue-500",
      Transportation: "bg-purple-500/10 text-purple-500",
      Shopping: "bg-pink-500/10 text-pink-500",
      Entertainment: "bg-yellow-500/10 text-yellow-500",
    }
    return colors[category] || "bg-gray-500/10 text-gray-500"
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent transactions</p>
        <p className="text-sm mt-1">Start by adding expenses or income</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                getCategoryColor(transaction.category)
              )}
            >
              {transaction.category}
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "font-semibold",
                transaction.amount >= 0 ? "status-positive" : "status-negative"
              )}
            >
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
