"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BankAccount } from "@/types/bank-account"
import type { Status } from "@/types/status"
import { BankAccountForm } from "./bank-account-form"
import { BankAccountsList } from "./bank-accounts-list"

interface BankAccountsPageProps {
  initialTab?: Extract<Status, "active" | "deleted">
}

export function BankAccountsPage({ initialTab = "active" }: BankAccountsPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)

  const handleCreateAccount = () => {
    setEditingAccount(null)
    setShowForm(true)
  }

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAccount(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingAccount(null)
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as Extract<Status, "active" | "deleted">)}
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="active">Active Accounts</TabsTrigger>
            <TabsTrigger value="deleted">Deleted Accounts</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="space-y-6">
          <BankAccountsList
            onCreateAccount={handleCreateAccount}
            onEditAccount={handleEditAccount}
            showDeleted={false}
          />
        </TabsContent>

        <TabsContent value="deleted" className="space-y-6">
          <BankAccountsList
            onCreateAccount={handleCreateAccount}
            onEditAccount={handleEditAccount}
            showDeleted={true}
          />
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <BankAccountForm
          account={editingAccount}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
