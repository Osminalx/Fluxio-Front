"use client"

import {
  CreditCard,
  Home,
  Menu,
  PieChart,
  Receipt,
  Settings,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Bank Accounts", href: "/bank-accounts", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: Target },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Cards", href: "/cards", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-lg persona-title">FluxIO</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="persona-hover"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 persona-nav-item",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground persona-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        {isCollapsed ? (
          <Button variant="ghost" size="icon" className="w-full">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full" />
          </Button>
        ) : (
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent/30">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">User Account</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">user@example.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
