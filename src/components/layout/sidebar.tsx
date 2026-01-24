"use client"

import {
  CreditCard,
  Home,
  LogOut,
  Menu,
  PieChart,
  Receipt,
  Settings,
  Target,
  TrendingUp,
  Wallet,
  X,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from "@/lib/auth-queries"
import { cn } from "@/lib/utils"
import { useUser } from "@/stores/auth-store"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Bank Accounts", href: "/bank-accounts", icon: Wallet },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Incomes", href: "/incomes", icon: DollarSign },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Cards", href: "/cards", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const user = useUser()
  const logoutMutation = useLogout()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      // Redirect to login after logout
      router.push("/login")
    } catch (_error) {
      // Even if logout fails, redirect to login
      router.push("/login")
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header - Logo/Branding */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-sidebar-border transition-all duration-300",
          isCollapsed ? "p-3 justify-center" : "p-4"
        )}
      >
        {!isCollapsed && (
          <>
            <div className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-semibold text-lg persona-title bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FluxIO
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="persona-hover h-8 w-8"
              title="Collapse sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
        {isCollapsed && (
          <div className="relative group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg ring-2 ring-primary/20 mx-auto cursor-pointer">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            {/* Tooltip for logo */}
            <span className="absolute left-full ml-3 px-3 py-2 text-xs font-medium text-popover-foreground bg-popover border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
              FluxIO
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto overflow-x-hidden", isCollapsed ? "p-2" : "p-4")}>
        <ul className={cn("space-y-1", isCollapsed && "flex flex-col items-center")}>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name} className={cn(isCollapsed && "w-full flex justify-center")}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-all duration-200 persona-nav-item group relative",
                    isCollapsed ? "justify-center px-3 py-3 w-12 h-12" : "space-x-3 px-3 py-2",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground persona-glow shadow-lg"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(isCollapsed ? "h-6 w-6" : "h-5 w-5", isActive && "text-primary")}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-3 py-2 text-xs font-medium text-popover-foreground bg-popover border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-sidebar-border transition-all duration-300",
          isCollapsed ? "p-2 space-y-2" : "p-4 space-y-3"
        )}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-2">
            {/* User Profile - Collapsed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild={true}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 border-2 border-sidebar-border hover:border-primary/50 transition-all duration-200 persona-hover group relative"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  {/* Tooltip */}
                  <span className="absolute left-full ml-3 px-3 py-2 text-xs font-medium text-popover-foreground bg-popover border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {user?.name || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                className="w-64 ml-2 bg-sidebar border-sidebar-border"
              >
                <div className="p-3 space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sidebar-foreground truncate">
                        {user?.name || "User Account"}
                      </p>
                      <p className="text-xs text-sidebar-foreground/60 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-sidebar-border" />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            {/* User Profile - Expanded */}
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-br from-sidebar-accent/40 to-sidebar-accent/20 border border-sidebar-border/50 shadow-lg hover:shadow-xl transition-all duration-200 persona-hover">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-sidebar shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user?.name || "User Account"}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 persona-hover text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/40 transition-all duration-200"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </>
        )}
      </div>

      {/* Collapse Button - Only show when collapsed */}
      {isCollapsed && (
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="w-full persona-hover h-10 w-10"
            title="Expand sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
