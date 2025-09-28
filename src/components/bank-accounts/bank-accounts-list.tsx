"use client"

import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CheckCircle,
  ChevronDown,
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import {
  useBankAccounts,
  useDeleteBankAccount,
  useRestoreBankAccount,
  useUpdateBankAccountStatus,
} from "@/lib/bank-account-queries"
import { cn } from "@/lib/utils"
import type { BankAccount } from "@/types/bank-account"

interface BankAccountsListProps {
  onCreateAccount: () => void
  onEditAccount: (account: BankAccount) => void
  showDeleted?: boolean
}

export function BankAccountsList({
  onCreateAccount,
  onEditAccount,
  showDeleted = false,
}: BankAccountsListProps) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    accountId: string | null
    accountName: string
  }>({
    isOpen: false,
    accountId: null,
    accountName: "",
  })

  const {
    data: accountsData,
    isLoading,
    error,
  } = useBankAccounts({
    // biome-ignore lint/style/useNamingConvention: API uses snake_case
    include_deleted: showDeleted,
  })
  const deleteAccountMutation = useDeleteBankAccount()
  const restoreAccountMutation = useRestoreBankAccount()
  const updateStatusMutation = useUpdateBankAccountStatus()

  const handleDeleteAccount = (id: string, accountName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      accountId: id,
      accountName,
    })
  }

  const confirmDeleteAccount = async () => {
    if (deleteConfirmation.accountId) {
      try {
        await deleteAccountMutation.mutateAsync(deleteConfirmation.accountId)
      } catch {
        // Error handling is done by the mutation
      } finally {
        // Always close the modal, regardless of success or failure
        setDeleteConfirmation({ isOpen: false, accountId: null, accountName: "" })
      }
    }
  }

  const cancelDeleteAccount = () => {
    setDeleteConfirmation({ isOpen: false, accountId: null, accountName: "" })
  }

  const handleRestoreAccount = async (id: string) => {
    try {
      await restoreAccountMutation.mutateAsync(id)
    } catch {
      // Error handling is done by the mutation
    }
  }

  const handleStatusChange = async (account: BankAccount, newStatus: BankAccount["status"]) => {
    if (newStatus === account.status) {
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: account.id,
        data: { status: newStatus },
      })
      setStatusDropdownOpen(null)
    } catch {
      // Error handling is done by the mutation
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active"
      case "suspended":
        return "Suspended"
      case "deleted":
        return "Deleted"
      case "archived":
        return "Archived"
      case "pending":
        return "Pending"
      case "locked":
        return "Locked"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const availableStatuses: BankAccount["status"][] = [
    "active",
    "suspended",
    "archived",
    "pending",
    "locked",
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (
        !target.closest("[data-dropdown-trigger]") &&
        !target.closest("[data-dropdown-content]")
      ) {
        setStatusDropdownOpen(null)
      }
    }

    if (statusDropdownOpen) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [statusDropdownOpen])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "suspended":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "deleted":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "archived":
        return <XCircle className="h-4 w-4 text-gray-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "locked":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-700 bg-green-50 border-green-200"
      case "suspended":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      case "deleted":
        return "text-red-700 bg-red-50 border-red-200"
      case "archived":
        return "text-gray-700 bg-gray-50 border-gray-200"
      case "pending":
        return "text-blue-700 bg-blue-50 border-blue-200"
      case "locked":
        return "text-red-800 bg-red-100 border-red-300"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <Card className="persona-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="persona-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mr-2" />
            <span>Failed to load bank accounts</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const allAccounts = accountsData?.bank_accounts || []

  // Filter accounts based on showDeleted prop
  const accounts = showDeleted
    ? allAccounts.filter(
        (account) =>
          account.status === "deleted" ||
          account.status === "suspended" ||
          account.status === "locked"
      )
    : allAccounts.filter((account) => account.status !== "deleted")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold persona-title">
            {showDeleted ? "Deleted Bank Accounts" : "Bank Accounts"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {showDeleted
              ? "Manage your deleted bank accounts"
              : "Manage your bank accounts and balances"}
          </p>
        </div>
        {!showDeleted && (
          <Button variant="persona" className="gap-2" onClick={onCreateAccount}>
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        )}
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <Card className="persona-card">
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {showDeleted ? "No deleted accounts" : "No bank accounts yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {showDeleted
                ? "You don't have any deleted bank accounts."
                : "Get started by adding your first bank account."}
            </p>
            {!showDeleted && (
              <Button variant="persona" onClick={onCreateAccount}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className={cn(
                "persona-card cursor-pointer transition-all duration-200 hover:shadow-lg relative",
                selectedAccount === account.id && "ring-2 ring-primary",
                statusDropdownOpen === account.id && "z-50"
              )}
              onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {account.account_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(account.status)}
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            getStatusColor(account.status)
                          )}
                        >
                          {getStatusLabel(account.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedAccount(selectedAccount === account.id ? null : account.id)
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold persona-title">
                      {formatCurrency(account.balance)}
                    </p>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(account.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Updated</p>
                      <p className="font-medium">{formatDate(account.updated_at)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedAccount === account.id && (
                    <div className="flex gap-2 pt-2 border-t">
                      {showDeleted ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRestoreAccount(account.id)
                          }}
                          disabled={restoreAccountMutation.isPending}
                        >
                          <RefreshCw
                            className={cn(
                              "h-4 w-4 mr-2",
                              restoreAccountMutation.isPending && "animate-spin"
                            )}
                          />
                          Restore
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditAccount(account)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <div className="relative" data-account-id={account.id}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setStatusDropdownOpen(
                                  statusDropdownOpen === account.id ? null : account.id
                                )
                              }}
                              disabled={updateStatusMutation.isPending}
                              className="gap-1"
                              data-dropdown-trigger={true}
                            >
                              Change Status
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 transition-transform duration-200",
                                  statusDropdownOpen === account.id && "rotate-180"
                                )}
                              />
                            </Button>
                            {statusDropdownOpen === account.id && (
                              <div
                                className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl min-w-[160px] max-h-64 overflow-y-auto"
                                data-dropdown-content={true}
                                style={{ zIndex: 9999 }}
                              >
                                {availableStatuses.map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    className={cn(
                                      "w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-all duration-150 first:rounded-t-lg last:rounded-b-lg flex items-center gap-3 border-b border-gray-100 last:border-b-0 cursor-pointer",
                                      account.status === status &&
                                        "bg-blue-50 text-blue-700 font-semibold",
                                      updateStatusMutation.isPending &&
                                        "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStatusChange(account, status)
                                    }}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    {getStatusIcon(status)}
                                    <span className="flex-1">{getStatusLabel(status)}</span>
                                    {account.status === status && (
                                      <CheckCircle className="h-3 w-3 text-blue-600" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAccount(account.id, account.account_name)
                            }}
                            disabled={deleteAccountMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {accounts.length > 0 && (
        <Card className="persona-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Account Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {showDeleted ? (
                    <>
                      <div>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(
                            accounts
                              .filter((acc) => acc.status === "deleted")
                              .reduce((sum, acc) => sum + acc.balance, 0)
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Deleted Balance</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {accounts.filter((acc) => acc.status === "deleted").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Deleted Accounts</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">
                          {
                            accounts.filter(
                              (acc) => acc.status === "suspended" || acc.status === "locked"
                            ).length
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">Suspended/Locked</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(
                            accounts
                              .filter((acc) => acc.status === "active")
                              .reduce((sum, acc) => sum + acc.balance, 0)
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Active Balance</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {accounts.filter((acc) => acc.status === "active").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Active Accounts</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-muted-foreground">
                          {accounts.filter((acc) => acc.status !== "active").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Inactive Accounts</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm">
                View Details
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDeleteAccount}
        onConfirm={confirmDeleteAccount}
        title="Delete Bank Account"
        description={`Are you sure you want to delete "${deleteConfirmation.accountName}"? This action cannot be undone.`}
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  )
}
