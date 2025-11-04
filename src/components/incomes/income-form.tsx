"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBankAccounts } from "@/lib/bank-account-queries"
import { useCreateIncomeMutation, useUpdateIncomeMutation } from "@/lib/income-queries"
import { type CreateIncomeRequest, createIncomeSchema, type Income } from "@/types/income"

interface IncomeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingIncome?: Income | null
}

export function IncomeForm({ open, onOpenChange, editingIncome }: IncomeFormProps) {
  const form = useForm<CreateIncomeRequest>({
    resolver: zodResolver(createIncomeSchema),
    defaultValues: {
      amount: 0,
      bank_account_id: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  useEffect(() => {
    if (editingIncome) {
      form.reset({
        amount: editingIncome.amount,
        bank_account_id: editingIncome.bank_account_id,
        date: editingIncome.date.split("T")[0],
      })
    } else {
      form.reset({ amount: 0, bank_account_id: "", date: new Date().toISOString().split("T")[0] })
    }
  }, [editingIncome, form])

  const createIncome = useCreateIncomeMutation()
  const updateIncome = useUpdateIncomeMutation()
  const { data: bankAccountsData } = useBankAccounts()
  const bankAccounts = bankAccountsData?.items ?? []

  const onSubmit = async (data: CreateIncomeRequest) => {
    try {
      if (editingIncome) {
        await updateIncome.mutateAsync({ id: editingIncome.id, data })
        toast.success("Income updated successfully!")
      } else {
        await createIncome.mutateAsync(data)
        toast.success("Income added successfully!")
      }
      form.reset()
      onOpenChange(false)
    } catch (_e) {
      toast.error(editingIncome ? "Failed to update income" : "Failed to add income")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] persona-modal">
        <DialogHeader>
          <DialogTitle className="persona-title">
            {editingIncome ? "Edit Income" : "Add New Income"}
          </DialogTitle>
          <DialogDescription>
            {editingIncome
              ? "Update your income entry. Bank account balances update automatically."
              : "Record incoming money. Bank account balances update automatically."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        className="persona-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="persona-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bank_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="persona-input">
                        <SelectValue placeholder="Select a bank account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.account_name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ${account.real_balance.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="persona-hover">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createIncome.isPending || updateIncome.isPending}
                className="persona-glow bg-gradient-to-r from-primary to-accent"
              >
                {createIncome.isPending || updateIncome.isPending
                  ? editingIncome
                    ? "Updating..."
                    : "Adding..."
                  : editingIncome
                    ? "Update Income"
                    : "Add Income"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}




