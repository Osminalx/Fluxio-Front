"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, DollarSign, Loader2, X } from "lucide-react"
import { useEffect, useId } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useCreateBankAccount, useUpdateBankAccount } from "@/lib/bank-account-queries"
import {
  type BankAccount,
  type CreateBankAccountRequest,
  createBankAccountSchema,
} from "@/types/bank-account"

interface BankAccountFormProps {
  account?: BankAccount | null
  onClose: () => void
  onSuccess?: () => void
}

export function BankAccountForm({ account, onClose, onSuccess }: BankAccountFormProps) {
  const isEditing = !!account
  const createMutation = useCreateBankAccount()
  const updateMutation = useUpdateBankAccount()

  const accountNameId = useId()
  const balanceId = useId()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateBankAccountRequest>({
    resolver: zodResolver(createBankAccountSchema),
    defaultValues: {
      // biome-ignore lint/style/useNamingConvention: API uses snake_case
      account_name: account?.account_name || "",
      balance: account?.balance || 0,
    },
  })

  // Reset form when account changes
  useEffect(() => {
    if (account) {
      reset({
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        account_name: account.account_name,
        balance: account.balance,
      })
    } else {
      reset({
        // biome-ignore lint/style/useNamingConvention: API uses snake_case
        account_name: "",
        balance: 0,
      })
    }
  }, [account, reset])

  const onSubmit = async (data: CreateBankAccountRequest) => {
    try {
      if (isEditing && account) {
        await updateMutation.mutateAsync({
          id: account.id,
          data: data,
        })
      } else {
        await createMutation.mutateAsync(data)
      }

      onSuccess?.()
      onClose()
    } catch {
      // Error handling is done by the mutation
    }
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto persona-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">
                {isEditing ? "Edit Bank Account" : "Add Bank Account"}
              </CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={accountNameId}>Account Name</Label>
              <input
                {...register("account_name")}
                id={accountNameId}
                type="text"
                placeholder="e.g., Main Checking Account"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              />
              {errors.account_name && (
                <p className="text-sm text-destructive">{errors.account_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={balanceId}>Initial Balance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  {...register("balance", {
                    valueAsNumber: true,
                  })}
                  id={balanceId}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>
              {errors.balance && (
                <p className="text-sm text-destructive">{errors.balance.message}</p>
              )}
            </div>

            {(createMutation.error || updateMutation.error) && (
              <div className="rounded-md bg-destructive/15 p-3">
                <p className="text-sm text-destructive">
                  {createMutation.error?.message || updateMutation.error?.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="persona" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Account" : "Create Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
